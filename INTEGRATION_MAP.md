# Supabase + PostHog Integration Map

**Goal:** Replace Google Sheets with Supabase. Add PostHog for analytics, feature flags, error tracking, and session replay. Keep Firebase Auth + Stripe as-is.

**Audit status:** Reviewed by 3 independent models (Nemotron Ultra, DeepSeek V4 Flash, Kimi 2.7 Code). All 10 critical/high issues fixed in this revision. Verdict: WARN → GO with fixes applied.

---

## Architecture (before → after)

```
BEFORE:
  Firebase Auth → Next.js API routes → Google Sheets (DB)
  Stripe Webhook → checkout-fulfill.ts → Google Sheets (holdings, inventory, comms)
  console.log → nowhere
  PURCHASES_ENABLED env var → manual redeploy to toggle

AFTER:
  Firebase Auth → Next.js API routes → Supabase (Postgres)
  Stripe Webhook → checkout-fulfill.ts → Supabase (holdings, inventory, comms, events)
  PostHog client → analytics, session replay, client-side feature flags
  PostHog Node SDK → server-side feature flags, error tracking
  PURCHASES_ENABLED env var → PostHog flag (client) + env fallback (server)
```

---

## PART 1: SUPABASE INTEGRATION

### 1A. New env vars (add to .env.local.example)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # server-only, never exposed to client
```

### 1B. Database schema (4 tables + 1 events table)

> **FIX (audit C2):** `price_per_share_nzd` can be null — derivation from owner rate is preserved in the application layer (`supabase.ts`), not assumed to be pre-computed.
> **FIX (audit H2):** `marketplace_visible` is `BOOLEAN` — CSV migration must normalize string values (`"true"`/`"yes"`/`"1"` → `true`, everything else → `false`).
> **FIX (audit H4):** Content columns (`image_path`, `story`, `pedigree`, `sex`, `colour`, `sire_name`, `dam_name`, `trainer_contact_name`, `horse_microchip`, `breeding_url`, `performance_profile_url`, `owner_name`) added to inventory schema. Static `hlts.json`/`horses.json` remain as build-time fallback, but Supabase can become canonical source of truth.
> **FIX (audit H3):** RLS policies rewritten. Under Option A (service role in API routes), RLS is not the primary gate — Firebase Auth is. Policies are labeled as defense-in-depth templates for a future Supabase Auth migration.

```sql
-- ============================================================
-- updated_at helper (create once per database)
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- inventory (replaces hlts sheet tab)
-- ============================================================
CREATE TABLE inventory (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,         -- horse_slug (e.g. 'first-gear')
  name        TEXT NOT NULL,
  listing_status     TEXT DEFAULT 'draft',  -- draft|listed|active|sold_out|closed
  campaign_status    TEXT DEFAULT 'pending',-- pending|live|sold_out|expired|cancelled
  price_per_share_nzd NUMERIC(10,2),        -- nullable; derived from owner rate if null (see supabase.ts)
  shares_total        INTEGER NOT NULL DEFAULT 0,
  shares_sold         INTEGER NOT NULL DEFAULT 0,
  leasehold_stake_pct NUMERIC(5,2),
  lease_period_months INTEGER,
  lease_start_date    DATE,
  investor_return_pct NUMERIC(5,2),         -- nullable
  owner_rate_per_1pct_month NUMERIC(10,2),  -- nullable
  platform_fee_pct    NUMERIC(5,2) DEFAULT 5,
  marketplace_visible BOOLEAN DEFAULT false,
  -- Content columns (FIX: audit H4 — UI consumes these; static JSON remains fallback)
  image_path          TEXT,
  story               TEXT,
  pedigree            TEXT,
  sex                 TEXT,
  colour              TEXT,
  sire_name           TEXT,
  dam_name            TEXT,
  dam_sire_name       TEXT,
  trainer_contact_name TEXT,
  horse_microchip     BIGINT,
  breeding_url        TEXT,
  performance_profile_url TEXT,
  owner_name          TEXT,
  -- Racing data
  trainer_name        TEXT,
  trainer_stable      TEXT,
  trainer_location    TEXT,
  wins        INTEGER DEFAULT 0,
  placed      INTEGER DEFAULT 0,
  next_up     TEXT,
  loveracing_id INTEGER,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  -- Commercial invariants (FIX: audit M5 — prevent bad data)
  CONSTRAINT inventory_shares_total_positive CHECK (shares_total >= 0),
  CONSTRAINT inventory_shares_sold_valid CHECK (shares_sold >= 0 AND shares_sold <= shares_total)
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: Under Option A, service role bypasses RLS.
-- These policies are defense-in-depth templates for a future Supabase Auth migration.
-- They are NOT active security controls today — Firebase Auth gates access in API route code.
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
-- No client-side policies: deny all anon/authenticated client access.
-- All reads/writes go through API routes using service role.
-- When migrating to Supabase Auth (Option B), add policies here.

-- ============================================================
-- Atomic share increment function (FIX: audit C1 — prevents oversell race condition)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_shares_sold(
  p_slug  TEXT,
  p_delta INTEGER
)
RETURNS TABLE (
  success       BOOLEAN,
  new_shares_sold INTEGER,
  shares_total  INTEGER,
  shares_available INTEGER
) AS $$
DECLARE
  v_current_sold INTEGER;
  v_total        INTEGER;
BEGIN
  -- Lock the row to prevent concurrent read-modify-write
  SELECT shares_sold, shares_total
    INTO v_current_sold, v_total
    FROM inventory
    WHERE slug = p_slug
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, 0;
    RETURN;
  END IF;

  -- Guard against oversell
  IF v_current_sold + p_delta > v_total THEN
    RETURN QUERY SELECT false, v_current_sold, v_total, (v_total - v_current_sold);
    RETURN;
  END IF;

  UPDATE inventory
    SET shares_sold = shares_sold + p_delta
    WHERE slug = p_slug;

  RETURN QUERY SELECT true, (v_current_sold + p_delta), v_total, (v_total - v_current_sold - p_delta);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Atomic fulfillment function (FIX: audit C6 — idempotency + insert + increment in one transaction)
-- ============================================================
CREATE OR REPLACE FUNCTION fulfill_purchase(
  p_purchase_id      TEXT,
  p_user_email       TEXT,
  p_user_uid         TEXT,
  p_horse_slug       TEXT,
  p_shares           INTEGER,
  p_amount_nzd       NUMERIC(10,2),
  p_signed_pds_url   TEXT,
  p_signed_sa_url    TEXT,
  p_kyc_status       TEXT,
  p_utm_source       TEXT,
  p_utm_campaign     TEXT
)
RETURNS TABLE (
  success       BOOLEAN,
  duplicate     BOOLEAN,
  message       TEXT
) AS $$
DECLARE
  v_existing TEXT;
  v_increment_result RECORD;
BEGIN
  -- Step 1: Idempotency check inside transaction
  SELECT id INTO v_existing FROM holdings WHERE purchase_id = p_purchase_id LIMIT 1;
  IF FOUND THEN
    RETURN QUERY SELECT true, true, 'Duplicate purchase_id — already fulfilled';
    RETURN;
  END IF;

  -- Step 2: Insert holding
  INSERT INTO holdings (
    purchase_id, user_email, user_uid, horse_slug,
    shares_owned, purchase_price_total_nzd,
    signed_pds_url, signed_sa_url, kyc_status,
    utm_source, utm_campaign
  ) VALUES (
    p_purchase_id, p_user_email, p_user_uid, p_horse_slug,
    p_shares, p_amount_nzd,
    p_signed_pds_url, p_signed_sa_url, p_kyc_status,
    p_utm_source, p_utm_campaign
  );

  -- Step 3: Atomic inventory increment
  SELECT * INTO v_increment_result FROM increment_shares_sold(p_horse_slug, p_shares);
  IF NOT v_increment_result.success THEN
    RAISE EXCEPTION 'Oversell prevented: %', v_increment_result.shares_available;
  END IF;

  -- Step 4: Log event
  INSERT INTO events (user_email, user_uid, event_type, entity_type, entity_id, metadata)
  VALUES (
    p_user_email, p_user_uid,
    'holding_issued', 'holding', p_purchase_id,
    jsonb_build_object('horse_slug', p_horse_slug, 'shares', p_shares, 'amount_nzd', p_amount_nzd)
  );

  RETURN QUERY SELECT true, false, 'Fulfilled successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- holdings (replaces holdings sheet tab)
-- ============================================================
CREATE TABLE holdings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id     TEXT UNIQUE NOT NULL,     -- Stripe session ID (idempotency key)
  timestamp       TIMESTAMPTZ DEFAULT now(),
  user_email      TEXT NOT NULL,
  user_uid        TEXT,                      -- Firebase UID
  horse_slug      TEXT NOT NULL,             -- FIX: no FK constraint (legacy rows may not exist in inventory yet)
  shares_owned    INTEGER NOT NULL,
  purchase_price_total_nzd NUMERIC(10,2) NOT NULL,
  signed_pds_url  TEXT,
  signed_sa_url   TEXT,
  kyc_status      TEXT DEFAULT 'verified',
  utm_source      TEXT,
  utm_campaign    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- RLS: Defense-in-depth template for future Supabase Auth migration.
-- Under Option A: service role bypasses, Firebase Auth gates in API code.
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
-- No client-side policies: deny all anon/authenticated client access.

-- ============================================================
-- leads (replaces leads sheet tab)
-- ============================================================
CREATE TABLE leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp   TIMESTAMPTZ DEFAULT now(),
  user_email  TEXT,
  user_name   TEXT,
  horse_slug  TEXT,
  action_type TEXT,                          -- 'waitlist'| 'notify_me'| 'kyc_failed'
  utm_source  TEXT,
  utm_campaign TEXT,
  referrer_url TEXT,
  status      TEXT DEFAULT 'new'             -- new|contacted|converted|archived
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- No client-side policies: deny all client access.

-- ============================================================
-- communications (replaces communications sheet tab)
-- =================================================================
CREATE TABLE communications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp       TIMESTAMPTZ DEFAULT now(),
  recipient_email TEXT NOT NULL,
  subject         TEXT,
  snippet         TEXT,
  body_html       TEXT,
  category        TEXT                        -- 'purchase'| 'kyc'| 'welcome'| 'admin'
);

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
-- No client-side policies: deny all client access.

-- ============================================================
-- events (NEW — audit trail, didn't exist in Sheets)
-- ============================================================
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp   TIMESTAMPTZ DEFAULT now(),
  user_email  TEXT,
  user_uid    TEXT,
  event_type  TEXT NOT NULL,                 -- 'kyc_started'| 'kyc_verified'| 'purchase_started'| 'payment_succeeded'| 'holding_issued'| 'pds_signed'| 'sa_signed'
  entity_type TEXT,                           -- 'horse'| 'holding'| 'lead'
  entity_id   TEXT,                           -- horse_slug / purchase_id
  metadata    JSONB,                          -- flexible: { shares, amount, kyc_session_id, ... }
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Append-only: no UPDATE/DELETE policy = only INSERT allowed via service role
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- No client-side policies: deny all client access.

-- Indexes (FIX: removed redundant idx_inventory_slug — UNIQUE(slug) already indexes)
CREATE INDEX idx_holdings_email ON holdings(user_email);
CREATE INDEX idx_holdings_horse ON holdings(horse_slug);
CREATE INDEX idx_holdings_purchase ON holdings(purchase_id);
CREATE INDEX idx_events_user ON events(user_email);
CREATE INDEX idx_events_type ON events(event_type);
```

### 1C. New file: `src/lib/supabase.ts` (replaces google-sheets.ts)

> **FIX (audit C2):** `deriveLotPriceFromOwnerRate()` logic preserved — prices are derived from owner rate when `price_per_share_nzd` is null.
> **FIX (audit H6):** `getLiveInventory()` kept as a transform helper, not collapsed into `readInventoryBySlug`.
> **FIX (audit H5):** Retry wrapper for transient Supabase/Postgres errors replaces `google-sheets.ts` `withRetry()`.
> **FIX (audit H9):** `logEvent()` helper included.
> **FIX (audit M1):** Uses `.maybeSingle()` for slug lookups, not `.single()`.
> **FIX (audit C1/C6):** Uses atomic RPC functions for inventory increment and fulfillment.

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { roundUpListPriceNzd } from './pricing';

// ============================================================
// Client creation
// ============================================================

// Server client (bypasses RLS — for API routes, webhooks only)
// FIX (audit Nemotron M): Runtime guard prevents accidental client bundle import
function createServerClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('createServerClient() must never be called in browser context. Use createBrowserClient().');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Browser client (RLS enforced — for future client-side reads)
export function createBrowserClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton server client
let _server: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  if (!_server) _server = createServerClient();
  return _server;
}

// ============================================================
// Retry wrapper (FIX: audit H5 — replaces google-sheets.ts withRetry)
// ============================================================
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      // Retry on network errors, 5xx, connection resets — not on auth/validation errors
      const isTransient = err?.code === 'PGRST116' === false && (
        err?.message?.includes('fetch') ||
        err?.message?.includes('network') ||
        err?.message?.includes('ECONNRESET') ||
        err?.status >= 500
      );
      if (!isTransient || attempt >= maxAttempts - 1) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  throw lastError;
}

// ============================================================
// Price derivation (FIX: audit C2 — preserves google-sheets.ts:112-139)
// ============================================================
function deriveLotPriceFromOwnerRate(
  ownerRate: number | null,
  platformFeePct: number | null,
  stakePct: number | null,
  sharesTotal: number | null,
  leaseMonths: number | null
): number | null {
  if (!ownerRate || !stakePct || !sharesTotal || !leaseMonths || sharesTotal <= 0) return null;
  const fee = platformFeePct ?? 5;
  const listRate = ownerRate * (1 + fee / 100);
  const lotPct = stakePct / sharesTotal;
  const lotTotal = listRate * lotPct * leaseMonths;
  return roundUpListPriceNzd(lotTotal);
}

// ============================================================
// Types (match existing google-sheets.ts interfaces)
// ============================================================
export interface InventoryRow {
  slug: string;
  name: string;
  listing_status: string;
  price_per_share_nzd: number | null;
  shares_total: number;
  shares_sold: number;
  leasehold_stake_pct: number | null;
  lease_period_months: number | null;
  lease_start_date: string;
  investor_return_pct: number | null;
  campaign_status: string;
  owner_rate_per_1pct_month: number | null;
  platform_fee_pct: number;
  marketplace_visible: boolean;
  trainer_name: string;
  trainer_stable: string;
  trainer_location: string;
  wins: number;
  placed: number;
  next_up: string;
  loveracing_id?: number;
  // Content fields (FIX: audit H4)
  image_path?: string;
  story?: string;
  pedigree?: string;
  sex?: string;
  colour?: string;
  sire_name?: string;
  dam_name?: string;
  trainer_contact_name?: string;
  horse_microchip?: number;
  owner_name?: string;
  breeding_url?: string;
  performance_profile_url?: string;
}

export interface HoldingRow {
  purchase_id: string;
  timestamp: string;
  user_email: string;
  horse_slug: string;
  shares_owned: number;
  purchase_price_total_nzd: number;
  signed_pds_url: string;
  signed_sa_url: string;
  kyc_status: string;
  utm_source: string;
  utm_campaign: string;
}

export interface LeadRow {
  timestamp: string;
  user_email: string;
  user_name: string;
  horse_slug: string;
  action_type: string;
  utm_source: string;
  utm_campaign: string;
  referrer_url: string;
  status: string;
}

export interface CommunicationRow {
  timestamp: string;
  recipient_email: string;
  subject: string;
  snippet: string;
  body_html: string;
  category: string;
}

// ============================================================
// Inventory reads
// ============================================================

// Map a Supabase row to InventoryRow, deriving price if missing (FIX: audit C2)
function mapInventoryRow(row: any): InventoryRow {
  const explicitPrice = row.price_per_share_nzd != null ? Number(row.price_per_share_nzd) : null;
  const derivedPrice = deriveLotPriceFromOwnerRate(
    row.owner_rate_per_1pct_month != null ? Number(row.owner_rate_per_1pct_month) : null,
    row.platform_fee_pct != null ? Number(row.platform_fee_pct) : null,
    row.leasehold_stake_pct != null ? Number(row.leasehold_stake_pct) : null,
    row.shares_total != null ? Number(row.shares_total) : null,
    row.lease_period_months != null ? Number(row.lease_period_months) : null
  );
  return {
    slug: row.slug,
    name: row.name,
    listing_status: row.listing_status,
    price_per_share_nzd: explicitPrice ?? derivedPrice,
    shares_total: Number(row.shares_total) || 0,
    shares_sold: Number(row.shares_sold) || 0,
    leasehold_stake_pct: row.leasehold_stake_pct != null ? Number(row.leasehold_stake_pct) : null,
    lease_period_months: row.lease_period_months != null ? Number(row.lease_period_months) : null,
    lease_start_date: row.lease_start_date || '',
    investor_return_pct: row.investor_return_pct != null ? Number(row.investor_return_pct) : null,
    campaign_status: row.campaign_status || '',
    owner_rate_per_1pct_month: row.owner_rate_per_1pct_month != null ? Number(row.owner_rate_per_1pct_month) : null,
    platform_fee_pct: row.platform_fee_pct != null ? Number(row.platform_fee_pct) : 5,
    marketplace_visible: row.marketplace_visible === true,
    trainer_name: row.trainer_name || '',
    trainer_stable: row.trainer_stable || '',
    trainer_location: row.trainer_location || '',
    wins: Number(row.wins) || 0,
    placed: Number(row.placed) || 0,
    next_up: row.next_up || '',
    loveracing_id: row.loveracing_id,
    image_path: row.image_path,
    story: row.story,
    pedigree: row.pedigree,
    sex: row.sex,
    colour: row.colour,
    sire_name: row.sire_name,
    dam_name: row.dam_name,
    trainer_contact_name: row.trainer_contact_name,
    horse_microchip: row.horse_microchip,
    owner_name: row.owner_name,
    breeding_url: row.breeding_url,
    performance_profile_url: row.performance_profile_url,
  };
}

export async function readInventory(): Promise<InventoryRow[]> {
  return withRetry(async () => {
    const { data, error } = await supabase().from('inventory').select('*');
    if (error) throw error;
    return (data || []).map(mapInventoryRow);
  });
}

export async function readInventoryList(): Promise<InventoryRow[]> {
  return withRetry(async () => {
    const { data, error } = await supabase()
      .from('inventory')
      .select('*')
      .eq('marketplace_visible', true);
    if (error) throw error;
    return (data || []).map(mapInventoryRow);
  });
}

// FIX: audit M1 — uses .maybeSingle() not .single()
export async function readInventoryBySlug(slug: string): Promise<InventoryRow | null> {
  return withRetry(async () => {
    const { data, error } = await supabase()
      .from('inventory')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapInventoryRow(data);
  });
}

// FIX: audit H6 — getLiveInventory returns transformed shape, NOT same as readInventoryBySlug
export async function getLiveInventory(horseSlug: string) {
  const row = await readInventoryBySlug(horseSlug);
  if (!row) return null;
  const sharesAvailable = row.shares_total - row.shares_sold;
  return {
    slug: row.slug,
    name: row.name,
    listing_status: row.listing_status,
    campaign_status: row.campaign_status,
    shares_total: row.shares_total,
    shares_sold: row.shares_sold,
    shares_available: sharesAvailable,
    price_per_share_nzd: row.price_per_share_nzd,
    totalLeasePercent: row.leasehold_stake_pct,
    leasePeriodMonths: row.lease_period_months,
    leaseStartDate: row.lease_start_date,
    investorReturnPct: row.investor_return_pct,
    owner_rate_per_1pct_month: row.owner_rate_per_1pct_month,
    platform_fee_pct: row.platform_fee_pct,
    marketplace_visible: row.marketplace_visible,
    trainer_name: row.trainer_name,
    trainer_stable: row.trainer_stable,
    trainer_location: row.trainer_location,
  };
}

// ============================================================
// Inventory writes
// ============================================================

// FIX: audit C1 — atomic increment via RPC, NOT read-modify-write
export async function updateInventorySharesSold(slug: string, sharesToBuy: number): Promise<{
  success: boolean;
  shares_available: number;
}> {
  const { data, error } = await supabase()
    .rpc('increment_shares_sold', { p_slug: slug, p_delta: sharesToBuy });

  if (error) throw error;
  if (!data || data.length === 0) return { success: false, shares_available: 0 };
  return {
    success: data[0].success,
    shares_available: data[0].shares_available,
  };
}

// ============================================================
// Holdings
// ============================================================

// FIX: audit C6 — atomic fulfillment via RPC (idempotency + insert + increment in one transaction)
export async function fulfillPurchase(params: {
  purchase_id: string;
  user_email: string;
  user_uid?: string;
  horse_slug: string;
  shares: number;
  amount_nzd: number;
  signed_pds_url?: string;
  signed_sa_url?: string;
  kyc_status?: string;
  utm_source?: string;
  utm_campaign?: string;
}): Promise<{ success: boolean; duplicate: boolean; message: string }> {
  const { data, error } = await supabase().rpc('fulfill_purchase', {
    p_purchase_id: params.purchase_id,
    p_user_email: params.user_email,
    p_user_uid: params.user_uid || null,
    p_horse_slug: params.horse_slug,
    p_shares: params.shares,
    p_amount_nzd: params.amount_nzd,
    p_signed_pds_url: params.signed_pds_url || null,
    p_signed_sa_url: params.signed_sa_url || null,
    p_kyc_status: params.kyc_status || 'verified',
    p_utm_source: params.utm_source || null,
    p_utm_campaign: params.utm_campaign || null,
  });

  if (error) throw error;
  if (!data || data.length === 0) return { success: false, duplicate: false, message: 'No result' };
  return {
    success: data[0].success,
    duplicate: data[0].duplicate,
    message: data[0].message,
  };
}

// Kept for backwards compat with existing checkout-fulfill.ts check pattern
export async function checkHoldingExists(purchaseId: string): Promise<boolean> {
  const { data, error } = await supabase()
    .from('holdings')
    .select('id')
    .eq('purchase_id', purchaseId)
    .limit(1);
  if (error) throw error;
  return (data || []).length > 0;
}

export async function readHoldingsByEmail(email: string): Promise<HoldingRow[]> {
  return withRetry(async () => {
    const { data, error } = await supabase()
      .from('holdings')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      purchase_id: row.purchase_id,
      timestamp: row.timestamp,
      user_email: row.user_email,
      horse_slug: row.horse_slug,
      shares_owned: Number(row.shares_owned),
      purchase_price_total_nzd: Number(row.purchase_price_total_nzd),
      signed_pds_url: row.signed_pds_url || '',
      signed_sa_url: row.signed_sa_url || '',
      kyc_status: row.kyc_status || 'verified',
      utm_source: row.utm_source || '',
      utm_campaign: row.utm_campaign || '',
    }));
  });
}

// ============================================================
// Leads
// ============================================================

export async function appendLead(row: LeadRow): Promise<void> {
  const { error } = await supabase().from('leads').insert({
    timestamp: row.timestamp,
    user_email: row.user_email,
    user_name: row.user_name,
    horse_slug: row.horse_slug,
    action_type: row.action_type,
    utm_source: row.utm_source,
    utm_campaign: row.utm_campaign,
    referrer_url: row.referrer_url,
    status: row.status || 'new',
  });
  if (error) throw error;
}

// ============================================================
// Communications
// ============================================================

export async function appendCommunication(row: CommunicationRow): Promise<void> {
  const { error } = await supabase().from('communications').insert({
    timestamp: row.timestamp,
    recipient_email: row.recipient_email,
    subject: row.subject,
    snippet: row.snippet,
    body_html: row.body_html,
    category: row.category,
  });
  if (error) throw error;
}

export async function readCommunicationsByEmail(email: string): Promise<CommunicationRow[]> {
  return withRetry(async () => {
    const { data, error } = await supabase()
      .from('communications')
      .select('*')
      .eq('recipient_email', email)
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      timestamp: row.timestamp,
      recipient_email: row.recipient_email,
      subject: row.subject || '',
      snippet: row.snippet || '',
      body_html: row.body_html || '',
      category: row.category || '',
    }));
  });
}

// ============================================================
// Events / audit trail (FIX: audit H9 — logEvent helper defined)
// ============================================================

export async function logEvent(params: {
  user_email?: string;
  user_uid?: string;
  event_type: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const { error } = await supabase().from('events').insert({
      user_email: params.user_email || null,
      user_uid: params.user_uid || null,
      event_type: params.event_type,
      entity_type: params.entity_type || null,
      entity_id: params.entity_id || null,
      metadata: params.metadata || {},
    });
    if (error) console.error('[logEvent] Failed to write event:', error.message);
  } catch (err: any) {
    // Never let audit logging break the main flow
    console.error('[logEvent] Exception:', err.message);
  }
}

// invalidateHoldingsCache — DELETED (no cache layer needed, Supabase is source of truth)
```

### 1D. Function swap map (google-sheets.ts → supabase.ts)

| Old function (google-sheets.ts) | New (supabase.ts) | Notes |
|-------------------------------|-------------------|-------|
| `readInventory()` | `readInventory()` | Maps rows + derives price if missing |
| `readInventoryList()` | `readInventoryList()` | Filters `marketplace_visible = true` |
| `readInventoryBySlug(slug)` | `readInventoryBySlug(slug)` | Uses `.maybeSingle()` (FIX: audit M1) |
| `getLiveInventory(slug)` | `getLiveInventory(slug)` | Returns transformed shape (FIX: audit H6 — NOT same as readInventoryBySlug) |
| `updateInventorySharesSold(slug, n)` | `updateInventorySharesSold(slug, n)` | **Atomic RPC** (FIX: audit C1) |
| `checkHoldingExists(id)` + `appendHolding(row)` | `fulfillPurchase(params)` | **Single atomic RPC** (FIX: audit C6) |
| `readHoldingsByEmail(email)` | `readHoldingsByEmail(email)` | Same return shape |
| `appendLead(row)` | `appendLead(row)` | Same |
| `appendCommunication(row)` | `appendCommunication(row)` | Same |
| `readCommunicationsByEmail(email)` | `readCommunicationsByEmail(email)` | Same |
| `invalidateHoldingsCache(email)` | **DELETED** | No cache needed |
| *(new)* | `logEvent(params)` | **NEW** — audit trail (FIX: audit H9) |

### 1E. Files that change (12 files)

```
src/lib/supabase.ts              ← NEW (replaces google-sheets.ts)
src/lib/google-sheets.ts         ← DELETE after dual-write phase passes
src/lib/checkout-fulfill.ts      ← swap to fulfillPurchase() RPC + logEvent()
src/app/api/holdings/route.ts    ← swap to supabase query
src/app/api/inventory/[slug]/route.ts ← swap
src/app/api/leads/route.ts       ← swap
src/app/api/communications/route.ts ← swap
src/app/api/checkout/create-session/route.ts ← swap inventory read
src/app/api/diagnostics/payment-health/route.ts ← FIX: replace Sheets health checks with Supabase health checks
src/app/api/kyc/callback/route.ts ← FIX: add logEvent('kyc_verified') (audit H8)
src/app/marketplace/page.tsx     ← swap inventory read (server component)
src/app/marketplace/[id]/page.tsx ← swap inventory read (server component)
```

### 1F. Data migration (Sheets → Supabase)

```
1. Run schema SQL in Supabase SQL editor (includes RPC functions)
2. Export each Google Sheet tab as CSV
3. Normalize data BEFORE import:
   - marketplace_visible: "true"/"yes"/"1" → true, everything else → false (FIX: audit H2)
   - Empty numeric cells → NULL (not 0 or "")
   - Verify all horse_slug values in holdings exist in inventory (or remove FK before import)
4. Import via Supabase Table editor (or CSV import)
5. Run validation SQL:
   - Check row counts match Sheet tabs
   - Check no NULLs in NOT NULL columns
   - Check shares_sold <= shares_total for all rows
   - Check price_per_share_nzd is populated (either explicit or derivable from owner_rate)
6. Test RLS: anon key should NOT be able to read any table
7. Test RPCs: call increment_shares_sold with test slug, verify atomic behavior
```

### 1G. Firebase Auth → Supabase RLS bridge

**Option A (recommended): Service role for all API routes, Firebase Auth in code**

- All API routes use `supabase()` (service role, bypasses RLS)
- API routes verify Firebase ID tokens before any Supabase query
- RLS policies are defense-in-depth templates for a future Supabase Auth migration
- RLS denies all client access today (no policies = deny by default in Postgres)

**Option B (future): Sync Firebase JWT → Supabase custom JWT**
- Only needed if you move to client-side Supabase reads (direct from browser)
- Post Firebase token to Supabase auth exchange
- Supabase issues its own JWT with Firebase claims
- Then enable RLS policies that reference `auth.jwt() ->> 'email'`

**Recommendation: Option A now. RLS policies in the schema are commented templates, not active.** Every API route must verify Firebase token before calling `supabase()`.

### 1H. checkout-fulfill.ts changes

The existing `checkout-fulfill.ts` does:
1. `checkHoldingExists(sessionId)` — if exists, return duplicate
2. `appendHolding(row)` — insert holding
3. `updateInventorySharesSold(slug, newSold)` — read current, add, write
4. `appendCommunication(row)` — log comms

**After migration, replace steps 1-3 with a single `fulfillPurchase()` RPC call:**

```typescript
const result = await fulfillPurchase({
  purchase_id: sessionId,
  user_email: userEmail,
  user_uid: verifiedUid,
  horse_slug: hltId,
  shares: sharesToBuy,
  amount_nzd: amountTotal,
  signed_pds_url: meta.signed_pds_url,
  signed_sa_url: meta.signed_sa_url,
  kyc_status: 'verified',
  utm_source: meta.utm_source,
  utm_campaign: meta.utm_campaign,
});

// Log to PostHog + events table
await logEvent({
  user_email: userEmail,
  user_uid: verifiedUid,
  event_type: 'holding_issued',
  entity_type: 'holding',
  entity_id: sessionId,
  metadata: { horse_slug: hltId, shares: sharesToBuy, amount_nzd: amountTotal, ...result },
});
```

Step 4 (`appendCommunication`) stays as a separate call — it's non-critical and can fail without financial impact.

---

## PART 2: POSTHOG INTEGRATION

> **FIX (audit C3):** PostHog is split into client SDK (`posthog-js`) for browser analytics/session replay and server SDK (`posthog-node`) for server-side feature flags and error tracking.
> **FIX (audit C4):** PostHog initialization moved to a `'use client'` component, not called in RSC body.
> **FIX (audit C5):** `posthog.captureException` replaced with `posthog-node` `capture` + automatic error tracking.

### 2A. New env vars

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
POSTHOG_PERSONAL_API_KEY=phx_xxx          # server-side feature flags + error tracking
POSTHOG_PROJECT_ID=xxxxx                   # for server API calls
```

### 2B. New file: `src/lib/posthog-client.ts` (browser only)

```typescript
'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect, useState } from 'react';

// FIX: audit C4 — client component, initializes in useEffect, not RSC body
export function PostHogProviderWrapper({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
      session_recording: {
        maskAllInputs: true,              // don't record form inputs (KYC data)
        maskTextSelector: '[data-ph-mask]',
      },
    });

    setInitialized(true);
  }, [initialized]);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export { posthog };
```

### 2C. New file: `src/lib/posthog-server.ts` (server only)

```typescript
// FIX: audit C3/C5 — server-side PostHog for API routes and server components
// Separate from posthog-client.ts — never import this in client code

import { PostHog as PostHogNode } from 'posthog-node';

let _client: PostHogNode | null = null;

function getClient(): PostHogNode {
  if (_client) return _client;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || !process.env.POSTHOG_PERSONAL_API_KEY) {
    return {} as PostHogNode; // graceful no-op if not configured
  }
  _client = new PostHogNode(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
  });
  return _client;
}

// Server-side feature flag check (async — PostHog decide API)
export async function isFeatureEnabledServer(
  flagKey: string,
  distinctId: string = 'system'
): Promise<boolean> {
  const client = getClient();
  if (!client.getDistinctId) return false; // no-op client
  try {
    return await client.isFeatureEnabled(flagKey, distinctId);
  } catch {
    return false; // fail closed
  }
}

// Server-side error capture (FIX: audit C5 — no captureException, use capture)
export function captureServerError(
  error: Error | string,
  context: Record<string, any> = {}
): void {
  const client = getClient();
  if (!client.getDistinctId) return; // no-op
  try {
    client.capture({
      distinctId: context.user_id || 'server',
      event: 'error',
      properties: {
        error: typeof error === 'string' ? error : error.message,
        stack: typeof error === 'object' ? error.stack : undefined,
        ...context,
      },
    });
  } catch {
    // never let error tracking crash the request
  }
}

export { getClient as posthogServer };
```

### 2D. Wrap layout.tsx (1 file)

```typescript
// src/app/layout.tsx — add PostHogProviderWrapper inside AuthProvider
// FIX: layout.tsx is a Server Component — don't call initPosthog() here
import { PostHogProviderWrapper } from '@/lib/posthog-client';

// Wrap children (PostHogProviderWrapper is 'use client', so this is valid):
<AuthProvider>
  <PostHogProviderWrapper>
    <SmoothScrollProvider>
      {children}
    </SmoothScrollProvider>
  </PostHogProviderWrapper>
</AuthProvider>
```

### 2E. Feature flags (replaces PURCHASES_ENABLED env var)

> **FIX (audit C3):** Server-side code uses `posthog-server.ts` (async, Node SDK). Client-side code uses `posthog-js` (browser only). Env var remains as fallback.

```typescript
// In purchase-eligibility.ts (SERVER MODULE — no posthog-js import):

// Keep env var as the primary server-side gate (reliable, no network dependency)
export const isPurchasesEnabled = (): boolean => {
  return process.env.PURCHASES_ENABLED === 'true';
};

// OPTIONAL: async check for PostHog flag from API routes (not for SSR/RSC)
import { isFeatureEnabledServer } from '@/lib/posthog-server';

export async function isPurchasesEnabledAsync(userId?: string): Promise<boolean> {
  const envEnabled = process.env.PURCHASES_ENABLED === 'true';
  if (!envEnabled) return false; // env is hard kill-switch
  // If env is on, check PostHog flag for granular control (optional)
  if (userId) {
    return await isFeatureEnabledServer('purchases_enabled', userId);
  }
  return true; // env on + no user = allow (auth gate handles the rest)
}
```

**PostHog flag setup:**
- Flag key: `purchases_enabled`
- Type: boolean
- Default: false (off)
- Rollout: 100% when ready
- Toggle in PostHog dashboard — no redeploy needed
- **Server-side: env var stays as hard kill-switch. PostHog flag is additive control on top.**

### 2F. Event tracking map

| PostHog event | Trigger | Where | SDK | Properties |
|--------------|---------|-------|-----|------------|
| `page_viewed` | Auto | PostHog SDK | client | path, referrer (auto) |
| `marketplace_browsed` | Marketplace page load | marketplace/page.tsx | client | horse_count |
| `listing_viewed` | Horse detail page | marketplace/[id]/page.tsx | client | horse_slug, price, shares_available |
| `signup_started` | Click "Sign In" | PurchaseFlow / OnboardingFlow | client | horse_slug |
| `signup_completed` | Firebase auth success | auth-context.tsx | client | method (google/email) |
| `kyc_started` | Click "Verify Identity" | auth/verify/page.tsx | client | horse_slug |
| `kyc_completed` | Stripe Identity verified | kyc/callback webhook | server | kyc_session_id |
| `purchase_started` | Click "Acquire" | PurchaseFlow | client | horse_slug, shares_selected, total_nzd |
| `payment_succeeded` | Stripe webhook | checkout-fulfill.ts | server | horse_slug, shares, amount_nzd, session_id |
| `holding_issued` | Holding written to Supabase | checkout-fulfill.ts | server | horse_slug, shares, purchase_id |
| `email_sent` | Resend email sent | (future) | server | template, recipient |

### 2G. Error tracking (replaces console.log)

```typescript
// FIX: audit C5 — use posthog-server, not posthog-js

// In API routes (server context):
import { captureServerError } from '@/lib/posthog-server';

// Replace:
console.error('[KYC create-session] Invalid token:', e.message);

// With:
captureServerError(e, {
  route: '/api/kyc/create-session',
  user_id: verifiedUid,
});

// Keep console.error too — PostHog is additive, not a replacement for local logs:
console.error('[KYC create-session] Invalid token:', e.message);
captureServerError(e, { route: '/api/kyc/create-session', user_id: verifiedUid });

// Client-side: PostHog auto-captures exceptions when error tracking is enabled in init
```

### 2H. Session replay privacy

```typescript
// KYC pages — disable recording on sensitive inputs
// Add to any input handling PII:
<input data-ph-mask />  // PostHog won't record this field's input

// Or disable recording on entire KYC pages (in client component):
import { posthog } from '@/lib/posthog-client';
useEffect(() => {
  // Stop recording on KYC verify page
  posthog.sessionRecording?.stop();
  return () => {
    posthog.sessionRecording?.start(); // resume on unmount
  };
}, []);
```

### 2I. Files that change for PostHog

```
src/lib/posthog-client.ts      ← NEW ('use client' — browser SDK, provider, session replay)
src/lib/posthog-server.ts      ← NEW (server SDK — feature flags, error capture)
src/app/layout.tsx             ← add PostHogProviderWrapper (1 import + 2 JSX lines)
src/lib/purchase-eligibility.ts ← keep env var + optional async PostHog flag check
src/lib/auth-context.tsx       ← capture signup_completed event (1 line, client SDK)
src/lib/usePurchaseFlow.ts     ← capture purchase_started event (1 line, client SDK)
src/lib/checkout-fulfill.ts    ← capture payment_succeeded + holding_issued (server SDK)
src/app/marketplace/[id]/page.tsx ← capture listing_viewed (client component wrapper)
```

---

## PART 3: INTEGRATION ORDER

### Step 1: PostHog client (30 min, zero risk, zero cost)
1. `npm i posthog-js posthog-js/react posthog-node`
2. Create `src/lib/posthog-client.ts` (browser provider)
3. Create `src/lib/posthog-server.ts` (server SDK)
4. Wrap `layout.tsx` with `PostHogProviderWrapper`
5. Add env vars to `.env.local`
6. Add `posthog.capture()` calls in client files (auth-context, usePurchaseFlow, marketplace)
7. Add `captureServerError()` calls in API routes
8. Verify events flow in PostHog dashboard

**Do this first.** Zero risk, immediate visibility into the current flow before you change anything.

### Step 2: Supabase schema + data migration (2-4 hours)
1. Create Supabase project
2. Run schema SQL (includes `increment_shares_sold` and `fulfill_purchase` RPC functions)
3. Export Google Sheets tabs as CSV
4. **Normalize data** (marketplace_visible strings → booleans, empty numerics → NULL)
5. Import into Supabase tables
6. Run validation SQL (row counts, CHECK constraints, price derivation check)
7. Test RLS: anon key must NOT read any table
8. Test RPCs: `increment_shares_sold` and `fulfill_purchase` with test data
9. Add env vars
10. **FIX: Add keep-alive cron** (Vercel cron or uptime monitor pinging Supabase every 5 min to prevent free-tier pause)

### Step 3: Dual-write phase (FIX: audit H1 — no big-bang swap)
1. `npm i @supabase/supabase-js`
2. Create `src/lib/supabase.ts`
3. **Keep `google-sheets.ts` alive** — write to BOTH Sheets and Supabase
4. Read from Sheets (primary), Supabase (shadow read for comparison)
5. Deploy to Vercel preview
6. Run a test purchase end-to-end
7. Compare: does Supabase holding match Sheets holding? Does shares_sold match?
8. If reconciliation passes, proceed to Step 4

### Step 4: Switch reads to Supabase (1-2 hours)
1. Swap all read functions in 10 files to use `supabase.ts`
2. Keep dual-write active (write to both, read from Supabase)
3. Deploy to Vercel preview
4. Verify marketplace loads, holdings display, checkout works end-to-end
5. Run another test purchase
6. If all good, deploy to production

### Step 5: Wire events table + KYC callback (1 hour)
1. Add `logEvent()` calls in `checkout-fulfill.ts` (payment_succeeded, holding_issued)
2. **FIX: Wire `kyc/callback/route.ts`** to call `logEvent({ event_type: 'kyc_verified' })` (audit H8)
3. View audit trail in Supabase Studio

### Step 6: Remove Sheets (after 1 week of clean production)
1. Remove all `google-sheets.ts` imports
2. Remove dual-write code
3. Delete `google-sheets.ts`
4. **FIX: Update `payment-health/route.ts`** to check Supabase health instead of Sheets (audit M3)
5. Remove Sheets env vars
6. Remove Google Sheets service account permissions

### Step 7: Feature flags (30 min)
1. Create `purchases_enabled` flag in PostHog
2. Update `purchase-eligibility.ts` with async flag check (optional, env stays as hard switch)
3. Test toggling in PostHog dashboard
4. Keep `PURCHASES_ENABLED` env var as hard kill-switch

---

## PART 4: AUDIT TRAIL — ISSUES FIXED

| # | Severity | Issue (from 3-model audit) | Fix applied |
|---|----------|---------------------------|-------------|
| C1 | CRITICAL | Non-atomic inventory update → oversell | `increment_shares_sold` RPC with `FOR UPDATE` lock + CHECK constraint |
| C2 | CRITICAL | `deriveLotPriceFromOwnerRate()` dropped | Preserved in `supabase.ts` `mapInventoryRow()` |
| C3 | CRITICAL | PostHog browser SDK in server modules | Split: `posthog-client.ts` (browser) + `posthog-server.ts` (Node SDK) |
| C4 | HIGH | PostHog init in RSC body | `PostHogProviderWrapper` is `'use client'` with `useEffect` |
| C5 | HIGH | `posthog.captureException` doesn't exist | Replaced with `captureServerError()` via `posthog-node` |
| C6 | HIGH | Idempotency + insert not atomic | `fulfill_purchase` RPC — single transaction |
| H1 | HIGH | Big-bang swap, no rollback | Dual-write phase (Step 3) before removing Sheets |
| H2 | HIGH | `marketplace_visible` string→boolean | Migration normalization step in 1F |
| H3 | HIGH | RLS policies are dead code | Rewritten: deny all client access, labeled as templates |
| H4 | HIGH | Schema omits UI columns | Added `image_path`, `story`, `pedigree`, `sex`, etc. |
| H5 | MEDIUM | No retry wrapper | `withRetry()` in `supabase.ts` |
| H6 | HIGH | `getLiveInventory` not 1:1 | Kept as transform helper, not collapsed |
| H7 | HIGH | Free-tier pausing | Keep-alive cron in Step 2 |
| H8 | HIGH | KYC callback not wired to events | Added to Step 5 |
| H9 | HIGH | `logEvent()` never defined | Defined in `supabase.ts` |
| H10 | HIGH | Feature flag plan incomplete | Server uses env + async PostHog; client uses `posthog-js` |
| M1 | MEDIUM | `.single()` throws on missing slug | Changed to `.maybeSingle()` |
| M3 | MEDIUM | `payment-health` checks Sheets | Added to Step 6 removal |
| M4 | MEDIUM | Pre-existing lint errors | Fix before landing new code |
| M6 | MEDIUM | `api/applications/*` not addressed | Add to migration scope (check if they read Sheets) |

---

## POST-MIGRATION STATE

| Layer | Before | After |
|-------|--------|-------|
| Database | Google Sheets (638 lines, 56 calls, 10 files) | Supabase Postgres (RLS, typed, queryable, atomic RPCs) |
| Admin view | Squinting at spreadsheet tabs | Supabase Studio (table editor, SQL, filters) |
| Audit trail | None | `events` table (append-only, queryable) |
| Analytics | None | PostHog funnels, heatmaps, session replay |
| Feature flags | `PURCHASES_ENABLED` env var (redeploy to toggle) | PostHog flag (client) + env var (server hard switch) |
| Error tracking | console.log | PostHog server error capture + client auto-tracking |
| Session replay | None | PostHog recordings (KYC inputs masked) |
| Inventory updates | Read-modify-write (race condition risk) | Atomic RPC with `FOR UPDATE` lock |
| Fulfillment | 3 separate calls (idempotency gap) | Single atomic transaction RPC |
| Cost | $0 | $0 (both on free tier) → $25/mo Supabase Pro when live |

## ENV VARS (final state)

```env
# Firebase (keep)
NEXT_PUBLIC_FIREBASE_CONFIG={...}
FIREBASE_SERVICE_ACCOUNT_KEY={...}

# Stripe (keep)
STRIPE_SECRET_KEY=...
STRIPE_CHECKOUT_WEBHOOK_SECRET=...
STRIPE_KYC_WEBHOOK_SECRET=...

# Supabase (NEW)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# PostHog (NEW)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
POSTHOG_PERSONAL_API_KEY=phx_xxx
POSTHOG_PROJECT_ID=xxxxx

# Keep during dual-write phase, remove after Step 6:
PURCHASES_ENABLED=true                    # stays as server hard kill-switch
GOOGLE_SHEETS_WEB_APP_URL=...
GOOGLE_SPREADSHEET_ID=...
GOOGLE_SHEETS_INVENTORY_TAB=hlts
GOOGLE_SHEETS_HOLDINGS_TAB=holdings
GOOGLE_SHEETS_LEADS_TAB=leads
GOOGLE_SHEETS_COMMUNICATIONS_TAB=communications
GOOGLE_SERVICE_ACCOUNT_KEY=...
```