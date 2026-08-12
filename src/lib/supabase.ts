import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { roundUpListPriceNzd } from './pricing';

// ============================================================
// Client creation
// ============================================================

// Server client (bypasses RLS — for API routes, webhooks only)
// Runtime guard prevents accidental client bundle import.
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
// Retry wrapper (replaces google-sheets.ts withRetry)
// ============================================================
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      // Retry on network errors, 5xx, connection resets — not on auth/validation errors
      const isTransient =
        err?.message?.includes('fetch') ||
        err?.message?.includes('network') ||
        err?.message?.includes('ECONNRESET') ||
        err?.status >= 500;
      if (!isTransient || attempt >= maxAttempts - 1) throw err;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  throw lastError;
}

// ============================================================
// Price derivation (preserves google-sheets.ts logic)
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
  // Content fields
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

// Map a Supabase row to InventoryRow, deriving price if missing.
function mapInventoryRow(row: Record<string, unknown>): InventoryRow {
  const explicitPrice = row.price_per_share_nzd != null ? Number(row.price_per_share_nzd) : null;
  const derivedPrice = deriveLotPriceFromOwnerRate(
    row.owner_rate_per_1pct_month != null ? Number(row.owner_rate_per_1pct_month) : null,
    row.platform_fee_pct != null ? Number(row.platform_fee_pct) : null,
    row.leasehold_stake_pct != null ? Number(row.leasehold_stake_pct) : null,
    row.shares_total != null ? Number(row.shares_total) : null,
    row.lease_period_months != null ? Number(row.lease_period_months) : null
  );
  return {
    slug: String(row.slug ?? ''),
    name: String(row.name ?? ''),
    listing_status: String(row.listing_status ?? 'draft'),
    price_per_share_nzd: explicitPrice ?? derivedPrice,
    shares_total: Number(row.shares_total) || 0,
    shares_sold: Number(row.shares_sold) || 0,
    leasehold_stake_pct: row.leasehold_stake_pct != null ? Number(row.leasehold_stake_pct) : null,
    lease_period_months: row.lease_period_months != null ? Number(row.lease_period_months) : null,
    lease_start_date: String(row.lease_start_date ?? ''),
    investor_return_pct: row.investor_return_pct != null ? Number(row.investor_return_pct) : null,
    campaign_status: String(row.campaign_status ?? ''),
    owner_rate_per_1pct_month: row.owner_rate_per_1pct_month != null ? Number(row.owner_rate_per_1pct_month) : null,
    platform_fee_pct: row.platform_fee_pct != null ? Number(row.platform_fee_pct) : 5,
    marketplace_visible: row.marketplace_visible === true,
    trainer_name: String(row.trainer_name ?? ''),
    trainer_stable: String(row.trainer_stable ?? ''),
    trainer_location: String(row.trainer_location ?? ''),
    wins: Number(row.wins) || 0,
    placed: Number(row.placed) || 0,
    next_up: String(row.next_up ?? ''),
    loveracing_id: row.loveracing_id != null ? Number(row.loveracing_id) : undefined,
    image_path: row.image_path != null ? String(row.image_path) : undefined,
    story: row.story != null ? String(row.story) : undefined,
    pedigree: row.pedigree != null ? String(row.pedigree) : undefined,
    sex: row.sex != null ? String(row.sex) : undefined,
    colour: row.colour != null ? String(row.colour) : undefined,
    sire_name: row.sire_name != null ? String(row.sire_name) : undefined,
    dam_name: row.dam_name != null ? String(row.dam_name) : undefined,
    trainer_contact_name: row.trainer_contact_name != null ? String(row.trainer_contact_name) : undefined,
    horse_microchip: row.horse_microchip != null ? Number(row.horse_microchip) : undefined,
    owner_name: row.owner_name != null ? String(row.owner_name) : undefined,
    breeding_url: row.breeding_url != null ? String(row.breeding_url) : undefined,
    performance_profile_url: row.performance_profile_url != null ? String(row.performance_profile_url) : undefined,
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

// Uses .maybeSingle() not .single() so missing slug returns null cleanly.
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

// getLiveInventory returns a transformed shape, NOT the same as readInventoryBySlug.
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

// Atomic increment via RPC, NOT read-modify-write.
export async function updateInventorySharesSold(
  slug: string,
  sharesToBuy: number
): Promise<{ success: boolean; shares_available: number }> {
  const { data, error } = await supabase().rpc('increment_shares_sold', {
    p_slug: slug,
    p_delta: sharesToBuy,
  });

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

// Atomic fulfillment via RPC (idempotency + insert + increment in one transaction).
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

// Kept for backwards compat with existing checkout-fulfill.ts check pattern.
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
    return (data || []).map((row: Record<string, unknown>) => ({
      purchase_id: String(row.purchase_id ?? ''),
      timestamp: String(row.timestamp ?? ''),
      user_email: String(row.user_email ?? ''),
      horse_slug: String(row.horse_slug ?? ''),
      shares_owned: Number(row.shares_owned),
      purchase_price_total_nzd: Number(row.purchase_price_total_nzd),
      signed_pds_url: String(row.signed_pds_url ?? ''),
      signed_sa_url: String(row.signed_sa_url ?? ''),
      kyc_status: String(row.kyc_status ?? 'verified'),
      utm_source: String(row.utm_source ?? ''),
      utm_campaign: String(row.utm_campaign ?? ''),
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
    return (data || []).map((row: Record<string, unknown>) => ({
      timestamp: String(row.timestamp ?? ''),
      recipient_email: String(row.recipient_email ?? ''),
      subject: String(row.subject ?? ''),
      snippet: String(row.snippet ?? ''),
      body_html: String(row.body_html ?? ''),
      category: String(row.category ?? ''),
    }));
  });
}

// ============================================================
// Events / audit trail
// ============================================================

export async function logEvent(params: {
  user_email?: string;
  user_uid?: string;
  event_type: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
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
