# Hermes Refiner Review — Phase 2: Database Layer (Google Sheets API)

**Reviewer:** Hermes Agent
**Date:** July 2026
**Scope:** Phase 2 audit + Phase 1 critical verification
**Method:** Read-only code review, no modifications

---

## Phase 1 Critical Verification

| # | Critical Item | Status | Notes |
|---|---|---|---|
| C1 | `shares` → `shares_to_buy` field name | ❌ **NOT FIXED** | `PurchaseFlow.tsx` line 119 still sends `shares: sharesToBuy`. API route expects `shares_to_buy`. Checkout is still broken. |
| C2 | `force-dynamic` on purchase page | ❌ **NOT FIXED** | `purchase/page.tsx` has `export const dynamicParams = true` but NOT `export const dynamic = "force-dynamic"`. Purchase form HTML still pre-rendered for unauthenticated users. |
| C3 | Remove "Skip to End" buttons | ❌ **NOT FIXED** | Both "Skip to End ↓" buttons still present at lines 316 and 418 of `PurchaseFlow.tsx`. |
| C4 | Stop passing sensitive props to client | ❌ **NOT FIXED** | `page.tsx` lines 362-373 still passes `pricePerShareNzd`, `sharesAvailable`, `sharesTotal`, etc. as props. Data still in RSC flight payload. |

**Verdict: None of the 4 Phase 1 criticals were addressed.** Gemini moved to Phase 2 without fixing them. These must be fixed before any of this work goes to production.

---

## Phase 2 Review

### CRITICAL

#### C5: Google Sheets auth uses OAuth2 user token, not service account

**File:** `src/lib/google-sheets.ts` lines 7-36

The implementation uses an OAuth2 client with a user `refresh_token` (from `token.json` or `GOOGLE_REFRESH_TOKEN` env var). The implementation plan specified a **Google Service Account** (`GOOGLE_SERVICE_ACCOUNT_KEY` env var) for server-to-server auth.

**Impact:**
- OAuth2 user tokens expire and need refresh — service account JWTs are self-managed.
- User tokens have the scope of the user who authorized them — service accounts have narrowly-scoped IAM permissions.
- On Vercel, storing a `refresh_token` is fragile — it can be revoked by the user changing their password or revoking access. Service account keys don't have this problem.
- The `token.json` file approach (`scripts/token.json`) will NOT work on Vercel — there's no filesystem persistence. The env var fallback (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`) works but is less secure than a service account.

**Fix:** Switch to service account auth:
```ts
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
});
```
Or parse JSON from env var:
```ts
const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const auth = new google.auth.JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: [...],
});
```

#### C6: Sheets schema doesn't match the plan

**File:** `src/lib/google-sheets.ts`

The implementation reads from a tab called `hlts` (line 45: `range: "hlts!A:Z"`) and writes to `holdings`, `leads`, `communications` tabs. But the column structures don't match the finalized schema in the job spec:

**Inventory (reads from `hlts` tab):**
- Plan says: `slug, name, listing_status, price_per_share_nzd, shares_total, shares_sold, leasehold_stake_pct, ...`
- Code reads: `horse_slug, shares_sold, shares_total, listing_status` (only 4 fields extracted)
- Missing: `price_per_share_nzd` is NOT read from the sheet (the detail page still passes it as a static prop from `hlts.json`). The whole point of live inventory was to get dynamic pricing too.

**Holdings (writes to `holdings` tab):**
- Plan says: `purchase_id, timestamp, user_email, horse_slug, shares_owned, purchase_price_total_nzd, signed_pds_url, signed_sa_url, kyc_status, utm_source, utm_campaign` (11 columns)
- Code writes: `user_email, hlt_id, shares_owned, purchase_date, kyc_status, stripe_session_id, horse_microchip` (7 columns)
- Missing: `purchase_id` (should be primary key = Stripe session ID), `timestamp` (ISO datetime, not just date), `purchase_price_total_nzd`, `signed_pds_url`, `signed_sa_url`, `utm_source`, `utm_campaign`
- Column names mismatch: `horse_slug` (plan) vs `hlt_id` (code), `timestamp` (plan) vs `purchase_date` (code)

**Leads (writes to `leads` tab):**
- Plan says: `timestamp, user_email, user_name, horse_slug, action_type, utm_source, utm_campaign, referrer_url, status` (9 columns)
- Code writes: `email, name, phone, notes, date` (5 columns)
- Completely different schema. Missing `horse_slug`, `action_type`, `utm_*`, `referrer_url`, `status`. Has `phone` which isn't in the plan.

**Communications (writes to `communications` tab):**
- Plan says: `timestamp, recipient_email, subject, snippet, body_html, category` (6 columns)
- Code writes: `user_email, subject, body, sent_date, direction` (5 columns)
- Column names mismatch: `recipient_email` vs `user_email`, `timestamp` vs `sent_date`, `body_html` vs `body`, `category` vs `direction`. Missing `snippet`.

**Impact:** When Phase 3 (webhook) and Phase 4 (MyStable) try to read/write these tabs, the schemas won't match. The webhook needs to write `purchase_id`, `purchase_price_total_nzd`, etc. MyStable needs to read `signed_pds_url`, `signed_sa_url`. None of these columns exist.

**Fix:** Align all write functions with the finalized schema from the job spec. Update the `ensureSheetExists` header arrays to match.

---

### WARNING

#### W10: No caching on inventory reads

**File:** `src/lib/google-sheets.ts` line 38-77

`getLiveInventory` makes a direct Google Sheets API call every time. The plan specified 60s TTL caching. Every page load of the detail page or purchase page hits the Sheets API. With multiple concurrent users, this will hit rate limits quickly.

**Fix:** Add a simple in-memory cache with TTL:
```ts
const cache: Record<string, { data: any; expiry: number }> = {};
const CACHE_TTL = 60_000; // 60 seconds

export async function getLiveInventory(horseSlug: string) {
  const cached = cache[horseSlug];
  if (cached && cached.expiry > Date.now()) return cached.data;
  // ... fetch from Sheets ...
  cache[horseSlug] = { data: result, expiry: Date.now() + CACHE_TTL };
  return result;
}
```

#### W11: `getLiveInventory` reads entire `hlts!A:Z` range

**File:** `src/lib/google-sheets.ts` line 45

The function reads the entire `hlts` tab (all rows, all columns) and then filters client-side for the matching `horse_slug`. For a small sheet this is fine, but it's wasteful. Google Sheets API has no server-side filtering, so this is expected for v1 — but worth noting.

#### W12: No retry/backoff on Sheets API failures

**File:** `src/lib/google-sheets.ts`

The plan specified "retry with exponential backoff (3 attempts) on transient failures." The current code catches errors and returns `null` (for reads) or throws (for writes). No retry logic.

**Fix:** Add retry wrapper for transient failures (rate limit, network timeout).

#### W13: `RightColumnActionPanel` still receives sensitive props from server

**File:** `src/app/marketplace/[id]/page.tsx` lines 362-373

Still passes `pricePerShareNzd`, `totalLeasePercent`, `investorReturnPct`, `sharesTotal`, `sharesAvailable` from the server component. The client component now fetches live inventory and overrides some of these, but the original values are still in the RSC payload. (Same as Phase 1 C4 — not fixed.)

#### W14: Live inventory fetch happens for guests too

**File:** `src/components/marketplace/RightColumnActionPanel.tsx` lines 43-56

The `useEffect` that fetches `/api/inventory/[slug]` runs regardless of auth state. A guest user triggers a Sheets API call on every detail page load, even though the data is never shown to them. This wastes API quota.

**Fix:** Only fetch when `user` is truthy:
```ts
useEffect(() => {
  if (!user) return;
  // ... fetch live inventory ...
}, [horseSlug, user]);
```

#### W15: `RightColumnActionPanel` uses `currentStatus` that may not be a valid `CampaignStatus`

**File:** `src/components/marketplace/RightColumnActionPanel.tsx` line 61-63

```ts
const currentStatus = liveInventory 
  ? (currentSharesAvailable === 0 ? "fully-subscribed" : liveInventory.listing_status) 
  : status;
```

If `liveInventory.listing_status` is `"active"` (from the sheet), that's not a valid `CampaignStatus` value. The status system expects: `"coming-soon"`, `"become-an-owner"`, `"fully-subscribed"`, `"term-completed"`. Passing `"active"` to `STATUS_INFO[currentStatus]` would hit the fallback (line 136-139) with a raw uppercase label.

**Fix:** Map the sheet's `listing_status` to a `CampaignStatus` using `getCampaignStatus()`:
```ts
import { getCampaignStatus } from "@/lib/campaign-status";
const currentStatus = liveInventory 
  ? getCampaignStatus({ 
      listing_status: liveInventory.listing_status, 
      shares_total: liveInventory.shares_total, 
      shares_sold: liveInventory.shares_sold 
    })
  : status;
```

#### W16: `% remaining` still not `% subscribed`

**File:** `src/components/marketplace/RightColumnActionPanel.tsx` line 153

Still shows `"% remaining"`. Phase 1 warning W1 not fixed.

#### W17: Dead `sessionStorage` code still present

**File:** `src/components/marketplace/RightColumnActionPanel.tsx` lines 68-70

Phase 1 warning W4 not fixed.

#### W18: Purchase page still sends `shares` not `shares_to_buy`

**File:** `src/components/marketplace/PurchaseFlow.tsx` line 119

Phase 1 critical C1 not fixed.

---

## Summary

| Severity | Count | Items |
|---|---|---|
| Critical | 6 | C1-C4 (Phase 1 unfixed), C5 (OAuth not service account), C6 (schema mismatch) |
| Warning | 9 | W10-W18 |

**Phase 2 verdict:** The Google Sheets client library works functionally but uses the wrong auth method (OAuth2 user token instead of service account) and has a schema that doesn't match the finalized plan. The live inventory API route is correctly structured. Frontend integration works but fetches for guests unnecessarily. All 4 Phase 1 criticals remain unfixed.

**Priority before Phase 3:**
1. Fix C1 (checkout field name) — one line, blocks the entire purchase flow
2. Fix C6 (schema alignment) — the webhook in Phase 3 needs to write the correct columns
3. Fix C5 (service account auth) — needed for Vercel deployment
4. Fix C2, C3, C4 (Phase 1 criticals) — needed before production
5. Fix W15 (status mapping) — will cause incorrect badge display