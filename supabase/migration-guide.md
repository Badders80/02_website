# Supabase Migration Guide

This guide replaces the Google Sheets backend with Supabase Postgres for Evolution Stables.

## 1. Create the Supabase project

1. Sign in to [https://supabase.com](https://supabase.com).
2. Click **New project**.
3. Choose an organization, give the project a name (e.g. `evo-stables-prod`), and set a strong database password. Save it in 1Password.
4. Wait for the project status to become **Active** (usually 1–2 minutes).
5. Open **Project Settings → API** and copy:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon / public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service role key — server-only)
6. Add these to `.env.local` and `.env.local.example`.

## 2. Run the schema

1. In Supabase Studio, open the **SQL Editor**.
2. Click **New query**.
3. Copy the entire contents of `supabase/schema.sql` and paste it into the editor.
4. Click **Run**.
5. Verify that the output shows:
   - `CREATE FUNCTION` (twice)
   - `CREATE TABLE` (five tables: inventory, holdings, leads, communications, events)
   - `CREATE TRIGGER`
   - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` (five times)
   - `CREATE INDEX` (five indexes)

No client-side RLS policies are created — this is intentional. All reads/writes go through Next.js API routes that use the service role key.

## 3. Export Google Sheets tabs to CSV

1. Open the existing Google Sheet.
2. For each of these tabs, click the tab name → **Download → Comma Separated Values (.csv)**:
   - `hlts` → import into `inventory`
   - `holdings` → import into `holdings`
   - `leads` → import into `leads`
   - `communications` → import into `communications`
3. Keep the original CSV files as a backup.

## 4. Normalize data before import

Edit the CSV files or use a small script to apply these rules:

| Field | Rule |
|-------|------|
| `marketplace_visible` | Strings `"true"`, `"yes"`, `"1"` → `true`; everything else (including blank, `"false"`, `"no"`, `"0"`) → `false` |
| Empty numeric cells | Use actual `NULL`, not `0` or `""` |
| `shares_total` / `shares_sold` | Must be integers ≥ 0 and `shares_sold <= shares_total` |
| `price_per_share_nzd` | May be `NULL` only if `owner_rate_per_1pct_month` and the other owner-rate inputs are present so the app can derive it |
| `horse_slug` in `holdings` | Verify each slug exists in `inventory` **or** leave the row out if it is orphaned. There is no FK constraint so bad references will import silently. |
| Dates / timestamps | Use ISO-8601 (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`) |
| `purchase_id` in `holdings` | Must be unique and non-null. Stripe session IDs are good natural keys. |

## 5. Import CSV files

1. In Supabase Studio, open the **Table Editor**.
2. Select `inventory` → **Insert → Import data from CSV**.
3. Upload the normalized `hlts.csv`.
4. Map columns manually if the CSV headers do not match the table column names.
5. Repeat for `holdings`, `leads`, and `communications`.
6. Check the **Events** table is still empty after import. It is append-only and populated by the application, not the migration.

## 6. Validation SQL

Run these queries in the SQL Editor and confirm all pass.

### 6.1 Row count comparison

```sql
SELECT 'inventory' AS table_name, COUNT(*) AS rows FROM inventory
UNION ALL SELECT 'holdings', COUNT(*) FROM holdings
UNION ALL SELECT 'leads', COUNT(*) FROM leads
UNION ALL SELECT 'communications', COUNT(*) FROM communications
UNION ALL SELECT 'events', COUNT(*) FROM events;
```

Compare these numbers to the Google Sheet tab row counts (minus header rows).

### 6.2 NOT NULL and CHECK constraints

```sql
-- Should return zero rows
SELECT slug FROM inventory WHERE name IS NULL;
SELECT slug FROM inventory WHERE shares_total IS NULL;
SELECT slug FROM inventory WHERE shares_sold IS NULL;
SELECT slug FROM inventory WHERE shares_sold < 0 OR shares_total < 0;
SELECT slug FROM inventory WHERE shares_sold > shares_total;
SELECT purchase_id FROM holdings WHERE purchase_id IS NULL;
SELECT purchase_id FROM holdings WHERE user_email IS NULL;
SELECT purchase_id FROM holdings WHERE horse_slug IS NULL;
SELECT purchase_id FROM holdings WHERE shares_owned IS NULL;
SELECT purchase_id FROM holdings WHERE purchase_price_total_nzd IS NULL;
```

### 6.3 Price derivation check

```sql
-- Should return zero rows. price_per_share_nzd must be explicit OR derivable.
SELECT slug
FROM inventory
WHERE price_per_share_nzd IS NULL
  AND (
    owner_rate_per_1pct_month IS NULL
    OR leasehold_stake_pct IS NULL
    OR shares_total IS NULL
    OR lease_period_months IS NULL
    OR shares_total <= 0
  );
```

### 6.4 Holdings reference check

```sql
-- Should return zero rows (or only rows you intentionally want legacy)
SELECT h.purchase_id, h.horse_slug
FROM holdings h
LEFT JOIN inventory i ON i.slug = h.horse_slug
WHERE i.slug IS NULL;
```

### 6.5 Index sanity

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_holdings_email',
    'idx_holdings_horse',
    'idx_holdings_purchase',
    'idx_events_user',
    'idx_events_type',
    'inventory_slug_key'
  )
ORDER BY tablename;
```

## 7. RLS test (anon key must be denied)

Use the Supabase REST API or any HTTP client with the **anon key**:

```bash
PROJECT_URL="https://xxxxx.supabase.co"
ANON_KEY="eyJ..."

# Test each table
for table in inventory holdings leads communications events; do
  echo "Testing $table"
  curl -s -o /dev/null -w "%{http_code}\n" \
    "$PROJECT_URL/rest/v1/$table?select=*&limit=1" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $ANON_KEY"
done
```

Expected result: **401** or **403** for every table. If any table returns **200**, verify RLS is enabled and that no policies have been added.

## 8. RPC tests

Run these in the Supabase SQL Editor.

### 8.1 Setup test horse

```sql
INSERT INTO inventory (
  slug, name, shares_total, marketplace_visible, price_per_share_nzd
) VALUES (
  'rpc-test-horse', 'RPC Test Horse', 10, true, 1000.00
);
```

### 8.2 Test atomic increment

```sql
SELECT * FROM increment_shares_sold('rpc-test-horse', 3);
```

Expected:

```
 success | new_shares_sold | shares_total | shares_available
---------+-----------------+--------------+------------------
 t       |               3 |           10 |                7
```

Run it again with `5` shares — should succeed and show `shares_available = 2`.

Run it again with `3` shares — should fail (`success = false`) because only 2 shares remain. The CHECK constraint also prevents a bad write.

### 8.3 Test fulfill_purchase

```sql
SELECT * FROM fulfill_purchase(
  'pi_rpc_test_001',
  'test-buyer@example.com',
  'uid_test_123',
  'rpc-test-horse',
  1,
  1000.00,
  'https://pds.example.com/test',
  'https://sa.example.com/test',
  'verified',
  'utm_test',
  'utm_campaign_test'
);
```

Expected first call:

```
 success | duplicate |        message
---------+-----------+------------------------
 t       | f         | Fulfilled successfully
```

Run the **same** query a second time. Expected:

```
 success | duplicate |                  message
---------+-----------+-------------------------------------------
 t       | t         | Duplicate purchase_id — already fulfilled
```

Verify the holding row and event row were created:

```sql
SELECT * FROM holdings WHERE purchase_id = 'pi_rpc_test_001';
SELECT * FROM events WHERE entity_id = 'pi_rpc_test_001';
```

### 8.4 Cleanup (optional)

```sql
DELETE FROM events WHERE entity_id LIKE 'pi_rpc_test_%';
DELETE FROM holdings WHERE purchase_id LIKE 'pi_rpc_test_%';
DELETE FROM inventory WHERE slug = 'rpc-test-horse';
```

## 9. Application environment variables

Add to the Vercel project and to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

`SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser.

## 10. Keep-alive cron (prevent free-tier pausing)

Supabase free-tier projects pause after 7 days of inactivity. Set up a keep-alive ping every 5 minutes.

### Option A — Vercel cron job

Create `vercel.json` in the repo root (if it does not already exist):

```json
{
  "crons": [
    {
      "path": "/api/health/supabase",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Create `src/app/api/health/supabase/route.ts`:

```typescript
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { error } = await supabase().from('inventory').select('slug').limit(1);
  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 503 });
  }
  return Response.json({ ok: true });
}
```

Redeploy after adding the route.

### Option B — External uptime monitor

Use UptimeRobot, Pingdom, Better Uptime, or a similar service to ping:

```
https://<your-domain>/api/health/supabase
```

every 5 minutes.

### Option C — Supabase Pro

If you upgrade to Supabase Pro, pausing is disabled and keep-alive is unnecessary.

## 11. Migration checklist

- [ ] Supabase project created and env vars saved
- [ ] `supabase/schema.sql` executed with no errors
- [ ] All four Sheet tabs exported to CSV
- [ ] CSV data normalized (`marketplace_visible`, numerics, timestamps)
- [ ] CSVs imported into Supabase tables
- [ ] Row counts match the original Sheet tabs
- [ ] CHECK constraint queries return zero rows
- [ ] Price derivation query returns zero rows
- [ ] Orphaned holdings query returns zero rows (or known legacy rows)
- [ ] RLS anon-key test returns 401/403 for every table
- [ ] `increment_shares_sold` tested and prevents oversell
- [ ] `fulfill_purchase` tested and is idempotent
- [ ] Keep-alive cron or uptime monitor active (free tier)
- [ ] Application env vars set on Vercel
