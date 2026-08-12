-- Supabase seed data — auto-generated from src/data/hlts.json + horses.json
-- Run AFTER schema.sql in the Supabase SQL editor
-- Generated: 2026-08-12

-- ============================================================
-- Inventory (6 HLTs from existing JSON data)
-- ============================================================

INSERT INTO inventory (slug, name, listing_status, campaign_status, price_per_share_nzd, shares_total, shares_sold, leasehold_stake_pct, lease_period_months, lease_start_date, investor_return_pct, owner_rate_per_1pct_month, platform_fee_pct, marketplace_visible, trainer_name, trainer_stable, trainer_location, wins, placed, next_up, loveracing_id, image_path, story, pedigree, sex, colour, sire_name, dam_name, owner_name, horse_microchip, trainer_contact_name)
VALUES ('first-gear', 'First Gear', 'active', 'fully_subscribed', 240.0, 20, 20, 10.0, 12, '2025-07-01', 80, NULL, 5, true, 'Stephen Gray Racing', 'Stephen Gray Racing', 'Copper Belt Lodge, near Palmerston North, New Zealand', 0, 0, 'Spring trials', NULL, '/images/content/horses/first-gear-BG.png', 'A progressive filly for digital ownership with Evolution Stables marketplace storytelling.', 'Gelding / Derryn (AUS) x A''Guin Ace (NZ)', 'Gelding', 'Bay', 'Derryn (AUS)', 'A''Guin Ace (NZ)', 'Stephen Gray Racing', 985125000126713, 'Stephen Gray')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO inventory (slug, name, listing_status, campaign_status, price_per_share_nzd, shares_total, shares_sold, leasehold_stake_pct, lease_period_months, lease_start_date, investor_return_pct, owner_rate_per_1pct_month, platform_fee_pct, marketplace_visible, trainer_name, trainer_stable, trainer_location, wins, placed, next_up, loveracing_id, image_path, story, pedigree, sex, colour, sire_name, dam_name, owner_name, horse_microchip, trainer_contact_name)
VALUES ('prudentia', 'Prudentia (NZ)', 'active', 'fully_subscribed', 292.5, 20, 20, 5.0, 18, '2026-01-01', 75, NULL, 5, true, 'Wexford Stables', 'Wexford Stables', 'Matamata, New Zealand', 0, 0, 'TBD', NULL, '/images/content/horses/prudentia-cover.png', 'Prudentia is a New Zealand-bred four-year-old mare by Proisir, trained from Matamata by Lance O''Sullivan and Andrew Scott at Wexford Stables.', 'Mare / Proisir (AUS) x Little Bit Irish (NZ)', 'Mare', 'Bay', 'Proisir (AUS)', 'Little Bit Irish (NZ)', 'B.A.X Bloodstock Achieving Xcellence Limited', 985125000126462, 'Lance O''Sullivan')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO inventory (slug, name, listing_status, campaign_status, price_per_share_nzd, shares_total, shares_sold, leasehold_stake_pct, lease_period_months, lease_start_date, investor_return_pct, owner_rate_per_1pct_month, platform_fee_pct, marketplace_visible, trainer_name, trainer_stable, trainer_location, wins, placed, next_up, loveracing_id, image_path, story, pedigree, sex, colour, sire_name, dam_name, owner_name, horse_microchip, trainer_contact_name)
VALUES ('hottathanafantasy', 'Hottathanafantasy (NZ)', 'active', 'fully_subscribed', 280.0, 20, 20, 5.0, 16, '2025-03-01', 75, NULL, 5, true, 'Wexford Stables', 'Wexford Stables', 'Matamata, New Zealand', 0, 0, 'TBD', NULL, '/images/content/horses/hottathanafantasy-BG.png', 'Hottathanafantasy is a promising two-year-old filly from New Zealand.', 'Filly / Contributer (IRE) x Whiffle (USA)', 'Filly', 'Bay', 'Contributer (IRE)', 'Whiffle (USA)', 'B.A.X Bloodstock Achieving Xcellence Limited', 985125000139165, 'Lance O''Sullivan')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO inventory (slug, name, listing_status, campaign_status, price_per_share_nzd, shares_total, shares_sold, leasehold_stake_pct, lease_period_months, lease_start_date, investor_return_pct, owner_rate_per_1pct_month, platform_fee_pct, marketplace_visible, trainer_name, trainer_stable, trainer_location, wins, placed, next_up, loveracing_id, image_path, story, pedigree, sex, colour, sire_name, dam_name, owner_name, horse_microchip, trainer_contact_name)
VALUES ('i-stole-a-manolo', 'I Stole A Manolo (NZ)', 'active', 'listed', 280.0, 20, 0, 5.0, 16, '2026-03-01', 75, NULL, 5, true, 'Wexford Stables', 'Wexford Stables', 'Matamata, New Zealand', 0, 0, 'TBD', NULL, '/images/content/horses/i-stole-a-manolo-BG.png', 'I Stole A Manolo is a New Zealand-bred two-year-old filly by the Group 1 winning miler Satono Aladdin.', 'Filly / Satono Aladdin (JPN) x Canuhandleajandal (NZ)', 'Filly', 'Bay', 'Satono Aladdin (JPN)', 'Canuhandleajandal (NZ)', 'B.A.X Bloodstock Achieving Xcellence Limited', 985125000139219, 'Lance O''Sullivan')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO inventory (slug, name, listing_status, campaign_status, price_per_share_nzd, shares_total, shares_sold, leasehold_stake_pct, lease_period_months, lease_start_date, investor_return_pct, owner_rate_per_1pct_month, platform_fee_pct, marketplace_visible, trainer_name, trainer_stable, trainer_location, wins, placed, next_up, loveracing_id, image_path, story, pedigree, sex, colour, sire_name, dam_name, owner_name, horse_microchip, trainer_contact_name)
VALUES ('nellie', 'Lady Ketchikan', 'active', 'coming_soon', 250.0, 20, 0, 5.0, 12, '2026-01-01', 75, NULL, 5, true, 'Logan Racing', 'Logan Racing', 'New Zealand', 0, 0, 'TBD', NULL, '/images/content/horses/nellie-BG.png', 'A 2YO filly by Almanzor out of Night Danza, currently in early education with Logan Racing.', 'Filly / Almanzor (FR) x Night Danza (NZ)', 'filly', '', 'Almanzor (FR)', 'Night Danza (NZ)', 'B.A.X Bloodstock', NULL, 'Donna Logan')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO inventory (slug, name, listing_status, campaign_status, price_per_share_nzd, shares_total, shares_sold, leasehold_stake_pct, lease_period_months, lease_start_date, investor_return_pct, owner_rate_per_1pct_month, platform_fee_pct, marketplace_visible, trainer_name, trainer_stable, trainer_location, wins, placed, next_up, loveracing_id, image_path, story, pedigree, sex, colour, sire_name, dam_name, owner_name, horse_microchip, trainer_contact_name)
VALUES ('tml-x-yearn', 'Turn Me Loose x Yearn (unnamed)', 'pre_registration', 'coming_soon', 250.0, 20, 0, 5.0, 12, '2026-01-01', 75, NULL, 5, false, 'Stephen Gray Racing', 'Stephen Gray Racing', 'Copper Belt Lodge, near Palmerston North, New Zealand', 0, 0, 'TBD', NULL, '/images/content/horses/tml-x-yearn-BG.png', 'A 2YO bay filly by Group 1 sire Turn Me Loose out of the Group 2-winning mare Yearn.', 'Filly / Turn Me Loose (NZ) x Yearn (NZ)', 'filly', '', 'Turn Me Loose (NZ)', 'Yearn (NZ)', 'B.A.X Bloodstock', 985125000128426, 'Stephen Gray')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Holdings: 0 in JSON. Live holdings are in Google Sheets.
-- Manual export needed: export holdings tab as CSV, normalize, import.
-- See supabase/migration-guide.md for instructions.
-- ============================================================

-- ============================================================
-- Leads, communications, events: empty (no existing data to migrate)
-- ============================================================