# Supabase + PostHog Integration — Handoff Notes

**Date:** 2026-08-11 (Tuesday night)
**Project:** Evolution Stables / evo_01 / 02_website
**Goal:** Replace Google Sheets with Supabase, add PostHog analytics/flags/error-tracking

---

## What's DONE (tonight)

### ✅ Integration plan written + 3-model audited
- `/home/evo/evo_01/02_website/INTEGRATION_MAP.md` — full plan, all 10 audit fixes applied
- Audited by Nemotron Ultra, DeepSeek V4 Flash, Kimi 2.7 Code
- All critical/high issues fixed (atomic RPCs, PostHog SSR split, RLS, price derivation, dual-write)

### ✅ PostHog installed and wired
- `src/lib/posthog-client.tsx` — browser SDK, `'use client'`, useEffect init, session replay with maskAllInputs
- `src/lib/posthog-server.ts` — Node SDK for API routes, captureServerError + captureServerEvent + isFeatureEnabledServer
- `src/app/layout.tsx` — PostHogProviderWrapper wrapping children (not in RSC body)
- `src/lib/auth-context.tsx` — posthog.identify + 'signup_completed' capture
- `src/lib/usePurchaseFlow.ts` — 'purchase_started' capture
- `src/lib/checkout-fulfill.ts` — 'payment_succeeded' capture + captureServerError in catch blocks
- Packages: posthog-js, posthog-js/react, posthog-node installed

### ✅ Supabase data layer created
- `src/lib/supabase.ts` (441 lines) — all 16 functions, atomic RPCs, withRetry, deriveLotPriceFromOwnerRate preserved, .maybeSingle(), logEvent()
- Packages: @supabase/supabase-js installed

### ✅ SQL schema + seed + migration guide
- `supabase/schema.sql` (283 lines) — 5 tables, increment_shares_sold RPC, fulfill_purchase RPC, RLS deny-all, CHECK constraints, indexes
- `supabase/seed.sql` — 6 inventory rows from existing hlts.json + horses.json data
- `supabase/migration-guide.md` (317 lines) — step-by-step Supabase setup, CSV export/import, normalization rules, validation SQL, RLS tests, RPC tests, keep-alive cron

### ✅ Supabase CLI installed
- `supabase` v2.113.0 available globally

### ✅ Build passes
- `npm run build` — all 26 pages compile, TypeScript passes
- Pre-existing lint warnings remain (being fixed by subagent)

### 🔄 In progress (subagents running)
- Lint fixes — fixing all pre-existing eslint errors/warnings
- Dual-write wiring — adding Supabase calls to 10 files, gated behind DUAL_WRITE_ENABLED env var

---

## What needs YOU tomorrow

### 1. Create Supabase project (5 min)
- Go to https://supabase.com → New Project
- Name: evolution-stables
- Region: australia-southeast (closest to NZ)
- Database password: choose one, save it
- After project created, go to Settings → API:
  - Copy `Project URL` → this is NEXT_PUBLIC_SUPABASE_URL
  - Copy `anon public` key → this is NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Copy `service_role` key → this is SUPABASE_SERVICE_ROLE_KEY

### 2. Run SQL in Supabase (2 min)
- Go to SQL Editor in Supabase dashboard
- Paste contents of `supabase/schema.sql` → Run
- Paste contents of `supabase/seed.sql` → Run
- Verify: 6 rows in inventory table, 0 in holdings/leads/communications/events

### 3. Create PostHog project (3 min)
- Go to https://posthog.com → Sign up (free)
- Create organization → Create project
- Copy:
  - Project API key (starts with `phc_`) → this is NEXT_PUBLIC_POSTHOG_KEY
  - Host URL (https://us.i.posthog.com or https://eu.i.posthog.com) → this is NEXT_PUBLIC_POSTHOG_HOST
  - Personal API key (Settings → Personal API keys) → this is POSTHOG_PERSONAL_API_KEY

### 4. Add env vars to .env.local (2 min)
Add these to `/home/evo/evo_01/02_website/.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
POSTHOG_PERSONAL_API_KEY=phx_xxx
```

### 5. Export Google Sheets holdings (5 min)
- The inventory data is already seeded from JSON
- Holdings are in Google Sheets only (0 in JSON) — need manual CSV export
- Open the active spreadsheet: https://docs.google.com/spreadsheets/d/1MJvs2zcPsZ6ek_M2LhRP4jecoyheA7Rrkq8EY-8E08I/edit
- Export the `holdings` tab as CSV
- Import into Supabase Table Editor (holdings table)
- Follow normalization rules in `supabase/migration-guide.md`

### 6. Turn on dual-write (1 min)
Add to `.env.local`:
```env
DUAL_WRITE_ENABLED=true
```
Then deploy to Vercel preview, run a test purchase, verify Supabase has the holding + Sheets has the holding.

---

## What I'll do tomorrow (no user needed)

1. **After env vars set:** Run `npm run build` to verify everything compiles with real keys
2. **After Supabase project created:** Run schema + seed via `supabase` CLI instead of manual dashboard
3. **After dual-write verified:** Switch reads from Sheets → Supabase (Step 4 of integration plan)
4. **After reads switched:** Test marketplace, mystable, checkout end-to-end
5. **After 1 week clean:** Remove google-sheets.ts, remove Sheets env vars, update payment-health route
6. **Feature flags:** Wire PostHog `purchases_enabled` flag (keep env var as hard switch)
7. **KYC callback:** Wire logEvent('kyc_verified') into kyc/callback route

---

## File inventory

### New files created tonight
```
src/lib/posthog-client.tsx      — browser PostHog provider (35 lines)
src/lib/posthog-server.ts      — server PostHog Node SDK (78 lines)
src/lib/supabase.ts             — Supabase data layer (441 lines)
supabase/schema.sql             — database schema + RPCs (283 lines)
supabase/seed.sql               — 6 inventory rows (auto-generated)
supabase/migration-guide.md     — step-by-step migration guide (317 lines)
```

### Modified files
```
src/app/layout.tsx              — PostHogProviderWrapper added
src/lib/auth-context.tsx        — posthog.identify + signup_completed
src/lib/usePurchaseFlow.ts       — purchase_started capture
src/lib/checkout-fulfill.ts      — captureServerEvent + captureServerError
.env.local.example               — Supabase + PostHog env vars documented
package.json                     — posthog-js, posthog-js/react, posthog-node, @supabase/supabase-js
```

### Files to be modified tomorrow (dual-write — in progress)
```
src/lib/checkout-fulfill.ts     — add Supabase fulfillPurchase() dual-write
src/app/api/holdings/route.ts    — shadow-read Supabase
src/app/api/inventory/[slug]/route.ts — shadow-read
src/app/api/leads/route.ts       — dual-write leads
src/app/api/communications/route.ts — shadow-read
src/app/api/checkout/create-session/route.ts — shadow-read inventory
src/app/api/diagnostics/payment-health/route.ts — add Supabase health check
src/app/marketplace/page.tsx     — shadow-read inventory
src/app/marketplace/[id]/page.tsx — shadow-read inventory
src/app/api/kyc/callback/route.ts — logEvent('kyc_verified')
```

### Files NOT touched (intentional)
```
src/lib/google-sheets.ts         — stays as primary until dual-write reconciliation passes
src/lib/purchase-eligibility.ts  — feature flags come in Step 7
```

---

## Key decisions made
- **Supabase over PocketBase/Appwrite/Firebase** — Postgres RLS, atomic RPCs, Studio admin, free tier
- **PostHog over Sentry** — covers 5 tools in one (analytics, flags, replay, errors, logs) on free tier
- **Option A auth bridge** — keep Firebase Auth, use Supabase service role in API routes, RLS as defense-in-depth
- **Dual-write migration** — no big-bang swap, Sheets stays as fallback until reconciliation passes
- **Atomic RPCs** — increment_shares_sold + fulfill_purchase as Postgres functions with FOR UPDATE locks
- **PostHog split** — posthog-js for browser, posthog-node for server, never cross-import
- **PURCHASES_ENABLED stays as env var** — PostHog flag is additive, env is hard kill-switch

---

## Total cost projection
- Current: $0/mo + Stripe transaction fees
- After migration (free tiers): $0/mo
- When live with investors: $25/mo Supabase Pro + $20/mo Resend (future) = ~$45/mo
- Full stack with e-sign: ~$101/mo (Documenso + Sentry if needed)