# Phase 2 Review — Google Sheets API Integration + Live Inventory

**Reviewer:** Kimi refiner  
**Date:** 7 July 2026  
**Scope:** `src/lib/google-sheets.ts`, `/api/inventory/[slug]/route.ts`, `RightColumnActionPanel.tsx`, `PurchaseFlow.tsx`, `purchase/page.tsx`, plus verification that the four Phase 1 criticals were fixed.  
**Verdict:** ❌ **Not production-ready**. The Google Sheets library is wired into the detail/purchase UIs, but it is misaligned with the agreed schema, uses OAuth token files in production, lacks caching/fallbacks, and leaks the spreadsheet ID. The live-inventory UI has race and UX issues. **Phase 1 criticals C1, C2, C3 remain unfixed.**

---

## 1. Phase 1 Critical Verification

| ID | Item | File | Expected | Status | Notes |
|---|---|---|---|---|---|
| C1 | Checkout field name | `PurchaseFlow.tsx` | Use `shares_to_buy`, not `shares` | ❌ **Unfixed** | Line 119 still sends `shares: sharesToBuy`. The checkout API destructures `shares_to_buy`, so this is still a broken checkout. |
| C2 | Force-dynamic purchase page | `purchase/page.tsx` | `export const dynamic = "force-dynamic"` | ❌ **Unfixed** | Page still SSGs (`generateStaticParams`, no `dynamic` export). Full form HTML + data is served to unauthenticated requests/bots. |
| C3 | Remove "Skip to End" buttons | `PurchaseFlow.tsx` | No skip buttons on PDS/SA | ❌ **Unfixed** | Lines 306-318 and 407-420 still contain "Skip to End ↓" buttons that bypass scroll-to-acknowledge. |
| C4 | Stop passing sensitive investment props | `purchase/page.tsx` → `PurchaseFlow` | Pass only safe props; fetch investment data client-side | ⚠️ **Partially addressed** | `purchase/page.tsx` still passes `pricePerShareNzd`, `totalLeasePercent`, `investorReturnPct`, `sharesTotal`, `sharesAvailable`. The new `/api/inventory/[slug]` route provides live data, but the server component continues to leak these values into the RSC flight payload instead of letting `PurchaseFlow` fetch them. |

**Summary:** Three of four Phase 1 criticals are unchanged. Only the prop-leak issue moved in the right direction (live fetch was added), but the server still serializes sensitive values to the client.

---

## 2. `src/lib/google-sheets.ts`

### 2.1 Auth model is wrong for production

- **Issue:** Uses an OAuth2 refresh-token flow (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`) and falls back to reading `scripts/token.json` from disk.
- **Plan requirement (§4, §7):** Service account with `GOOGLE_SERVICE_ACCOUNT_KEY` env var (JSON key).
- **Impact:** A refresh token tied to a user account is brittle for a serverless production app and the `token.json` fallback is a local-dev convenience that will fail on Vercel. The implementation should use `google.auth.GoogleAuth` with `credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)` and scopes `['https://www.googleapis.com/auth/spreadsheets']`.
- **Recommendation:** Replace `getGoogleAuthClient()` with service-account auth; remove `token.json` fallback.

### 2.2 Spreadsheet ID hard-coded

- **Issue:** `const SPREADSHEET_ID = "1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg";`
- **Impact:** A repo-visible ID is not a secret per se, but it prevents per-environment sheets, makes rotation impossible, and exposes the canonical sheet to any fork/CI log.
- **Recommendation:** Move to `process.env.GOOGLE_SPREADSHEET_ID` and fail fast if missing.

### 2.3 Tab/schema mismatch with the implementation plan

#### Inventory tab

- **Issue:** `getLiveInventory` reads from range `"hlts!A:Z"` and expects the header `horse_slug`.
- **Plan schema (§4):** Tab should be named `Inventory`, primary column `slug`.
- **Impact:** If the sheet already follows the plan schema, this function will always return `null` because it searches the wrong tab for the wrong column. If the sheet is still named `hlts` and uses `horse_slug`, then the implementation works but the codebase is not aligned with the locked spec.
- **Recommendation:** Rename tab reference to `Inventory` and column reference to `slug` (or clearly document the deviation).

#### Holdings tab

- **Issue:** `appendHolding` writes columns: `user_email`, `hlt_id`, `shares_owned`, `purchase_date`, `kyc_status`, `stripe_session_id`, `horse_microchip`.
- **Plan schema (§4):** Holdings columns are: `purchase_id`, `timestamp`, `user_email`, `horse_slug`, `shares_owned`, `purchase_price_total_nzd`, `signed_pds_url`, `signed_sa_url`, `kyc_status`, `utm_source`, `utm_campaign`.
- **Impact:** Column names, order, and semantics differ. The webhook (not in scope of this review but referenced in plan §5) will not be able to use this helper to satisfy the plan schema. `purchase_id` is missing, `purchase_price_total_nzd` is missing, `signed_*_url` placeholders are missing, UTM fields are missing, and `horse_microchip` is not a Holdings column per the plan.
- **Recommendation:** Re-implement `appendHolding` to match the plan schema exactly.

#### Leads tab

- **Issue:** `appendLead` expects `{ email, name?, phone?, notes?, date }` and writes columns `email, name, phone, notes, date`.
- **Plan schema (§4):** Leads columns are: `timestamp`, `user_email`, `user_name`, `horse_slug`, `action_type`, `utm_source`, `utm_campaign`, `referrer_url`, `status`.
- **Impact:** Schema is completely different. `horse_slug`, `action_type`, `referrer_url`, `status` are missing.
- **Recommendation:** Align signature and columns with the plan.

#### Communications tab

- **Issue:** `appendCommunication` writes columns `user_email`, `subject`, `body`, `sent_date`, `direction`.
- **Plan schema (§4):** Communications columns are: `timestamp`, `recipient_email`, `subject`, `snippet`, `body_html`, `category`.
- **Impact:** `snippet`, `category` missing; `direction` is not in the plan; `body` vs `body_html` naming mismatch.
- **Recommendation:** Align signature and columns with the plan. Add `category` (e.g. `"welcome"`) and a `snippet` param.

#### Fetch functions

- **Issue:** `fetchCommunications` and `fetchHoldings` headers are aligned with the wrong schema (e.g. `direction` for communications, `purchase_date`/`hlt_id` for holdings).
- **Recommendation:** Re-implement against the plan schema and add `readInventoryBySlug(slug)` and `readInventory()` helpers.

### 2.4 Missing required helpers

The plan (§4) requires:

- `readInventory()` — not implemented.
- `readInventoryBySlug(slug)` — partially implemented as `getLiveInventory` but with wrong tab/column.
- `updateInventorySharesSold(slug, newSharesSold)` — **not implemented**.
- `appendLead` — implemented with wrong schema.
- `appendCommunication` — implemented with wrong schema.

### 2.5 No caching or fallback

- **Issue:** Every read calls the Sheets API directly with no TTL cache and no fallback to `hlts.json`.
- **Plan requirement (§4):** Inventory reads cached 60s; fallback to static JSON when Sheets is unreachable.
- **Impact:** Detail/purchase pages will hit rate limits and show blank/null state on API errors.
- **Recommendation:** Add an in-memory or Vercel-compatible cache (e.g. `cache()` from Next.js) for `readInventory`, and return static JSON on failure.

### 2.6 No retry/backoff

- **Plan requirement (§4):** Retry with exponential backoff (3 attempts) on transient failures.
- **Issue:** No retries anywhere.
- **Recommendation:** Wrap API calls in a small retry wrapper.

### 2.7 `ensureSheetExists` swallows errors and uses `console.log`

- **Issue:** `ensureSheetExists` catches errors silently and prints to stdout. It does not propagate failure, so a missing sheet + failed create results in a later 500 from the append call rather than a clear error.
- **Recommendation:** Throw on failure; use a structured logger if available.

### 2.8 `any` types

- **Issue:** Functions accept/return `any` for rows, `err: any`.
- **Recommendation:** Add interfaces (`InventoryRow`, `HoldingRow`, `LeadRow`, `CommunicationRow`) and type the Google API client.

---

## 3. `src/app/api/inventory/[slug]/route.ts`

### 3.1 Good

- `export const dynamic = "force-dynamic"` is present.
- `encodeURIComponent` is used by the caller, not here, but the route handles the slug param correctly.
- Returns 404 when slug not found.

### 3.2 Issues

- **No caching headers:** The plan calls for a 60s TTL. Currently every request triggers a full Sheets read.
- **Relies on `getLiveInventory` schema mismatch:** As noted above, if the sheet tab is `Inventory` with column `slug`, this route returns 404 for every slug.
- **No fallback to static JSON:** On Sheets failure, `getLiveInventory` returns `null`, which the route turns into a 404. A guest or search crawler would see an unavailable horse rather than the static data.
- **Response shape omits `shares_available` and `price_per_share_nzd`:** The plan (§2 Component 1) expects the API to return `{ shares_total, shares_sold, shares_available, listing_status, price_per_share_nzd }`. Current shape is `{ shares_sold, shares_total, listing_status }`.
- **Recommendation:** Update to match the plan response, add `NextResponse` cache headers, and fall back to static JSON on error.

---

## 4. `RightColumnActionPanel.tsx`

### 4.1 Good

- Uses `useAuth()` and renders a skeleton/CTA for guests (no real data in the DOM) — matches plan D1.
- Fetches live inventory on mount.
- Handles the fully-subscribed case by overriding status to `"fully-subscribed"` when `currentSharesAvailable === 0`.

### 4.2 Issues

- **Still receives sensitive props:** The server component still passes `pricePerShareNzd`, `totalLeasePercent`, `leasePeriodMonths`, `leaseStartDate`, `investorReturnPct`, `sharesTotal`, `sharesAvailable` as props. They are in the React flight payload and visible via DevTools/page source even for guests.
- **Recommendation:** Server component should pass only `status`, `horseName`, `horseSlug`. All investment data should be fetched client-side from `/api/inventory/[slug]` (or a richer endpoint) when the user is authenticated.
- **Auth-gated data is still fetched for guests:** The `useEffect` fetches `/api/inventory/[slug]` unconditionally. The API route is not auth-gated, so a guest's browser still receives live inventory numbers. Combined with the prop leak, investment terms are exposed.
- **Recommendation:** Only call the inventory API when `user` is truthy.
- **`% remaining` vs `% subscribed`:** Line 153 still shows "% remaining". Plan/merged feedback W2 expects "% subscribed".
- **Status badge mapping:** `STATUS_INFO` lookup uses `currentStatus`, but statuses like `"become-an-owner"` must exist in `STATUS_INFO` or the badge falls back to plain text. Verify `campaign-status.ts` supports `"active"` vs `"become-an-owner"`.
- **InvestmentTermsModal still receives live-ish props:** `currentSharesTotal` and `currentSharesAvailable` are computed locally and passed down. This is fine once the parent stops leaking price/returns via server props, but the modal itself may still use server-propagated values; review `InvestmentTermsModal.tsx` next.

---

## 5. `PurchaseFlow.tsx`

### 5.1 Good

- Added live inventory fetch and uses `liveSharesAvailable` for the increment button and display.
- Auth/KYC gate is present (`useEffect` redirects unauthenticated → login, unverified → `/mystable/verify`).

### 5.2 Issues

- **Phase 1 C1 still broken:** Line 119 sends `shares: sharesToBuy` instead of `shares_to_buy: sharesToBuy`. Checkout will receive `shares_to_buy === undefined`.
- **Phase 1 C3 still broken:** "Skip to End ↓" buttons remain (lines 306-318, 407-420).
- **Phase 1 C4 partially addressed but still leaking:** Server `purchase/page.tsx` passes `pricePerShareNzd`, `totalLeasePercent`, `investorReturnPct`, `sharesTotal`, `sharesAvailable` to `PurchaseFlow`. These appear in the RSC payload.
- **Phase 1 W8 not addressed:** Horses without `hasPds`/`hasSa` still allow the agreement checkbox to be checked immediately and checkout to proceed.
- **Phase 1 W7 not addressed:** `price_per_share_cents` is still sent from the client (line 120), plus `horse_name` and `client_reference_id`.
- **Phase 1 W3 not addressed:** `kycStatus !== "verified"` redirects both `pending` and `none` to `/mystable/verify` with no pending-specific UI.
- **Phase 1 W5/W6 not addressed:** Dead scroll handlers and redundant `if (!user)` check remain.
- **Live inventory race:** `liveSharesAvailable` defaults to `props.sharesAvailable` and updates asynchronously. A user could open the page, see 5 shares, and by the time they click Continue the real count is 0. The checkout API will block this, but the UI should at least re-fetch before checkout or show a stale warning.
- **No check before checkout:** The client should re-read `/api/inventory/[slug]` immediately before calling `/api/checkout/create-session`, or rely on the API's optimistic check (plan Component 3). The API's optimistic check was not reviewed here but should be verified.
- **Polling/sharing state:** `RightColumnActionPanel` and `PurchaseFlow` each fetch inventory independently. Consider a shared SWR/React Query hook for consistency and caching.

---

## 6. `src/app/marketplace/[id]/purchase/page.tsx`

### 6.1 Issues

- **Missing `export const dynamic = "force-dynamic"`** — Phase 1 C2 is unfixed.
- **Still SSGs via `generateStaticParams`:** This is intentional for detail pages, but the *purchase* page must not be statically generated.
- **Passes sensitive props to client component:** As noted in C4, `pricePerShareNzd`, `totalLeasePercent`, `investorReturnPct`, `sharesTotal`, `sharesAvailable` are all passed to `PurchaseFlow`.
- **Recommendation:** Convert to a thin server component that passes only `horseSlug`, `horseName`, `horseImage`, `hasPds`, `hasSa`. Let `PurchaseFlow` fetch investment data client-side from `/api/inventory/[slug]` after auth is confirmed.

---

## 7. Cross-Cutting Concerns

### 7.1 Google Sheets as single source of truth

The implementation reads `hlts.json` for the initial `sharesAvailable` and only overlays Sheets data for `shares_sold`. The plan envisions Sheets as the runtime SSOT. Decide whether the build-time JSON remains authoritative for non-inventory fields; if so, document it.

### 7.2 Error handling

All reviewed `catch` blocks either log to `console.error` or swallow. There is no alerting, no Sentry integration, and no structured logger. The webhook (not reviewed) will need clear failure paths.

### 7.3 Type safety

`STATUS_INFO as any`, `err: any`, `hltsData as any[]`, `horsesData as any[]` appear throughout. The plan expects typed rows for Sheets operations.

### 7.4 Security

- Hard-coded spreadsheet ID.
- OAuth refresh token env vars rather than service account.
- `token.json` fallback reads from disk.
- Client receives price/investment data via props.

---

## 8. Recommendations (Priority Order)

1. **Fix Phase 1 criticals C1-C3 immediately** before any further Phase 2 work.
2. **Resolve C4:** stop passing investment props from server components; fetch them client-side only for authenticated users.
3. **Rewrite `src/lib/google-sheets.ts` to use service-account auth**, match the plan schema, and implement all required helpers (`readInventory`, `readInventoryBySlug`, `updateInventorySharesSold`, correctly-scoped `appendHolding`/`appendLead`/`appendCommunication`, `readHoldingsByEmail`, `readCommunicationsByEmail`).
4. **Move `SPREADSHEET_ID` to an env var.**
5. **Update `/api/inventory/[slug]`** to return the full plan shape (`price_per_share_nzd`, `shares_available`), add 60s cache headers, and fall back to static JSON on Sheets errors.
6. **Add retry/backoff and typed row interfaces** to the Sheets library.
7. **Gate live inventory fetches behind auth** in `RightColumnActionPanel` and `PurchaseFlow`.
8. **Address W2-W9 and W1** (KYC check in `InvestmentTermsModal`) before production.
9. **Add a shared data hook** (SWR/React Query) for inventory/holdings to avoid duplicate fetches and provide consistent caching.

---

## 9. Verdict

- **Phase 2 Google Sheets integration:** Structurally present but **schema-misaligned, auth-insecure, and lacks caching/fallbacks**.
- **Phase 1 criticals:** **3 of 4 still unfixed** (C1, C2, C3); C4 is partially addressed.
- **Production readiness:** ❌ Not ready. The checkout would break, the purchase page is statically exposed, and the legal scroll-to-acknowledge is defeated by skip buttons.

**Next action:** Return to the implementation agent to fix C1-C4 and rewrite the Google Sheets library against the locked schema before proceeding to webhook/inbox/document work.
