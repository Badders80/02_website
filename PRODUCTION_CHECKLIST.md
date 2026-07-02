# 🚀 Production Go-Live Checklist

**Date**: 2026-07-02  
**Status**: Awaiting Stripe + Firebase credential setup (see `docs/STRIPE_SETUP.md`)

---

## ✅ What's Been Completed

### 1. Stripe KYC + Payments (direct) ✅
- ✅ Direct routes (kyc/create + checkout/create + webhooks) — no GCP
- ✅ Token verification + firebase-admin claims set on webhook
- ✅ Per-endpoint webhook secrets (STRIPE_KYC_WEBHOOK_SECRET + STRIPE_CHECKOUT_WEBHOOK_SECRET)
- ✅ Holdings record written to Google Sheet via OAuth on payment complete
- ✅ Applications written to Google Sheet via OAuth on enquiry submit
- ✅ usePurchaseFlow gates + /auth/verify canonical return + success banner
- ✅ Stripe package + client flows live (bypass for dev)

### 2. Google Sheets Integration ✅
- ✅ OAuth write access via Desktop app credentials
- ✅ `scripts/sheets_writer.py` — Python read/write/append via gspread
- ✅ `src/lib/sheets-write.ts` — Node.js server-side sheet writes via raw fetch
- ✅ `scripts/sync_inventory.py` — sheet → JSON with type transforms
- ✅ Applications tab created with headers
- ✅ Holdings tab headers updated (stripe_session_id, horse_microchip)
- ✅ Fire-and-forget pattern (writes don't block API responses)

### 3. Auth ✅
- ✅ Firebase Auth (email/Google) with redirect support
- ✅ ApplyForm auth gate (unauthenticated → sign-in prompt)
- ✅ KYC nudge on ApplyForm (soft banner for unverified users)
- ✅ KYC banner on MyStable

### 4. SEO ✅
- ✅ StructuredData component (Organization + Website schema)
- ✅ FAQStructuredData component (FAQ schema)
- ✅ OpenGraph image generation (branded social shares)
- ✅ Web Manifest (PWA support)
- ✅ Enhanced sitemap.xml (all routes + priorities)
- ✅ robots.txt (protects /api, /auth, /mystable, /admin)
- ✅ Enhanced metadata (keywords: RWA, blockchain, tokenized)
- ✅ Structured data rendered in layout.tsx

---

## ⏳ Remaining Steps (for Alex)

### 5. Environment Configuration
See `docs/STRIPE_SETUP.md` for step-by-step:

- [ ] Stripe Dashboard: get test API keys + register 2 webhook endpoints
- [ ] Vercel: set all env vars (see STATE.md env table)
- [ ] Firebase Console: generate service account key
- [ ] Remove stale Vercel env vars (NEXT_PUBLIC_API_BASE, CLOUD_RUN_PROXY_URL, etc.)
- [ ] Set local .env.local with test keys + bypass flags

### 6. OAuth Consent Screen
- [ ] **Publish the OAuth consent screen** in Google Cloud Console (Auth Platform → Audience → "Publish app")
- [ ] While in "Testing" mode, refresh tokens expire after 7 days
- [ ] After publishing, refresh tokens don't expire (unless revoked)

### 7. Test Flow (just-me)
- [ ] Login → marketplace → KYC verify → Stripe Identity test
- [ ] Submit enquiry → check Google Sheet Applications tab
- [ ] (If checkout wired) Purchase → Stripe test checkout → check holdings tab
- [ ] Run `python3 scripts/sync_inventory.py` → build → MyStable shows holding

### 8. Go Live
- [ ] Replace test keys with live keys in Vercel
- [ ] Update webhook endpoints to live mode in Stripe
- [ ] Remove NEXT_PUBLIC_BYPASS_STRIPE + NEXT_PUBLIC_BYPASS_AUTH_KYC
- [ ] Deploy: `vercel --prod`

---

## ⚠️ Known Limitations

- **Fire-and-forget sheet writes**: On Vercel serverless, unawaited promises may not complete before the function is frozen. Enquiry writes are low-risk. Checkout holding writes have a small risk of being lost — acceptable for now, document if it becomes an issue.
- **OAuth token on Vercel**: Token stored as `GOOGLE_OAUTH_TOKEN` env var (JSON string). Auto-refreshes when expired. If refresh fails (revoked, consent screen unpublished), writes silently fail with console log.
- **Sheet display is build-time**: `sync_inventory.py` must be run manually after sheet changes to update `src/data/*.json`. No live sheet reads for marketplace/mystable display.

## Deprecated (do not use)
- ~~`GOOGLE_SHEETS_WEB_APP_URL`~~ — replaced by direct OAuth API writes
- ~~Apps Script `doPost`~~ — not needed, direct writes via `sheets-write.ts`
- ~~`NEXTAUTH_*`~~ — Firebase Auth only
- ~~`NEXT_PUBLIC_API_BASE`~~ — GCP retired
- ~~Firestore `users.kyc_status`~~ — Firebase custom claims via Stripe webhook