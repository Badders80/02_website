-- ============================================================
-- Supabase schema for Evolution Stables
-- Run this file in the Supabase SQL Editor (or any Postgres 14+
-- instance) after project creation.
--
-- Security model (Option A): service-role access from API routes.
-- RLS is enabled on every table but no client policies are defined,
-- so anon/authenticated clients are denied by default.
-- ============================================================

-- ============================================================
-- updated_at helper
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- inventory  (replaces Google Sheets "hlts" tab)
-- ============================================================
CREATE TABLE inventory (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                     TEXT UNIQUE NOT NULL,
  name                     TEXT NOT NULL,
  listing_status           TEXT DEFAULT 'draft',
  campaign_status          TEXT DEFAULT 'pending',
  price_per_share_nzd      NUMERIC(10,2),
  shares_total             INTEGER NOT NULL DEFAULT 0,
  shares_sold              INTEGER NOT NULL DEFAULT 0,
  leasehold_stake_pct      NUMERIC(5,2),
  lease_period_months      INTEGER,
  lease_start_date         DATE,
  investor_return_pct      NUMERIC(5,2),
  owner_rate_per_1pct_month NUMERIC(10,2),
  platform_fee_pct         NUMERIC(5,2) DEFAULT 5,
  marketplace_visible      BOOLEAN DEFAULT false,

  -- Content columns required by the UI / API (static JSON remains a fallback)
  image_path               TEXT,
  story                    TEXT,
  pedigree                 TEXT,
  sex                      TEXT,
  colour                   TEXT,
  sire_name                TEXT,
  dam_name                 TEXT,
  dam_sire_name            TEXT,
  trainer_contact_name     TEXT,
  horse_microchip          BIGINT,
  breeding_url             TEXT,
  performance_profile_url  TEXT,
  owner_name               TEXT,

  -- Racing / training data
  trainer_name             TEXT,
  trainer_stable           TEXT,
  trainer_location         TEXT,
  wins                     INTEGER DEFAULT 0,
  placed                   INTEGER DEFAULT 0,
  next_up                  TEXT,
  loveracing_id            INTEGER,

  created_at               TIMESTAMPTZ DEFAULT now(),
  updated_at               TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT inventory_shares_total_positive CHECK (shares_total >= 0),
  CONSTRAINT inventory_shares_sold_valid     CHECK (shares_sold >= 0 AND shares_sold <= shares_total)
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- holdings (replaces Google Sheets "holdings" tab)
-- Note: no FK on horse_slug — legacy rows may reference horses
-- not yet loaded into inventory.
-- ============================================================
CREATE TABLE holdings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id               TEXT UNIQUE NOT NULL,
  timestamp                 TIMESTAMPTZ DEFAULT now(),
  user_email                TEXT NOT NULL,
  user_uid                  TEXT,
  horse_slug                TEXT NOT NULL,
  shares_owned              INTEGER NOT NULL,
  purchase_price_total_nzd  NUMERIC(10,2) NOT NULL,
  signed_pds_url            TEXT,
  signed_sa_url             TEXT,
  kyc_status                TEXT DEFAULT 'verified',
  utm_source                TEXT,
  utm_campaign              TEXT,
  created_at                TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_holdings_email    ON holdings(user_email);
CREATE INDEX idx_holdings_horse    ON holdings(horse_slug);
CREATE INDEX idx_holdings_purchase ON holdings(purchase_id);

-- ============================================================
-- leads (replaces Google Sheets "leads" tab)
-- ============================================================
CREATE TABLE leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp    TIMESTAMPTZ DEFAULT now(),
  user_email   TEXT,
  user_name    TEXT,
  horse_slug   TEXT,
  action_type  TEXT,
  utm_source   TEXT,
  utm_campaign TEXT,
  referrer_url TEXT,
  status       TEXT DEFAULT 'new'
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- communications (replaces Google Sheets "communications" tab)
-- ============================================================
CREATE TABLE communications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp       TIMESTAMPTZ DEFAULT now(),
  recipient_email TEXT NOT NULL,
  subject         TEXT,
  snippet         TEXT,
  body_html       TEXT,
  category        TEXT
);

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- events (append-only audit trail)
-- No UPDATE/DELETE policies; RLS enabled with zero client-side
-- policies means only the service role can insert.
-- ============================================================
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp   TIMESTAMPTZ DEFAULT now(),
  user_email  TEXT,
  user_uid    TEXT,
  event_type  TEXT NOT NULL,
  entity_type TEXT,
  entity_id   TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_events_user ON events(user_email);
CREATE INDEX idx_events_type ON events(event_type);

-- ============================================================
-- RPC: increment_shares_sold
-- Atomically reserves shares for a single horse using a row-level
-- FOR UPDATE lock. Returns (success, new_shares_sold, shares_total,
-- shares_available). Prevents overselling via the guard and the
-- inventory_shares_sold_valid CHECK constraint.
-- ============================================================
CREATE OR REPLACE FUNCTION increment_shares_sold(
  p_slug  TEXT,
  p_delta INTEGER
)
RETURNS TABLE (
  success          BOOLEAN,
  new_shares_sold  INTEGER,
  shares_total     INTEGER,
  shares_available INTEGER
) AS $$
DECLARE
  v_current_sold INTEGER;
  v_total        INTEGER;
BEGIN
  SELECT inv.shares_sold, inv.shares_total
    INTO v_current_sold, v_total
    FROM inventory inv
   WHERE inv.slug = p_slug
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, 0;
    RETURN;
  END IF;

  IF v_current_sold + p_delta > v_total THEN
    RETURN QUERY SELECT false, v_current_sold, v_total, (v_total - v_current_sold);
    RETURN;
  END IF;

  UPDATE inventory
     SET shares_sold = shares_sold + p_delta
   WHERE slug = p_slug;

  RETURN QUERY SELECT true,
                      (v_current_sold + p_delta),
                      v_total,
                      (v_total - v_current_sold - p_delta);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: fulfill_purchase
-- Single atomic transaction:
--   1. Idempotency check via purchase_id
--   2. Insert holding row
--   3. Atomic inventory increment
--   4. Append audit event
-- Returns (success, duplicate, message).
-- ============================================================
CREATE OR REPLACE FUNCTION fulfill_purchase(
  p_purchase_id    TEXT,
  p_user_email     TEXT,
  p_user_uid       TEXT,
  p_horse_slug     TEXT,
  p_shares         INTEGER,
  p_amount_nzd     NUMERIC(10,2),
  p_signed_pds_url TEXT,
  p_signed_sa_url  TEXT,
  p_kyc_status     TEXT,
  p_utm_source     TEXT,
  p_utm_campaign   TEXT
)
RETURNS TABLE (
  success   BOOLEAN,
  duplicate BOOLEAN,
  message   TEXT
) AS $$
DECLARE
  v_existing         TEXT;
  v_increment_result RECORD;
BEGIN
  SELECT id INTO v_existing
    FROM holdings
   WHERE purchase_id = p_purchase_id
   LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT true, true, 'Duplicate purchase_id — already fulfilled'::TEXT;
    RETURN;
  END IF;

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

  SELECT * INTO v_increment_result
    FROM increment_shares_sold(p_horse_slug, p_shares);

  IF NOT v_increment_result.success THEN
    RAISE EXCEPTION 'Oversell prevented: %', v_increment_result.shares_available;
  END IF;

  INSERT INTO events (user_email, user_uid, event_type, entity_type, entity_id, metadata)
  VALUES (
    p_user_email, p_user_uid,
    'holding_issued', 'holding', p_purchase_id,
    jsonb_build_object(
      'horse_slug', p_horse_slug,
      'shares', p_shares,
      'amount_nzd', p_amount_nzd
    )
  );

  RETURN QUERY SELECT true, false, 'Fulfilled successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
