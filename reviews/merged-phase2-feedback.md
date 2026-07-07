# Phase 2 Refiner Feedback — Merged (Hermes + Kimi)

**For:** Gemini (implementation agent)
**From:** Hermes + Kimi refiner review
**Action required:** Fix ALL critical items before proceeding to Phase 3. The Phase 1 criticals were not addressed and are now blocking.

---

## 🔴 CRITICAL — Must Fix Before Phase 3

### C1: Checkout field name mismatch (UNFIXED from Phase 1)

**File:** `PurchaseFlow.tsx` line 119
**Issue:** Client sends `shares: sharesToBuy` but API route expects `shares_to_buy`. Checkout is broken end-to-end.
**Fix:** Change `shares: sharesToBuy` → `shares_to_buy: sharesToBuy`

### C2: Purchase page serves full HTML to unauthenticated users (UNFIXED from Phase 1)

**File:** `src/app/marketplace/[id]/purchase/page.tsx`
**Issue:** Page is statically generated. Full purchase form HTML (prices, share counts) is served to unauthenticated users/bots/crawlers before the client-side guard runs.
**Fix:** Add `export const dynamic = "force-dynamic"` to `purchase/page.tsx`. Remove `generateStaticParams` from this route (keep it on the detail page only).

### C3: "Skip to End" buttons defeat scroll-to-acknowledge (UNFIXED from Phase 1)

**File:** `PurchaseFlow.tsx` lines 306-318 and 407-420
**Issue:** One-click bypass undermines the legal purpose of scroll-to-acknowledge under the FMC Act.
**Fix:** Remove both "Skip to End ↓" buttons entirely.

### C4: Investment data leaks via server props (UNFIXED from Phase 1, partially addressed)

**Files:** `src/app/marketplace/[id]/page.tsx` lines 362-373, `src/app/marketplace/[id]/purchase/page.tsx`
**Issue:** Server components still pass `pricePerShareNzd`, `totalLeasePercent`, `investorReturnPct`, `sharesTotal`, `sharesAvailable` as props. These values are in the RSC flight payload / page source, visible to guests via DevTools or view-source. The live inventory fetch was added (good) but the server props were not removed.
**Fix:** Server components should pass only non-sensitive props: `horseSlug`, `horseName`, `horseImage`, `status`, `hasPds`, `hasSa`. All investment data (price, lease terms, share counts) should be fetched client-side from `/api/inventory/[slug]` only when `user` is authenticated.

### C5: Google Sheets auth uses OAuth2 user token, not service account

**File:** `src/lib/google-sheets.ts` lines 7-36
**Issue:** Uses OAuth2 with user `refresh_token` (from `token.json` or `GOOGLE_REFRESH_TOKEN` env var). The plan specified a Google Service Account (`GOOGLE_SERVICE_ACCOUNT_KEY`). User tokens are brittle (revoked on password change), the `token.json` file won't exist on Vercel, and user-scoped permissions are too broad.
**Fix:** Replace `getGoogleAuthClient()` with service account auth:
```ts
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
```
Remove the `token.json` fallback. Add `GOOGLE_SERVICE_ACCOUNT_KEY` to the env vars list.

### C6: Sheets schema doesn't match the locked plan

**File:** `src/lib/google-sheets.ts`

All write functions use column names and structures that differ from the finalized schema in `MARKETPLACE_MYSTABLE_JOB_SPEC.md` §4. This will break Phase 3 (webhook) and Phase 4 (MyStable).

**Holdings tab — current vs plan:**
- Current writes: `user_email, hlt_id, shares_owned, purchase_date, kyc_status, stripe_session_id, horse_microchip` (7 cols)
- Plan requires: `purchase_id, timestamp, user_email, horse_slug, shares_owned, purchase_price_total_nzd, signed_pds_url, signed_sa_url, kyc_status, utm_source, utm_campaign` (11 cols)
- Missing: `purchase_id` (primary key = Stripe session ID), `timestamp` (ISO datetime), `purchase_price_total_nzd`, `signed_pds_url`, `signed_sa_url`, `utm_source`, `utm_campaign`
- Rename: `hlt_id` → `horse_slug`, `purchase_date` → `timestamp`, `stripe_session_id` → `purchase_id`
- Remove: `horse_microchip` (not in plan schema)

**Leads tab — current vs plan:**
- Current writes: `email, name, phone, notes, date` (5 cols)
- Plan requires: `timestamp, user_email, user_name, horse_slug, action_type, utm_source, utm_campaign, referrer_url, status` (9 cols)
- Completely different. Must rewrite.

**Communications tab — current vs plan:**
- Current writes: `user_email, subject, body, sent_date, direction` (5 cols)
- Plan requires: `timestamp, recipient_email, subject, snippet, body_html, category` (6 cols)
- Rename: `user_email` → `recipient_email`, `sent_date` → `timestamp`, `body` → `body_html`, `direction` → `category`
- Add: `snippet` (short text preview)
- Remove: `direction` (not in plan)

**Inventory tab — current vs plan:**
- Current reads from tab `hlts` with column `horse_slug`
- Plan specifies tab `Inventory` with column `slug`
- Document the deviation or align with the plan

**Fix:** Rewrite all write functions to match the locked schema. Update `ensureSheetExists` header arrays accordingly. Update the `appendHolding` function signature to accept all 11 fields. Update `fetchHoldings` and `fetchCommunications` to read with the correct column names.

### C7: Missing `updateInventorySharesSold` helper

**File:** `src/lib/google-sheets.ts`
**Issue:** The plan requires `updateInventorySharesSold(slug, newSharesSold)` for the Phase 3 webhook to increment `shares_sold` after a purchase. This function does not exist.
**Fix:** Implement it:
```ts
export async function updateInventorySharesSold(slug: string, newSharesSold: number) {
  // Find the row for this slug, update the shares_sold cell
}
```

---

## 🟠 WARNING — Should Fix Before Production

### W10: No caching on inventory reads

**File:** `src/lib/google-sheets.ts`
**Issue:** Every detail page / purchase page load hits the Sheets API directly. No 60s TTL cache as specified in the plan. Will hit rate limits with concurrent users.
**Fix:** Add in-memory cache with 60s TTL for `getLiveInventory`.

### W11: No retry/backoff on Sheets API failures

**File:** `src/lib/google-sheets.ts`
**Issue:** Plan specified retry with exponential backoff (3 attempts). No retry logic exists.
**Fix:** Add retry wrapper for transient failures.

### W12: No static JSON fallback

**File:** `src/lib/google-sheets.ts` / `src/app/api/inventory/[slug]/route.ts`
**Issue:** When Sheets API fails, `getLiveInventory` returns `null`, the API route returns 404. Plan specified fallback to static `hlts.json`.
**Fix:** On Sheets failure, fall back to static JSON data. Return the static values with a warning header.

### W13: Live inventory fetch runs for guests

**File:** `RightColumnActionPanel.tsx` lines 43-56, `PurchaseFlow.tsx` lines 61-75
**Issue:** The `useEffect` fetch runs regardless of auth state. Guests trigger Sheets API calls on every page load even though the data is never shown to them.
**Fix:** Only fetch when `user` is truthy:
```ts
useEffect(() => {
  if (!user) return;
  // ... fetch ...
}, [horseSlug, user]);
```

### W14: Status mapping broken — `listing_status: "active"` is not a valid CampaignStatus

**File:** `RightColumnActionPanel.tsx` lines 61-63
**Issue:** If `liveInventory.listing_status` is `"active"` (from the sheet), it's passed directly to `STATUS_INFO[currentStatus]`. The valid statuses are `"coming-soon"`, `"become-an-owner"`, `"fully-subscribed"`, `"term-completed"`. `"active"` will hit the fallback and show "ACTIVE" as a raw label.
**Fix:** Use `getCampaignStatus()` to map the sheet status:
```ts
import { getCampaignStatus } from "@/lib/campaign-status";
const currentStatus = liveInventory
  ? getCampaignStatus({
      listing_status: liveInventory.listing_status,
      shares_total: liveInventory.shares_total,
      shares_sold: liveInventory.shares_sold,
    })
  : status;
```

### W15: API response missing `shares_available` and `price_per_share_nzd`

**File:** `src/app/api/inventory/[slug]/route.ts`
**Issue:** Current response shape: `{ shares_sold, shares_total, listing_status }`. Plan requires: `{ shares_total, shares_sold, shares_available, listing_status, price_per_share_nzd }`.
**Fix:** Add `shares_available` (computed) and `price_per_share_nzd` (read from the sheet) to the response. Update `getLiveInventory` to also return `price_per_share_nzd`.

### W16: Spreadsheet ID hard-coded

**File:** `src/lib/google-sheets.ts` line 5
**Issue:** `SPREADSHEET_ID` is a hard-coded string. Should be an env var for per-environment configuration and rotation.
**Fix:** `const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || "1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg";`

### W17: Unfixed Phase 1 warnings

All Phase 1 warnings remain unfixed:
- W1: `% remaining` → `% subscribed` (line 153)
- W2: Dead `sessionStorage` code (lines 68-70)
- W3: KYC `pending` treated same as `none` (lines 54-55)
- W5: Dead scroll handler functions
- W6: Redundant auth check in `handleStripeCheckout` (lines 100-103)
- W7: Client sends `price_per_share_cents`, `horse_name`, `client_reference_id` (lines 120-123)
- W8: Missing documents allow checkout to proceed
- W9: `agreementSubStep` not reset on back navigation

---

## Summary

| Severity | Count | Blocking Phase 3? |
|---|---|---|
| Critical | 7 (4 unfixed Phase 1 + 3 new Phase 2) | ✅ Yes — fix ALL before starting Phase 3 |
| Warning | 8 (5 new + 8 unfixed Phase 1) | No, but fix before production |

**Phase 2 verdict:** The Google Sheets integration is structurally present and functionally works in development, but:
1. Auth method is wrong for production (OAuth2 user token vs service account)
2. Schema doesn't match the locked plan (will break Phase 3/4)
3. `updateInventorySharesSold` is missing (required by Phase 3 webhook)
4. No caching, no fallback, no retry
5. All 4 Phase 1 criticals remain unfixed

**Priority order before Phase 3:**
1. C1 — one-line fix, unblocks checkout
2. C6 + C7 — rewrite Sheets write functions to match schema + add `updateInventorySharesSold`
3. C5 — switch to service account auth
4. C2, C3, C4 — Phase 1 criticals
5. W14 — status mapping (will show broken badges otherwise)
6. W13 — gate fetches behind auth
7. W15 — complete the API response shape