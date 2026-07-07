# Hermes Refiner Review — Phase 1: Security & Gatekeeping

**Reviewer:** Hermes Agent
**Date:** July 2026
**Scope:** Phase 1 audit of Gemini's implementation
**Method:** Read-only code review, no modifications

---

## CRITICAL

### C1: Field name mismatch — checkout sends `shares` instead of `shares_to_buy`

**File:** `src/components/marketplace/PurchaseFlow.tsx` line 100
**File:** `src/app/api/checkout/create-session/route.ts` line 13

The client sends:
```js
body: JSON.stringify({
  hlt_id: props.horseSlug,
  horse_name: props.horseName,
  shares: sharesToBuy,           // ← sends "shares"
  ...
})
```

The API route destructures:
```js
const { user_id: bodyUserId, hlt_id, shares_to_buy, bypass_kyc, user_email } = body;
// shares_to_buy = undefined (client sent "shares", not "shares_to_buy")
```

**Impact:** `shares_to_buy` is `undefined`. Stripe receives `quantity: undefined`. The checkout session either errors out or creates a session with wrong quantity. This is a **pre-existing bug** (not introduced by Phase 1), but it means the purchase flow has never been fully exercised end-to-end.

**Fix:** Change `shares: sharesToBuy` to `shares_to_buy: sharesToBuy` in `PurchaseFlow.tsx` line 100.

---

### C2: `InvestmentTermsModal` "Acquire" button has no KYC check

**File:** `src/components/marketplace/InvestmentTermsModal.tsx` line 32-34

The "Acquire" button directly navigates to `/marketplace/[slug]/purchase` without checking `kycStatus`. The purchase page has a KYC gate (Phase 1), so this is defense-in-depth, not a true bypass. But per the implementation plan (Component 1), the Acquire button should check KYC and route accordingly:
- `verified` → `/marketplace/[slug]/purchase`
- `pending` → `/marketplace/[slug]/kyc-processing`
- `none` → trigger Stripe Identity KYC flow

**Current state:** The modal doesn't import `useAuth` at all. It has no access to auth state.

**Recommendation:** Either:
- (A) Pass `kycStatus` as a prop to `InvestmentTermsModal` from `RightColumnActionPanel` (which already has `useAuth`), OR
- (B) Add `useAuth()` directly in the modal and handle KYC routing in `handleAcquire`

Note: The KYC processing screen (Component 6) doesn't exist yet, so `pending` routing can't be fully implemented. But the `none` → KYC flow can be wired now.

---

## WARNING

### W1: `% remaining` vs `% subscribed` inconsistency

**File:** `src/components/marketplace/RightColumnActionPanel.tsx` line 124

```jsx
{Math.round((Number(sharesAvailable) / Number(sharesTotal)) * 100)}% remaining
```

The PRD says marketplace displays **"% subscribed"** not "% remaining". The original detail page (before Phase 1) showed:
```jsx
{Math.round((hltRecord.shares_sold / hltRecord.shares_total) * 100)}% subscribed
```

**Fix:** Change to `Math.round((Number(sharesTotal) - Number(sharesAvailable)) / Number(sharesTotal) * 100)}% subscribed`

---

### W2: Redundant `sessionStorage` in `RightColumnActionPanel`

**File:** `src/components/marketplace/RightColumnActionPanel.tsx` lines 39-41

```js
sessionStorage.setItem("auth_redirect_target", targetUrl);
```

Nothing in the codebase reads `auth_redirect_target` from sessionStorage. The `?redirect=` URL param already handles context preservation (the login page reads `searchParams.get("redirect")`). This is dead code.

**Fix:** Remove the `sessionStorage.setItem` call.

---

### W3: `ProductJsonLd` exposes price and share data in server-rendered HTML

**File:** `src/app/marketplace/[id]/page.tsx` lines 119-133

The JSON-LD structured data includes `price`, `availability`, and `offerCount` (shares available). This is server-rendered and visible in page source to everyone, including guests. 

**Assessment:** This is **acceptable and intentional for SEO** — Google Product schema requires pricing data. The conditional rendering decision applies to visible UI, not structured data for search engines. But worth noting that a determined guest could read the price from the JSON-LD in page source.

**Recommendation:** No change needed. But if this is a concern, the JSON-LD could be made conditional on auth state (would require converting to client component, which hurts SEO). Not recommended for v1.

---

### W4: `signatureName` fallback chain doesn't use KYC-verified name

**File:** `src/components/marketplace/PurchaseFlow.tsx` line 43

```js
const signatureName = user?.displayName || user?.email?.split("@")[0] || "Verified Investor";
```

Firebase `displayName` is set at signup (user-chosen), not from Stripe Identity verification. The actual KYC-verified legal name is only available by querying Stripe Identity API. For Phase 1 (no PDF pipeline), this is acceptable — the signature field is a visual representation, not a legal stamp. When the PDF pipeline ships (post-Stage 1), the webhook will need to query Stripe Identity for the verified name and use that in the PDF audit page.

**Recommendation:** No change for Phase 1. Add a TODO comment for post-Stage 1.

---

## SUGGESTION

### S1: `PurchaseFlow.tsx` sends `price_per_share_cents` from client

**File:** `src/components/marketplace/PurchaseFlow.tsx` line 101

```js
price_per_share_cents: Math.round(props.pricePerShareNzd * 100),
```

The client sends the price to the API route. The API route already reads the price from `hlts.json` (line 58: `hlt.price_per_share_nzd`), so the client-sent value is ignored. But this is a bad pattern — the client should never send pricing data. The server should be the sole source of truth for prices.

**Recommendation:** Remove `price_per_share_cents` from the client request body. The API route already sources it server-side.

### S2: `PurchaseFlow.tsx` sends `horse_name` and `client_reference_id` that the API route ignores

**File:** `src/components/marketplace/PurchaseFlow.tsx` lines 99, 104-105

The client sends `horse_name` and `client_reference_id` in the request body, but the API route doesn't destructure or use either. These are dead fields in the payload.

**Recommendation:** Remove unused fields from the client request, or wire them in the API route if needed.

### S3: `handleStripeCheckout` still has the old auth check

**File:** `src/components/marketplace/PurchaseFlow.tsx` lines 82-85

```js
if (!user) {
  router.push(`/auth/login?redirect=/marketplace/${props.horseSlug}/purchase`);
  return;
}
```

This check is now redundant — the `useEffect` on lines 49-57 already handles the redirect for unauthenticated users. And the guard on line 59 (`if (authLoading || !user || kycStatus !== "verified")`) prevents `handleStripeCheckout` from being reachable when `!user`. This is dead code.

**Recommendation:** Remove the redundant auth check inside `handleStripeCheckout`.

### S4: Consider `agreementSubStep` reset on step navigation

**File:** `src/components/marketplace/PurchaseFlow.tsx`

If a user goes back from Step 3 to Step 2, then forward to Step 3 again, `agreementSubStep` retains its previous value. If they had advanced to sub-step 2 (SA) and go back to step 2, then return to step 3, they'll land on sub-step 2 directly. This might be confusing. Consider resetting `agreementSubStep` to 1 when leaving step 3.

**Recommendation:** Add `setAgreementSubStep(1)` when navigating back from step 3 to step 2.

---

## Summary

| Severity | Count | Items |
|---|---|---|
| Critical | 2 | C1 (field mismatch — checkout broken), C2 (no KYC check on Acquire) |
| Warning | 4 | W1 (% label), W2 (dead sessionStorage), W3 (JSON-LD note), W4 (signature name source) |
| Suggestion | 4 | S1 (client sends price), S2 (dead payload fields), S3 (redundant auth check), S4 (substep reset) |

**Phase 1 verdict:** Functionally correct for the stated scope. C1 is a pre-existing bug that must be fixed before the purchase flow can work end-to-end. C2 should be addressed before Phase 3 (webhook) since the Acquire button is the entry point to the entire purchase pipeline. All other items are polish.