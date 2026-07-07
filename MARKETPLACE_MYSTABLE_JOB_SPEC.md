# Production Marketplace & MyStable — Final Implementation Plan

**Status:** ✅ LOCKED — Approved by Alex Baddeley after Nemotron + DeepSeek review
**Date:** July 2026
**Supersedes:** Discussion draft job spec (same filename, previous version)
**Reviews:** `reviews/nemotron-review.md`, `reviews/deepseek-review.md`

---

## 0. Locked Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | **Conditional rendering** for guest action panel (not CSS blur) | Investment data never enters the DOM for unauthenticated users. Left column stays public for SEO. |
| D2 | **Auth-gate + KYC-gate the purchase page** | Direct URL access to `/marketplace/[slug]/purchase` must redirect unauthenticated → login, unverified → KYC flow. |
| D3 | **Webhook updates Inventory `shares_sold`** | The Stripe webhook must increment `shares_sold` in the Inventory sheet on purchase completion. |
| D4 | **Lightweight optimistic verification** for concurrency | Checkout creation reads live `shares_sold` from Sheets, blocks if insufficient shares. Webhook lets oversells write to Holdings (payment data preserved) but flags for manual reconciliation/refund. |
| D5 | **Defer PDF pipeline for Stage 1** | Webhook records holding + updates inventory + sends welcome email (no attachments, placeholder note about signed docs coming soon). PDF generation runs as a separate background task. |
| D6 | **Defer attribution engine to post-Stage 1** | UTM capture is easy but end-to-end piping adds testing overhead. Core KYC + payment flow first. |
| D7 | **Webhook amount/price validation** | Webhook must verify `amount_total` matches `shares_to_buy × price_per_share` from Inventory sheet to prevent client-side price tampering. |
| D8 | **Webhook idempotency** | Check if `checkout.session.id` already exists in Holdings before processing to prevent duplicate records on Stripe retry. |
| D9 | **Public detail page for SEO** (user-confirmed) | Overrides Addendum Section 1's full auth-gating. |

---

## 1. Codebase Audit: What Actually Exists

### Already Built ✅

| Feature | File(s) | Status |
|---|---|---|
| Marketplace grid | `src/app/marketplace/page.tsx`, `ListingGrid.tsx` | Working, reads from `hlts.json` |
| Detail page (SSG) | `src/app/marketplace/[id]/page.tsx` | Server component, pre-rendered from local JSON. Left column = narrative. Right column = action panel with status badge + InvestmentTermsModal |
| Investment Terms modal | `InvestmentTermsModal.tsx` | Working, shows price/lease/returns/shares |
| Purchase flow | `PurchaseFlow.tsx`, `PurchaseForm.tsx`, `/marketplace/[id]/purchase/page.tsx` | Multi-step: amount → summary → T&C → Stripe Checkout. **NOT auth/KYC gated.** |
| Confirmation page | `/marketplace/[id]/confirm/page.tsx` | Exists |
| Firebase Auth (email + Google) | `firebase.ts`, `auth-context.tsx`, `auth/login/page.tsx` | Working. Login page supports `?redirect=` param for context preservation |
| Auth context (client-side) | `auth-context.tsx` | Provides `user`, `loading`, `kycStatus`, `role`, `isAdmin`, `signIn`, `signUp`, `signOut`, `refreshClaims`. Uses Firebase custom claims for KYC state |
| KYC: create session | `/api/kyc/create-session/route.ts` | Creates Stripe Identity verification session, sets `kyc_status: pending` in Firebase claims |
| KYC: status check | `/api/kyc/status/route.ts` | Queries Stripe Identity API, syncs verified status to Firebase custom claims |
| KYC: callback | `/api/kyc/callback/route.ts` | Exists |
| KYC: verify pages | `/auth/verify/page.tsx`, `/mystable/verify/page.tsx` | Exists |
| Stripe Checkout: create session | `/api/checkout/create-session/route.ts` | Creates checkout session with metadata (user_id, hlt_id, shares, microchip). **No live inventory check.** |
| Stripe Checkout: webhook | `/api/checkout/webhook/route.ts` | Handles `checkout.session.completed`. Writes holding to Google Sheets via web app bridge. **Does NOT update Inventory, no idempotency, no amount validation, no email, no PDFs.** |
| MyStable dashboard | `src/app/mystable/page.tsx` | Auth-gated (blurred overlay for guests). Reads from `holdings.json` (local static). Shows holdings list, onboarding tracker, stable logs feed (mock). |
| OnboardingFlow | `OnboardingFlow.tsx` | 3-step tracker: Create Account → Verify Identity → Acquire First Horse |
| SSOT sync pipeline | `scripts/sync_inventory.py` | Syncs SSOT JSON → website `src/data/*.json` |
| Status system | `campaign-status.ts` | 4 badges: Coming Soon, Become An Owner, Fully Subscribed, Term Completed |
| Detail tabs | `DetailTabs.tsx` | Pedigree, trainer, record, documents — with breeding/performance URLs |
| Admin panel | `src/app/admin/` | Exists (dormant per PRD) |
| Data files | `horses.json`, `hlts.json`, `trainers.json`, `owners.json`, `holdings.json` | Static JSON synced from SSOT |

### Not Built ❌

| Feature | Notes |
|---|---|
| **Detail page guest conditional rendering** | Right column action panel renders fully for everyone. No "Sign In to Access Investment Terms" CTA. |
| **Purchase page auth/KYC gating** | Direct URL access bypasses all checks. |
| **KYC processing screen** | No `/marketplace/[id]/kyc-processing` page. No "Check Status Again" UI. No fallback lead capture. |
| **Google Sheets client lib** | No `src/lib/google-sheets.ts`. Webhook uses Google Apps Script web app bridge for holdings writes only. No read functions for Inventory. No `updateInventorySharesSold`. |
| **Attribution engine** | DEFERRED to post-Stage 1. |
| **PDF generation pipeline** | DEFERRED — Stage 1 sends welcome email with placeholder note. |
| **Welcome email** | No email template, no SMTP/nodemailer. |
| **Investor Inbox** | No communications tab in MyStable. |
| **Documents section** | No document repository in MyStable. |
| **MyStable dynamic data** | MyStable reads from `holdings.json` (static), not Google Sheets API. |
| **PDS/SA for First Gear + I Stole A Manolo** | Placeholder PDFs needed |
| **Gallery images** | Only mock placeholders |
| **Stripe secret key in Vercel** | Not deployed |

---

## 2. Stage 1 Implementation Components

### Component 1: Detail Page — Guest Conditional Rendering + Live Inventory

**Files:** `src/app/marketplace/[id]/page.tsx` (MODIFY) + `src/components/marketplace/ActionPanel.tsx` (NEW)

**What it does:**
- Extract the right column (status badge + Investment Terms Modal) into a new client component `ActionPanel.tsx`
- `ActionPanel.tsx` uses `useAuth()` to check auth state
- **Unauthenticated:** Render a placeholder skeleton (no real data in DOM) + "Sign In to Access Investment Terms" CTA linking to `/auth/login?redirect=/marketplace/[slug]`
- **Authenticated:** Render the full action panel with live inventory data
- Fetch live `shares_sold`, `listing_status`, `price_per_share_nzd` from a new API route `/api/inventory/[slug]` (cached 60s TTL via Google Sheets read)
- The "Acquire" button (inside InvestmentTermsModal) checks `kycStatus`:
  - `verified` → navigate to `/marketplace/[slug]/purchase`
  - `pending` → navigate to `/marketplace/[slug]/kyc-processing`
  - `none` → trigger Stripe Identity KYC flow (call `/api/kyc/create-session`)
- Add prominent `← Back to Marketplace` link above the two-column layout

**SEO impact:** None. Left column (narrative, pedigree, story) remains server-rendered and fully crawlable. Right column hydrates client-side with no data in DOM for guests.

**New API route:** `src/app/api/inventory/[slug]/route.ts` — reads Inventory sheet row for a single horse, returns `{ shares_total, shares_sold, shares_available, listing_status, price_per_share_nzd }`. Cached with 60s revalidation.

**Depends on:** Component 4 (Google Sheets lib), existing auth-context, existing login redirect support.

---

### Component 2: Purchase Page — Auth/KYC Gate + Live Inventory

**Files:** `src/app/marketplace/[id]/purchase/page.tsx` (MODIFY)

**What it does:**
- Convert to client component (or wrap in a client layout guard)
- On mount, check `useAuth()`:
  - Unauthenticated → redirect to `/auth/login?redirect=/marketplace/[slug]/purchase`
  - Authenticated but `kycStatus !== 'verified'` → redirect to `/marketplace/[slug]` (detail page, where they can initiate KYC)
- Fetch live `shares_available` from `/api/inventory/[slug]` to display in the amount selector
- If `shares_available === 0`, show "Fully Subscribed" message and disable the form

**Depends on:** Component 4 (Google Sheets lib), existing auth-context.

---

### Component 3: Checkout Session — Live Inventory Verification + Concurrency Control

**Files:** `src/app/api/checkout/create-session/route.ts` (MODIFY)

**What it does:**
- Before creating the Stripe Checkout session, read live `shares_sold` and `shares_total` from Google Sheets Inventory
- Calculate `shares_available = shares_total - shares_sold`
- If `shares_to_buy > shares_available`, reject with 409 Conflict: "Insufficient shares available"
- This is the optimistic verification step — prevents most race conditions before checkout is even created
- Include `price_per_share_nzd` (from Inventory sheet, not client-provided) in the Stripe line items to prevent price tampering

**Depends on:** Component 4 (Google Sheets lib).

---

### Component 4: Google Sheets Client Library

**Files:** `src/lib/google-sheets.ts` (NEW)

**Auth:** Google Service Account with Sheets API scope. Credentials in `GOOGLE_SERVICE_ACCOUNT_KEY` env var (JSON). Use `googleapis` npm package (import `@googleapis/sheets` individually to reduce bundle).

**Sheet ID:** `1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg`

**Functions:**
- `readInventory()` — read all rows from Inventory tab, return as typed array
- `readInventoryBySlug(slug)` — read single horse row from Inventory tab
- `readHoldingsByEmail(email)` — read Holdings tab, filter by user_email
- `readCommunicationsByEmail(email)` — read Communications tab, filter by recipient_email
- `appendHolding(row)` — append to Holdings tab
- `appendLead(row)` — append to Leads tab
- `appendCommunication(row)` — append to Communications tab
- `updateInventorySharesSold(slug, newSharesSold)` — update `shares_sold` for a horse in the Inventory tab

**Caching:** Inventory reads cached with 60s TTL. Writes are immediate. Holdings/Communications reads are not cached (user-specific, low frequency).

**Fallback:** If Sheets API is unreachable, fall back to static `hlts.json` for inventory reads. Log error. API routes return appropriate error responses.

**Error handling:** Retry with exponential backoff (3 attempts) on transient failures. Log all errors. Never crash the webhook — fail safe.

---

### Component 5: Stripe Webhook — Production Hardening

**Files:** `src/app/api/checkout/webhook/route.ts` (MODIFY)

**Enhanced flow on `checkout.session.completed`:**

1. **Idempotency check:** Extract `checkout.session.id`. Read Holdings sheet, check if a row with this `purchase_id` already exists. If yes, return 200 `{ received: true, duplicate: true }` and skip processing.

2. **Amount validation:** Extract `shares_to_buy` and `hlt_id` from metadata. Read `price_per_share_nzd` from Inventory sheet. Calculate `expected_total = shares_to_buy × price_per_share_nzd × 100` (cents). Compare to `session.amount_total`. If mismatch, log critical alert, still record the holding but flag for manual review.

3. **Record holding:** Append to Holdings sheet:
   - `purchase_id`: session.id
   - `timestamp`: ISO timestamp
   - `user_email`: from metadata
   - `horse_slug`: from metadata (hlt_id)
   - `shares_owned`: from metadata
   - `purchase_price_total_nzd`: calculated from amount_total
   - `signed_pds_url`: empty (PDF deferred)
   - `signed_sa_url`: empty (PDF deferred)
   - `kyc_status`: "verified"
   - `utm_source`: "pending" (attribution deferred)
   - `utm_campaign`: "pending" (attribution deferred)

4. **Update inventory:** Call `updateInventorySharesSold(horse_slug, current_shares_sold + shares_to_buy)`. If the new total exceeds `shares_total`, log a critical oversell alert for manual reconciliation/refund. Let the write complete (payment data preserved).

5. **Send welcome email:** Via nodemailer/SMTP:
   - Subject: "Welcome to the [Horse Name] Syndicate!"
   - Body: Welcome message + what happens next + link to MyStable
   - Placeholder note: "Your official signed agreements (PDS and Syndicate Agreement) are being processed and will appear in your MyStable portal shortly."
   - No PDF attachments in Stage 1.

6. **Log communication:** Append to Communications sheet:
   - `timestamp`, `recipient_email`, `subject`, `snippet`, `body_html`, `category: "welcome"`

**New env vars:**
- `GOOGLE_SERVICE_ACCOUNT_KEY` — JSON service account key (Sheets + Drive scopes)
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` — for nodemailer

**Error handling:** Each step in a try/catch. If email or communication logging fails, the holding is still recorded and inventory still updated. Fail safe — never lose payment data.

---

### Component 6: KYC Processing Screen

**Files:** `src/app/marketplace/[id]/kyc-processing/page.tsx` (NEW)

**Behavior:**
- Shows "We are currently verifying your identity. This typically takes less than 2 minutes."
- "Check Status Again" button → calls `/api/kyc/status`:
  - If `verified` → redirect to `/marketplace/[slug]/purchase`
  - If still `pending` → show "Still processing" message with retry
  - If `requires_input` or `failed` → show the fallback option
- "Register for Manual Assistance" button → opens a simple lead capture form that writes to the `Leads` sheet with `action_type: 'kyc_failed'`

**Depends on:** Existing `/api/kyc/status` endpoint, Component 4 (Google Sheets lib for Leads write).

---

### Component 7: MyStable Expansions — Investor Inbox + Documents

**Files:** `src/app/mystable/page.tsx` (MODIFY) + new API routes

**New sections:**

1. **Investor Inbox tab**
   - Client-side fetch from new API route `/api/communications` (auth-required)
   - API route calls `readCommunicationsByEmail(user.email)` from Google Sheets lib
   - Timeline layout matching existing "Stable Logs & Feed" design
   - Each entry: subject, snippet, timestamp, category badge
   - Click to expand and view `body_html`
   - Empty state: "No communications yet"

2. **Documents section**
   - Client-side fetch from new API route `/api/holdings` (auth-required)
   - API route calls `readHoldingsByEmail(user.email)` from Google Sheets lib
   - Filterable by horse (dropdown)
   - Cards showing: horse name, PDS link, SA link, purchase date, shares owned
   - In Stage 1, links will be empty (PDFs deferred) — show "Documents processing" badge
   - Links open in new tab (Google Drive view) when available

**New API routes:**
- `src/app/api/communications/route.ts` — GET, auth-required (Firebase token verification), returns communications for authenticated user
- `src/app/api/holdings/route.ts` — GET, auth-required, returns holdings for authenticated user from Google Sheets (not static JSON)

**Hybrid data strategy:** Initial render from static `holdings.json` (fast first paint), client-side fetch from `/api/holdings` (live data) with loading skeleton. Error boundary falls back to static JSON with "Data may be delayed" notice.

**Depends on:** Component 4 (Google Sheets lib), existing auth-context.

---

## 3. Deferred to Post-Stage 1

| Feature | Rationale |
|---|---|
| **PDF e-sign pipeline** (pdf-lib + Drive upload) | Adds serverless timeout risk and complexity. Stage 1 sends welcome email with placeholder note. PDFs generated via background script. |
| **Attribution engine** (UTM capture + logging) | Not in original PRD. Core KYC + payment flow first. Fast follow-up. |
| **sync_inventory.py enhancement** (live shares at build time) | Low priority — runtime API fetch covers this. |
| **Stage 2 brand polish** (premium styling on new components) | After Stage 1 flows are verified end-to-end. |

---

## 4. Google Sheets Schema (Finalized)

### Tab 1: `Inventory`

| Column | Type | Example | Notes |
|---|---|---|---|
| `slug` | string (PK) | `prudentia` | Primary key |
| `name` | string | `Prudentia` | Display name |
| `listing_status` | enum | `active` | `draft` / `active` / `retired` |
| `price_per_share_nzd` | number | `120.00` | Used for amount validation |
| `shares_total` | number | `100` | Total shares offered |
| `shares_sold` | number | `45` | Incremented by webhook |
| `leasehold_stake_pct` | number | `10` | |
| `lease_period_months` | number | `24` | |
| `lease_start_date` | date | `2026-08-01` | |
| `investor_return_pct` | number | `100` | |
| `trainer_name` | string | `Tony Pike` | |
| `trainer_stable` | string | `Pike Racing` | |
| `trainer_location` | string | `Cambridge, NZ` | |
| `wins` | number | `2` | |
| `placed` | number | `4` | |
| `next_up` | string | `12 July 2026 at Ruakaka` | |
| `loveracing_id` | number (optional) | `109482` | |

### Tab 2: `Holdings`

| Column | Type | Example | Notes |
|---|---|---|---|
| `purchase_id` | string (PK) | `ch_3Mxyz...` | Stripe checkout session ID. Used for idempotency. |
| `timestamp` | ISO datetime | `2026-07-07T12:00:00Z` | |
| `user_email` | string | `investor@example.com` | Filtered by MyStable |
| `horse_slug` | string | `prudentia` | |
| `shares_owned` | number | `5` | |
| `purchase_price_total_nzd` | number | `600.00` | |
| `signed_pds_url` | string | (empty in Stage 1) | Populated when PDF pipeline ships |
| `signed_sa_url` | string | (empty in Stage 1) | Populated when PDF pipeline ships |
| `kyc_status` | string | `verified` | |
| `utm_source` | string | `pending` | Populated when attribution ships |
| `utm_campaign` | string | `pending` | Populated when attribution ships |

### Tab 3: `Leads`

| Column | Type | Example |
|---|---|---|
| `timestamp` | ISO datetime | `2026-07-07T12:00:00Z` |
| `user_email` | string | `lead@example.com` |
| `user_name` | string | `Jane Doe` |
| `horse_slug` | string | `prudentia` |
| `action_type` | enum | `interest` / `waitlist` / `kyc_failed` |
| `utm_source` | string | (empty — attribution deferred) |
| `utm_campaign` | string | (empty — attribution deferred) |
| `referrer_url` | string | `https://linkedin.com/feed/...` |
| `status` | enum | `New` / `Contacted` / `Resolved` |

### Tab 4: `Communications`

| Column | Type | Example |
|---|---|---|
| `timestamp` | ISO datetime | `2026-07-07T12:05:00Z` |
| `recipient_email` | string | `investor@example.com` |
| `subject` | string | `Welcome to the Prudentia Syndicate!` |
| `snippet` | string | Short text preview |
| `body_html` | string | Full HTML content |
| `category` | enum | `welcome` / `monthly_update` / `syndicate_notice` |

---

## 5. Dependency Graph & Build Order

```
Component 4 (Google Sheets lib) ───────────────────────┐
                                                         ├─► Component 1 (Detail page + ActionPanel)
                                                         ├─► Component 2 (Purchase page auth gate)
                                                         ├─► Component 3 (Checkout concurrency check)
                                                         ├─► Component 5 (Webhook hardening)
                                                         ├─► Component 6 (KYC processing screen)
                                                         └─► Component 7 (MyStable expansions)
```

**Build order:**
1. **Component 4** — Google Sheets lib (foundation for everything)
2. **Component 1** — Detail page conditional rendering + live inventory (parallel-safe with Component 2)
3. **Component 2** — Purchase page auth/KYC gate (parallel-safe with Component 1)
4. **Component 3** — Checkout session concurrency check
5. **Component 5** — Webhook hardening (idempotency + amount validation + inventory update + welcome email)
6. **Component 6** — KYC processing screen
7. **Component 7** — MyStable expansions (Inbox + Documents)

**Estimated effort (1 dev):** ~7-8 days for Stage 1

---

## 6. Stage 1 Verification Checklist

- [ ] Guest visits `/marketplace/[slug]` → sees narrative (left column), action panel shows placeholder skeleton + "Sign In" CTA (no investment data in DOM)
- [ ] Guest clicks "Sign In" → goes to `/auth/login?redirect=/marketplace/[slug]` → logs in → returns to same detail page with full action panel
- [ ] Authenticated user clicks "Acquire" → if KYC verified, goes to purchase page
- [ ] Authenticated user clicks "Acquire" → if KYC unverified, goes to Stripe Identity flow → returns to KYC processing screen → "Check Status" → verified → goes to purchase
- [ ] Unauthenticated user tries to directly visit `/marketplace/[slug]/purchase` → redirected to login with return redirect
- [ ] Authenticated but unverified user tries to visit `/marketplace/[slug]/purchase` → redirected to detail page
- [ ] User can't complete KYC → clicks "Manual Assistance" → lead form writes to Google Sheets Leads tab
- [ ] Checkout creation blocks if `shares_to_buy > shares_available` (live from Sheets)
- [ ] Stripe checkout completes → webhook records holding (with idempotency check) → updates Inventory `shares_sold` → sends welcome email → logs to Communications sheet
- [ ] Duplicate webhook delivery → idempotency check prevents duplicate holding
- [ ] Webhook detects amount mismatch → flags for manual review
- [ ] MyStable Investor Inbox shows welcome email for the user
- [ ] MyStable Documents section shows holding with "Documents processing" badge (PDFs deferred)
- [ ] Google Sheets API unavailable → marketplace falls back to static JSON, MyStable shows "Data may be delayed"

---

## 7. New Environment Variables

| Variable | Purpose | Stage |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | JSON service account key for Sheets API | Stage 1 |
| `STRIPE_SECRET_KEY` | Already needed — deploy to Vercel | Stage 1 |
| `STRIPE_CHECKOUT_WEBHOOK_SECRET` | Already needed — deploy to Vercel | Stage 1 |
| `SMTP_HOST` | Email sending via nodemailer | Stage 1 |
| `SMTP_PORT` | Email sending via nodemailer | Stage 1 |
| `SMTP_USER` | Email sending via nodemailer | Stage 1 |
| `SMTP_PASS` | Email sending via nodemailer | Stage 1 |
| `GOOGLE_DRIVE_FOLDER_ID` | Parent folder for signed PDF uploads | Post-Stage 1 |

---

## 8. Risk Summary

| Risk | Impact | Mitigation |
|---|---|---|
| Google Sheets API rate limits | Marketplace/MyStable data unavailable | Cache Inventory reads (60s TTL), fallback to static JSON |
| Race condition on `shares_sold` | Overselling shares | Optimistic verification at checkout creation + oversell alert flag in webhook |
| Webhook timeout | Holding not recorded | Each step in try/catch, fail safe. Email/communication logging failures don't block holding record |
| Vercel function cold starts | Slow API responses | Use individual `@googleapis/sheets` imports. Acceptable for v1 volume. |
| SMTP delivery failure | Welcome email not sent | Log error, holding still recorded. Retry via manual sync. |
| Google Sheets as database scaling | Performance degrades with rows | Acceptable for v1 (<100 transactions). Plan migration to proper DB for v2. |
| Detail page hydration mismatch | SEO/content flash | Conditional rendering — no data in DOM for guests, no flash. Server renders placeholder. |

---

## 9. Post-Stage 1 Roadmap

| Feature | Priority | Notes |
|---|---|---|
| PDF e-sign pipeline (pdf-lib + Drive) | High | Background script or separate serverless function. Appends signature audit page to PDS/SA PDFs. Uploads to Drive. Updates Holdings with links. Sends email with attachments. |
| Attribution engine (UTM capture) | Medium | Client-side localStorage capture. Piped through checkout to webhook to Holdings. |
| Admin notification email | Medium | On purchase, email operations team with buyer details. |
| Placeholder PDFs for First Gear + I Stole A Manolo | Medium | Branded "Document Pending" PDFs. |
| Gallery images (3-4 per horse) | Medium | Source/upload images. |
| sync_inventory.py live shares merge | Low | Merge live `shares_sold` from Sheets at build time for SEO-perfect initial HTML. |
| Stage 2 brand polish | Low | Premium styling on new components (KYC screen, Inbox, Documents). |
| Vercel KV / Upstash Redis cache | Low | Add edge cache layer if Sheets API rate limits become an issue. |
| Legal review of signature page | Medium | Confirm appended audit page meets NZ FMC Act requirements. |