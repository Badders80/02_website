# Plan: Remaining Website Work — 2026-07-02

## Context
Post-GCP Next.js site on Vercel. Firebase Auth (client), Stripe (KYC + checkout), Google Sheets (inventory SSOT). OAuth write access to Sheets now operational via `scripts/sheets_writer.py` + `scripts/token.json`. Sync pipeline (`scripts/sync_inventory.py`) fixed and verified.

## Work Items

### 1. KYC Nudge on ApplyForm (code-only, 1 file)

**File:** `src/components/marketplace/ApplyForm.tsx`

**What:** Add a soft KYC nudge banner above the form when user is logged in but `kycStatus !== "verified"`. Does NOT block submit — enquiry is lower friction than purchase.

**Spec:**
- Import `kycStatus` from `useAuth()` (already destructured as `user`, add `kycStatus`)
- After the auth gate block (line 84), before the `success` block (line 86), add a conditional banner:
  - Shows only when `user && kycStatus !== "verified"` and `!authLoading`
  - Styled as a soft info banner (not error/warning): amber border, subtle bg
  - Text: "Identity verification required to purchase shares. Complete KYC to unlock acquisition."
  - Link/button: navigates to `/auth/verify` (same as KycBanner pattern)
  - Does NOT disable the submit button
  - Does NOT redirect — user stays on the form
- Match existing styling patterns (rounded-2xl, border-white/[0.06], text sizes)
- No new imports beyond what's already in the file (useAuth already imported)

**Verification:** `npx next build` passes. Visual check: banner appears for unverified users, doesn't appear for verified.

### 2. Wire API Routes to OAuth Sheet Writes (2 files + 1 new lib)

**Problem:** `applications/submit/route.ts` and `checkout/webhook/route.ts` both fire-and-forget POST to `GOOGLE_SHEETS_WEB_APP_URL` — an Apps Script endpoint that doesn't exist. Replace with direct Google Sheets API writes via OAuth.

**New file:** `src/lib/sheets-write.ts`
- Server-side utility that uses the OAuth token to write to Google Sheets
- Cannot use `gspread` (Python) — needs a Node.js approach
- Options:
  - A: Use `googleapis` npm package (add dependency) — proper Google Sheets API v4 client
  - B: Use `fetch` to call Sheets API v4 REST endpoints directly with the OAuth access token
- **Choose B** — no new dependency, matches minimal-deps rule from AGENTS.md
- Functions:
  - `appendToSheet(tabName: string, values: any[]): Promise<boolean>`
  - Reads token from `scripts/token.json` (or env var on Vercel)
  - Refreshes token if expired using client-secret
  - Sheet ID hardcoded or from env: `GOOGLE_SHEET_ID` (already in sheets_config.json)
- **Vercel consideration:** Token file won't exist on Vercel. Need env var fallback:
  - `GOOGLE_OAUTH_TOKEN` (JSON string of token.json contents) for production
  - `GOOGLE_CLIENT_SECRET` (JSON string of client-secret.json) for production
  - Local dev: read from files
  - Fallback: if no OAuth config, log and continue (fire-and-forget, same as current behavior)

**Files to modify:**
- `src/app/api/applications/submit/route.ts`:
  - Remove `SHEETS_WEB_APP_URL` + fetch POST
  - Replace with `appendToSheet('Applications', [submitted_at, user_id, hlt_id, email, name, units_requested, message])`
  - Keep fire-and-forget pattern (try/catch, log on failure, don't block response)
- `src/app/api/checkout/webhook/route.ts`:
  - Remove `SHEETS_WEB_APP_URL` + fetch POST
  - Replace with `appendToSheet('Holdings', [user_email, hlt_id, shares_owned, purchase_date, kyc_status, stripe_session_id, horse_microchip])`
  - Same fire-and-forget pattern

**Note:** "Applications" tab doesn't exist in the sheet yet. Need to create it (can do via `sheets_writer.py` or manually). Holdings tab exists (gid=2099258130) but may need column headers added.

**Verification:** `npx next build` passes. Local test: submit an application, verify row appears in Google Sheet.

### 3. NEXT_PUBLIC_BYPASS_STRIPE env docs (trivial)

**File:** `STATE.md`
- Already listed in the Vercel env table (line 77): `NEXT_PUBLIC_BYPASS_STRIPE | Client (dev) | Without it, dev listings are empty`
- Add note to `.env.local.example` if one exists, or create one
- Add `GOOGLE_OAUTH_TOKEN` and `GOOGLE_CLIENT_SECRET` to the env table for production sheet writes

### 4. Stripe Secrets + Webhooks Plan (for Alex — manual steps)

This is NOT code — it's a checklist for Alex to do in Stripe Dashboard + Vercel + Firebase Console.

**Steps:**
1. **Stripe Dashboard** (https://dashboard.stripe.com):
   - Get test mode API keys: Secret key (`sk_test_...`) + Publishable key (`pk_test_...`)
   - Register 2 webhook endpoints:
     - `https://www.evolutionstables.nz/api/kyc/callback` (events: `identity.verification_session.*`)
     - `https://www.evolutionstables.nz/api/checkout/webhook` (events: `checkout.session.*`)
   - Copy signing secrets for each (`whsec_...`) — they're per-endpoint, not shared
2. **Vercel** (https://vercel.com/dashboard):
   - Set env vars (all environments: Dev/Preview/Prod):
     - `STRIPE_SECRET_KEY` = `sk_test_...`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
     - `STRIPE_KYC_WEBHOOK_SECRET` = `whsec_...` (for KYC callback)
     - `STRIPE_CHECKOUT_WEBHOOK_SECRET` = `whsec_...` (for checkout webhook)
     - `FIREBASE_SERVICE_ACCOUNT_KEY` = full JSON from Firebase IAM
     - `NEXT_PUBLIC_APP_URL` = `https://www.evolutionstables.nz`
     - `GOOGLE_OAUTH_TOKEN` = JSON string of token.json
     - `GOOGLE_CLIENT_SECRET` = JSON string of client-secret.json
   - Remove stale: `NEXT_PUBLIC_API_BASE`, `CLOUD_RUN_PROXY_URL`, `PAYMENTS_API_BASE`, `NEXTAUTH_*`
3. **Firebase Console** (https://console.firebase.google.com):
   - Project settings → Service accounts → Generate new private key → download JSON
   - This becomes `FIREBASE_SERVICE_ACCOUNT_KEY` in Vercel (escaped JSON string)
   - Enable Email/Password sign-in if not already
4. **Code change needed:** Split `STRIPE_WEBHOOK_SECRET` into per-endpoint secrets:
   - `api/kyc/callback/route.ts` uses `STRIPE_KYC_WEBHOOK_SECRET`
   - `api/checkout/webhook/route.ts` uses `STRIPE_CHECKOUT_WEBHOOK_SECRET`
   - Currently both read `STRIPE_WEBHOOK_SECRET` — needs fix
5. **Local .env.local:**
   - Same secrets + `NEXT_PUBLIC_BYPASS_STRIPE=true` + `NEXT_PUBLIC_BYPASS_AUTH_KYC=true` for dev
6. **Test flow (just-me):**
   - Login → marketplace detail → KYC verify → Stripe Identity test → return → claims updated
   - Submit enquiry → row in Google Sheet Applications tab
   - (If checkout wired) Purchase → Stripe test checkout → webhook → holdings row in sheet

### 5. Final Sweep
- `git status` clean
- `npx next build` passes
- All commits logical
- STATE.md updated with new env vars + sheet write capability

## Execution Order
1. KYC nudge → build → Kimi audit
2. Sheets write lib → wire API routes → build → Kimi audit
3. Env docs update → commit
4. Stripe plan → Nemotron review
5. Final sweep + commit

## Risks
- Sheets API REST calls from Next.js may need `googleapis` package if raw fetch is too complex (token refresh logic)
- Vercel cold start + OAuth token refresh could add latency to API routes — acceptable for fire-and-forget
- Applications tab doesn't exist in Google Sheet — needs creating before writes work
- Stripe webhook secret split requires code change — include in Stripe plan for Alex