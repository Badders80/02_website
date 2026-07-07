# Phase 1 Refiner Feedback — Merged (Hermes + Kimi)

**For:** Gemini (implementation agent)
**From:** Hermes + Kimi refiner review
**Action required:** Fix items below before proceeding to Phase 2. Do NOT change code outside the listed scope.

---

## 🔴 CRITICAL — Must Fix Before Phase 2

### C1: Checkout field name mismatch (pre-existing bug)

**File:** `PurchaseFlow.tsx` line 100
**Issue:** Client sends `shares: sharesToBuy` but API route (`/api/checkout/create-session/route.ts` line 13) destructures `shares_to_buy`. Result: `shares_to_buy` is `undefined` in the API route. The checkout session is created with `quantity: undefined`.
**Fix:** Change `shares: sharesToBuy` → `shares_to_buy: sharesToBuy` in `PurchaseFlow.tsx` line 100.

### C2: Purchase page serves full HTML to unauthenticated users (SSG bypass)

**File:** `src/app/marketplace/[id]/purchase/page.tsx`
**Issue:** The purchase page is statically generated at build time. The auth/KYC gate is client-side only (`useEffect` in `PurchaseFlow.tsx`). A user with JavaScript disabled, a bot, or a crawler receives the full purchase form HTML including pricing and share counts.
**Fix:** Add `export const dynamic = "force-dynamic"` to `purchase/page.tsx` to prevent static pre-rendering. The client-side guard then renders only a loading spinner in the initial HTML — no purchase form data is served to unauthenticated requests. (Full server-side auth requires Firebase session cookies which aren't in the current architecture — `force-dynamic` is the pragmatic fix for now.)

### C3: "Skip to End" button defeats scroll-to-acknowledge (compliance risk)

**File:** `PurchaseFlow.tsx` lines 287-300 (PDS), 389-401 (SA)
**Issue:** The "Skip to End ↓" button instantly sets `pdsScrolled`/`saScrolled` to `true`, enabling the agreement checkbox without the user actually scrolling. This undermines the legal purpose of scroll-to-acknowledge under the FMC Act.
**Fix:** Remove the "Skip to End" buttons entirely. Users must scroll the document container to the bottom to enable the checkbox.

### C4: Investment data leaks to client bundle via React props

**File:** `src/app/marketplace/[id]/page.tsx` lines 362-373
**Issue:** The server component passes `pricePerShareNzd`, `totalLeasePercent`, `investorReturnPct`, `sharesAvailable`, `sharesTotal` as props to `RightColumnActionPanel`. Even though the guest view doesn't render these values, they are serialized into the Next.js client payload (RSC flight data). A guest can read all investment terms from the page source / React DevTools.
**Fix:** This is partially a Phase 2 item (live inventory fetch). For now: do NOT pass sensitive investment props from the server component. Pass only `horseSlug`, `status`, and `horseName`. The `RightColumnActionPanel` should fetch investment data client-side only when `user` is authenticated (via the `/api/inventory/[slug]` route that will be built in Phase 2). In the interim, the authenticated view can read from the existing static JSON via a client-side fetch to avoid prop leakage.

---

## 🟠 WARNING — Should Fix Before Production

### W1: `InvestmentTermsModal` "Acquire" button has no KYC check

**File:** `InvestmentTermsModal.tsx` line 32-34
**Issue:** "Acquire" navigates directly to `/marketplace/[slug]/purchase` without checking `kycStatus`. The purchase page catches it, but the modal should handle KYC routing per the plan (Component 1).
**Fix:** Import `useAuth()` in `InvestmentTermsModal`, check `kycStatus` in `handleAcquire`:
- `verified` → `/marketplace/[slug]/purchase`
- `none` → trigger Stripe Identity flow (call `/api/kyc/create-session`)
- `pending` → route to KYC processing screen (Component 6, not built yet — for now redirect to `/mystable/verify`)

### W2: `% remaining` should be `% subscribed`

**File:** `RightColumnActionPanel.tsx` line 124
**Issue:** Shows `"% remaining"` — PRD convention is `"% subscribed"`.
**Fix:** Change to `{Math.round(((Number(sharesTotal) - Number(sharesAvailable)) / Number(sharesTotal)) * 100)}% subscribed`

### W3: KYC `pending` state treated same as `none`

**File:** `PurchaseFlow.tsx` lines 49-57
**Issue:** `kycStatus !== "verified"` catches both `pending` and `none`, sending both to `/mystable/verify`. A user who just completed Stripe Identity but whose verification is still processing gets redirected away from purchase with no explanation.
**Fix:** Differentiate: `kycStatus === "pending"` should show a message like "Identity verification in progress. This typically takes under 2 minutes." with a retry/check-status button (or redirect to the KYC processing screen when Component 6 is built). For now, at least show a distinct message instead of silently redirecting.

### W4: Dead `sessionStorage` code

**File:** `RightColumnActionPanel.tsx` lines 39-41
**Issue:** `sessionStorage.setItem("auth_redirect_target", targetUrl)` — nothing reads this. The `?redirect=` URL param already handles context preservation.
**Fix:** Remove the `sessionStorage.setItem` line and the `if (typeof window !== "undefined")` wrapper.

### W5: Dead scroll handler functions

**File:** `PurchaseFlow.tsx` lines 67-79
**Issue:** `handlePdsScroll` and `handleSaScroll` are defined but never attached to the scrollable divs. The inline `onScroll` handlers (lines 315-319, 417-421) duplicate the logic.
**Fix:** Delete `handlePdsScroll` and `handleSaScroll`. The inline handlers are sufficient (or vice versa — pick one approach and consolidate).

### W6: Redundant auth check in `handleStripeCheckout`

**File:** `PurchaseFlow.tsx` lines 82-85
**Issue:** The `if (!user)` check inside `handleStripeCheckout` is unreachable — the guard on line 59 (`if (authLoading || !user || kycStatus !== "verified")`) already prevents the component from rendering when `!user`.
**Fix:** Remove lines 82-85.

### W7: Client sends `price_per_share_cents` to API

**File:** `PurchaseFlow.tsx` line 101
**Issue:** Client sends price data to the server. The API route already reads price from `hlts.json` server-side. Client-sent price is ignored but the pattern is insecure.
**Fix:** Remove `price_per_share_cents` from the request body. Also remove `horse_name` and `client_reference_id` (lines 99, 104-105) — the API route doesn't use them.

### W8: Missing documents allow checkout to proceed

**File:** `PurchaseFlow.tsx`
**Issue:** When `!hasPds` or `!hasSa`, the checkbox is immediately enabled (no scroll required). A user can agree to "I have read the Product Disclosure Statement" even when the PDS doesn't exist. For horses without PDFs (First Gear, I Stole A Manolo), this allows purchase without disclosure documents.
**Fix:** When `!hasPds` or `!hasSa`, disable the checkbox and show "Document being prepared — purchasing will be available once disclosures are published." Block checkout for horses without required documents.

### W9: `agreementSubStep` not reset on navigation

**File:** `PurchaseFlow.tsx`
**Issue:** If user advances to sub-step 2 (SA), goes back to Step 2, then returns to Step 3, they land on sub-step 2 directly, skipping PDS review.
**Fix:** Add `setAgreementSubStep(1)` when clicking the Back button from Step 3 to Step 2 (line 362 area).

---

## 🟡 SUGGESTION — Polish (Can Defer)

### S1: Signature field label

The "Legal Signature (KYC Auto-filled)" read-only input with `displayName` is not a real signature. Until the PDF pipeline ships, consider relabeling to "Acknowledged by" and adding an explicit checkbox: "I acknowledge that my verified legal name is [Name] and I am electronically agreeing to these terms."

### S2: Type safety — `STATUS_INFO as any`

**File:** `RightColumnActionPanel.tsx` line 107
**Fix:** Type the `status` prop as `CampaignStatus` instead of `string`, remove the `as any` cast.

### S3: Progress persistence on refresh

Consider persisting `step`, `sharesToBuy`, `agreementSubStep`, `pdsAgreed`, `saAgreed` in `sessionStorage` keyed by `horseSlug` so users can recover after a refresh.

### S4: `ProductJsonLd` price exposure — product decision needed

**File:** `src/app/marketplace/[id]/page.tsx` lines 119-133
The JSON-LD structured data includes share price, availability, and offer count. This is server-rendered and visible to anyone in page source. This is **fine for SEO** (Google Product schema needs pricing) but technically means investment data is accessible to guests via view-source. Product decision: is this acceptable? (Hermes recommendation: yes, keep it — SEO benefit outweighs the minimal exposure risk. Kimi recommendation: document the exception.)

### S5: KYC bypass env var

**File:** `auth-context.tsx` lines 35-65
`NEXT_PUBLIC_BYPASS_AUTH_KYC=true` is a public env var that grants admin/verified access in non-production. Document in deployment runbook. Add a build-time warning when enabled.

---

## Summary

| Severity | Count | Blocking Phase 2? |
|---|---|---|
| Critical | 4 | ✅ Yes — fix C1-C4 before starting Phase 2 |
| Warning | 9 | No, but fix W1-W9 before production |
| Suggestion | 5 | Polish, defer or address opportunistically |

**Phase 1 overall verdict:** The conditional rendering pattern is correct. The auth/KYC gate logic is sound but client-side only. The sequential e-sign flow works but has compliance issues. Four critical items must be fixed before moving to Phase 2.