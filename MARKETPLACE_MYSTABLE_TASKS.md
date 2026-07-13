# Marketplace & MyStable — Task Tracker

**Centralised source of truth.** Verified against codebase July 2026.
All `[x]` items confirmed by reading code + `tsc --noEmit` clean + `npm run build` passes.

---

## Phase 1: Security & Gatekeeping (UI & Routing) ✅ COMPLETE

- [x] Conditional rendering for detail page Right Column (Action Panel/Investment Terms)
  - [x] Identify guest users in `[id]/page.tsx` — `RightColumnActionPanel.tsx` uses `useAuth()`
  - [x] Render premium "Sign In" skeleton overlay instead of actual DOM investment data for guests
  - [x] Add prominent `← Back to Marketplace` navigation link
- [x] Auth & KYC Gate for `/purchase` page
  - [x] Validate Firebase Auth state on page entry — `PurchaseFlow.tsx` lines 48-57
  - [x] Validate `kyc_status` custom claim (`verified`) — redirects unverified to `/mystable/verify`
  - [x] Redirect anonymous users to Login (preserving destination redirect URL)
  - [x] Redirect unverified users to KYC verify flow
- [x] Sequential Step-by-Step E-Sign Modal in `PurchaseFlow.tsx`
  - [x] Split Step 3 into sequential pages (PDS first, then SA)
  - [x] Pre-populate signature input with user's KYC-verified name (read-only)
  - [x] Render inline legal warning guidelines and restrict edit accessibility
  - [x] Render compliance notice ("signed documents will be emailed to you")
  - [x] **Add "Skip to End" shortcut buttons** — `PurchaseFlow.tsx` useRef + scroll-to-bottom, guarded by ResizeObserver scrollability check (RELAY: GLM→Kimi, commit 41c3692)

---

## Phase 2: Database Layer (Google Sheets API) ✅ COMPLETE

- [x] Create google-sheets client library (`src/lib/google-sheets.ts`)
  - [x] Read functions: `readInventory`, `readInventoryBySlug`, `readHoldingsByEmail`, `readCommunicationsByEmail`
  - [x] Write functions: `appendHolding`, `appendLead`, `appendCommunication`, `updateInventorySharesSold`, `checkHoldingExists`
  - [x] Sheet auto-healer (creates missing Leads/Communications tabs with headers)
  - [x] 60s cache on inventory reads, retry with backoff, dev fallback to `token.json`
- [x] Add `fetchInventory` API route (`/api/inventory/[slug]`) to query dynamic fields
- [x] Bind detail page and purchase flow state to fetch live inventory data from sheets

---

## Phase 3: Webhook & Transaction Processing (Stripe Integration) ✅ COMPLETE

- [x] Implement checkout concurrency validation (pre-checkout check on available shares)
  - `create-session/route.ts`: 409 "Insufficient shares available" when `shares_to_buy > shares_available`
- [x] Add webhook idempotency check (verify `checkout.session.id` is not a duplicate in Holdings)
  - `webhook/route.ts`: `checkHoldingExists(sessionId)`, returns `{ duplicate: true }` on match
- [x] Add price tampering validation in webhook (verify total amount against inventory pricing)
  - `webhook/route.ts` Step 2: "Amount validation — verify session.amount_total matches expected"
- [x] Add `updateInventorySharesSold` database call in webhook
  - `webhook/route.ts` Step 4: `await updateInventorySharesSold(hltId, newSold)` + oversell alert
- [x] Trigger post-checkout welcome email (without attachments in Stage 1, placeholder note)
  - `webhook/route.ts` Step 5: nodemailer dynamic import, graceful skip if SMTP unset

---

## Phase 4: MyStable Dashboard Expansions ✅ COMPLETE

- [x] Fetch and render logged communications in Investor Inbox tab
  - `mystable/page.tsx`: `inbox` tab, fetches `/api/communications`, timeline layout, click-to-expand
- [x] Fetch and render signed document links in Documents tab
  - `mystable/page.tsx`: `documents` tab, fetches `/api/holdings`, PDS/SA links, "Documents processing" badge
- [x] New API routes: `/api/leads` (POST), `/api/communications` (GET), `/api/holdings` (GET) — all auth-required

---

## Remaining Work

### Code gaps

| # | Task | Status | Notes |
|---|---|---|---|
| ~~1~~ | ~~"Skip to End" button~~ | ✅ **Built** | RELAY GLM→Kimi, commit 41c3692. ResizeObserver guards against unloaded PDFs |
| ~~2~~ | ~~Welcome email HTML template~~ | ✅ **Built** | `buildWelcomeEmailHtml()` in webhook/route.ts lines 283-345 — branded HTML, horse name, shares table, MyStable CTA |
| ~~3~~ | ~~Admin notification email~~ | ✅ **Built** | webhook/route.ts Step 5b (lines 214-244) — sends to `ADMIN_NOTIFY_EMAIL`, investor/horse/shares/total/session table |

**No code gaps remain.** All three items previously listed were already built (2+3) or are now built (1).

### Content / Learn pages

| # | Task | Status | Notes |
|---|---|---|---|
| 12 | **`/learn/returns` — "Learn more about how returns work"** | 🔴 TODO | Investment Terms modal links here (`InvestmentTermsModal.tsx`). Stub copy in modal: pro-rata ownership, NZTR results, quarterly settlement. Needs full explainer page/section. |

### Deferred by locked decisions (not Stage 1)

| # | Task | Decision | Reason |
|---|---|---|---|
| 4 | Attribution engine (UTM capture) | D6 | Post-Stage 1 |
| 5 | PDF stamp + Drive upload pipeline | D5 | Post-Stage 1. `pdf-lib` installed but unused |
| 6 | `sync_inventory.py` live Sheets read | — | Low priority, runtime API covers it |
| 7 | Gallery images (3-4 per horse) | — | Needs source photos |

### Blocked on user (non-code, env vars)

| # | Task | Who | 
|---|---|---|
| 8 | `STRIPE_SECRET_KEY` in Vercel env vars | Alex |
| 9 | `GOOGLE_SERVICE_ACCOUNT_KEY` in Vercel env vars | Alex |
| 10 | `SMTP_HOST/PORT/USER/PASS/FROM` in Vercel env vars | Alex |
| 11 | Live end-to-end testing against Google Sheets API | Both (after env vars) |

---

## Build Verification

- `tsc --noEmit` — ✅ clean (0 errors)
- `npm run build` — ✅ passes (all routes compile, static + dynamic pages generated)
- Last verified: July 2026