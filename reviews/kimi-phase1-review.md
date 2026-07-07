# Phase 1 Marketplace Implementation — Refiner Review

> Reviewer: Kimi (subagent)  
> Scope: Guest conditional rendering, auth/KYC gates, sequential e-sign, back navigation  
> Files reviewed:
> - `src/components/marketplace/RightColumnActionPanel.tsx` (NEW)
> - `src/components/marketplace/PurchaseFlow.tsx` (MODIFIED)
> - `src/app/marketplace/[id]/page.tsx` (MODIFIED)
> - `src/app/marketplace/[id]/purchase/page.tsx` (server component wrapper)
> - `src/lib/auth-context.tsx` (existing)
> - `src/lib/campaign-status.ts` (existing)
> - Reference: `src/components/marketplace/InvestmentTermsModal.tsx`, `src/app/api/checkout/create-session/route.ts`, `src/app/api/kyc/status/route.ts`
> - Implementation plan: `MARKETPLACE_MYSTABLE_JOB_SPEC.md`

---

## Executive Summary

Phase 1 is functionally close to the spec, but has several gaps that weaken the security, UX and long-term maintainability of the work:

1. **Guest conditional rendering** is implemented in the DOM correctly, but the parent server component still injects all investment values as React props into the client component. This leaks the data to the client bundle even if it is not painted.
2. **Auth/KYC gate on the purchase page is client-side only.** An unauthenticated or unverified user who disables JavaScript, or a bot, can still receive the static HTML shell of the purchase form because the server wrapper pre-renders everything.
3. **The sequential e-sign flow is mostly good**, but the "Skip to End" button defeats the legal intent of scroll-to-acknowledge, the signature is only a read-only text field with no non-repudiation value, and the checkout API was not updated to use server-side inventory/price.
4. **SEO is preserved on the detail page**, but the implementation missed the plan's requirement to fetch live inventory via `/api/inventory/[slug]`.
5. **KYC pending state is not handled** from the detail page "Acquire" button or from the purchase page redirect logic; unverified users are sent to `/mystable/verify` with no return path.

No code was modified in this review.

---

## 1. Security

### 1.1 Guest conditional rendering — props leak data to the client bundle

**Severity:** Warning

**Location:** `src/app/marketplace/[id]/page.tsx` lines 362–373 (passing props), `RightColumnActionPanel.tsx` lines 8–32 (receiving props)

**Observation:**
- The detail page server component computes `pricePerShareNzd`, `totalLeasePercent`, `investorReturnPct`, `sharesAvailable`, etc. and passes them as props to `RightColumnActionPanel`.
- For a guest, `RightColumnActionPanel` returns early and does **not** render those values. They are not in the server-rendered HTML.
- However, the props are still serialized into the client-side React flight data / payload. A user can inspect the page source or the Next.js payload and read every investment term.

**Why it matters:**
The plan's Locked Decision D1 says "Investment data never enters the DOM for unauthenticated users." The intent is broader than the visible DOM — the data should not be shipped to unauthenticated clients at all. The current implementation satisfies the visible requirement but fails the spirit of the requirement.

**Recommended approach:**
- Make `RightColumnActionPanel` fetch its own data client-side only when `user` is truthy.
- The server component should pass only non-sensitive identifiers (`horseSlug`, `status` is acceptable as public).
- Move price/lease/return/share counts behind an authenticated API such as `/api/inventory/[slug]` (which was already planned in Component 1 of the spec but not built).

---

### 1.2 Purchase page gate is client-side only

**Severity:** Critical

**Location:** `PurchaseFlow.tsx` lines 49–57, `src/app/marketplace/[id]/purchase/page.tsx` (server wrapper)

**Observation:**
- `purchase/page.tsx` is a Server Component. It reads the HLT and documents, then renders `<PurchaseFlow ... />` with all investment data as props.
- `PurchaseFlow` is a Client Component. It uses `useAuth()` and `useEffect()` to redirect unauthenticated/unverified users.
- If JavaScript is disabled, or if a crawler/bot fetches `/marketplace/[id]/purchase`, the full purchase form HTML is returned (minus any client-side hiding).

**Why it matters:**
The spec says "Direct URL access to `/marketplace/[slug]/purchase` must redirect unauthenticated → login, unverified → KYC flow." A client-side effect is not sufficient for this because the page is statically generated at build time and served as HTML.

**Recommended approach:**
- Convert `purchase/page.tsx` to a route that does not statically generate the authenticated UI. Options:
  1. Make the server component check the Firebase session cookie (if the app uses cookie-based auth) and redirect server-side. This requires auth cookies, which are not currently in the codebase.
  2. Mark the route as dynamic/no SSG and render a minimal auth-loading shell from the server, letting the client guard handle the redirect. This still ships no purchase form HTML to unauthenticated users.
- At minimum, set `export const dynamic = "force-dynamic"` and avoid pre-rendering the purchase form.

---

### 1.3 Purchase page still trusts client-provided price

**Severity:** Critical

**Location:** `PurchaseFlow.tsx` lines 98–106 (passes `price_per_share_cents` from props), `src/app/api/checkout/create-session/route.ts` lines 58–59

**Observation:**
- `PurchaseFlow` computes `price_per_share_cents: Math.round(props.pricePerShareNzd * 100)` and sends it to the checkout API.
- The checkout API currently uses `hlt.price_per_share_nzd` from static JSON, not a live inventory source, and does not validate that the client price matches the server price.
- The spec's Component 3 and Locked Decision D7 require the server to read the price from the Inventory sheet and validate `amount_total` in the webhook.

**Why it matters:**
A malicious client could alter `price_per_share_cents` in the request body before Stripe redirection. Even though the current API ignores that field, the API shape still accepts it, and there is no amount validation in the webhook (per the spec's gap list). This is an open ticket, not a bug in Phase 1 alone, but the Phase 1 client code assumes a fixed server price without defending against tampering.

**Recommended approach:**
- The checkout API should compute `unit_amount` from the server-side inventory source and ignore any price sent by the client.
- Implement the webhook amount validation described in the spec before going live.

---

### 1.4 KYC bypass env var is accepted in non-production builds

**Severity:** Suggestion

**Location:** `auth-context.tsx` lines 35–65

**Observation:**
The auth context honors `NEXT_PUBLIC_BYPASS_AUTH_KYC=true` in any non-production `NODE_ENV`. This is useful for dev but is a public env var (exposed to the browser) and could accidentally be enabled in a staging preview. The mock user has `admin`/`verified` defaults.

**Recommendation:**
Document this clearly in the deployment runbook and add a build-time warning when the bypass is enabled. Do not rely on it in any environment that real user data can reach.

---

## 2. UX / Flow

### 2.1 Redirect logic has a race condition on the purchase page

**Severity:** Warning

**Location:** `PurchaseFlow.tsx` lines 49–65

**Observation:**
```tsx
useEffect(() => {
  if (!authLoading) {
    if (!user) { ... }
    else if (kycStatus !== "verified") { ... }
  }
}, [authLoading, user, kycStatus, router, props.horseSlug]);

if (authLoading || !user || kycStatus !== "verified") {
  return <spinner />;
}
```

**Issues:**
1. `authLoading` becoming `false` can happen **before** Firebase re-hydrates from local persistence, causing a flash of the spinner followed by redirect.
2. The spinner shows for the unverified case with no explanation. A user who has completed KYC but whose token has not refreshed yet will see a spinner and then be redirected away to `/mystable/verify`.
3. If `kycStatus` transitions to `"pending"` after a Stripe Identity session is created, this code treats `"pending"` the same as `"none"` and sends the user to `/mystable/verify`. There is no KYC processing screen and no return-to-purchase behavior.

**Recommended approach:**
- Add a short guard delay (e.g. wait for Firebase's initial `onAuthStateChanged` plus one extra tick) or use a `checked` flag.
- Show distinct loading/copy states for "checking auth" vs "waiting for identity verification".
- Send `kycStatus === "pending"` users to a dedicated KYC processing page (planned in Component 6) that polls `/api/kyc/status` and returns them to the purchase page on `verified`.

---

### 2.2 "Skip to End" button defeats scroll-to-acknowledge

**Severity:** Critical (legal/compliance)

**Location:** `PurchaseFlow.tsx` lines 287–300 (PDS), 389–401 (SA)

**Observation:**
The modal renders a "Skip to End ↓" button that immediately sets `pdsScrolled`/`saScrolled` to `true` and enables the checkbox. The same logic is repeated inline and also extracted to `handlePdsScroll`/`handleSaScroll`, which are unused.

**Why it matters:**
The entire purpose of "scroll-to-acknowledge" is to create a defensible record that the investor was given a reasonable opportunity to read the PDS and SA before agreeing. A one-click "Skip to End" button undermines that and may be problematic under the FMC Act.

**Recommended approach:**
- Remove the "Skip to End" buttons.
- Delete the unused `handlePdsScroll` and `handleSaScroll` functions at lines 67–79, or wire the scroll listeners to them consistently instead of duplicating logic inline.
- Consider persisting the acknowledgement timestamp and client scroll-depth evidence server-side for audit purposes.

---

### 2.3 Signature field is not a real signature

**Severity:** Warning (legal/compliance)

**Location:** `PurchaseFlow.tsx` lines 336–345 (PDS), 438–447 (SA)

**Observation:**
The "Legal Signature (KYC Auto-filled)" block is a `readOnly` text input containing `displayName` or email prefix. There is no actual signature capture, no click-to-sign acknowledgement, and the value is sent nowhere.

**Why it matters:**
The spec says "pre-populated signature from KYC name." The current UI shows the name but does not produce a signed record. The webhook records empty `signed_pds_url`/`signed_sa_url` in Stage 1, which is consistent with the deferred PDF pipeline, but the UX promises a signature that has no legal effect yet.

**Recommended approach:**
- Until the PDF pipeline is built, change the label to "Acknowledged by" and require an explicit checkbox that says "I acknowledge that my verified legal name is [Name] and I am electronically agreeing to these terms."
- Store the acknowledgement timestamp, IP, and user agent in the Holdings record.

---

### 2.4 No progress persistence on refresh or back button

**Severity:** Warning

**Location:** `PurchaseFlow.tsx` lines 30–38

**Observation:**
All step/sub-step state is in React state. If the user refreshes on Step 3.2 they return to Step 1. The amount and agreement checkboxes are lost.

**Recommended approach:**
- Persist `step`, `sharesToBuy`, `agreementSubStep`, `pdsAgreed`, `saAgreed` in `sessionStorage` keyed by `horseSlug` so the user can recover after refresh.
- Clear the storage on successful checkout or explicit cancellation.

---

### 2.5 "Back to Marketplace" link is good

**Severity:** Suggestion

**Location:** `src/app/marketplace/[id]/page.tsx` lines 234–248

**Observation:**
The breadcrumb now includes a "← Back to Marketplace" link on the right side. The link is visually distinct and uses the brand gold color.

**Minor note:**
Placing the back link on the opposite side of the breadcrumb is unusual; users may scan the breadcrumb linearly and miss it. Consider placing it immediately after the breadcrumb trail or using a more conventional position.

---

## 3. Code Quality

### 3.1 Dead / unused code in PurchaseFlow

**Severity:** Suggestion

**Location:** `PurchaseFlow.tsx` lines 40–42 and 67–79

**Observation:**
- `pdsRef` and `saRef` are used for the "Skip to End" buttons but their primary purpose (scroll detection) is duplicated inline.
- `handlePdsScroll` and `handleSaScroll` are defined but never attached to the scrollable divs; the inline `onScroll` handlers duplicate the logic.

**Recommendation:**
Consolidate on one approach: attach `handlePdsScroll`/`handleSaScroll` to the divs and remove the inline functions.

---

### 3.2 Type safety is loose

**Severity:** Suggestion

**Location:** `RightColumnActionPanel.tsx` line 107: `(STATUS_INFO as any)[status]`

**Observation:**
`STATUS_INFO` is already typed as `Record<CampaignStatus, StatusInfo>`. Casting it to `any` removes compile-time guarantees and is unnecessary because `status` is typed as `string` in the interface. A better fix is to narrow the prop type to `CampaignStatus` or validate `status` before indexing.

**Recommendation:**
```ts
const validStatus = status as CampaignStatus;
const statusInfo = STATUS_INFO[validStatus] ?? { ... };
```
or change the prop type to `CampaignStatus`.

---

### 3.3 Naming inconsistency

**Severity:** Suggestion

**Location:** `RightColumnActionPanel.tsx`

**Observation:**
The spec calls the new component `ActionPanel.tsx`; the implemented file is `RightColumnActionPanel.tsx`. This is fine, but there is also a likely older `ActionPanel` or similar component elsewhere. Confirm there is no dead predecessor left in the tree.

---

### 3.4 PurchaseFlow does not use the new API route planned in the spec

**Severity:** Warning

**Location:** `PurchaseFlow.tsx` overall

**Observation:**
The implementation plan (Component 1 and Component 2) says the detail and purchase pages should fetch live inventory from `/api/inventory/[slug]`. Phase 1 does not create this route and the purchase page receives static values from the server wrapper.

**Impact:**
- Shares available can be stale immediately after another purchase.
- Two users could see the same remaining shares and both enter checkout before the webhook catches up.

**Recommendation:**
Build `/api/inventory/[slug]` next and have the purchase flow poll or refresh it before creating the checkout session. The checkout API should also read live inventory as the authoritative guard.

---

### 3.5 Mixed auth token formats

**Severity:** Warning

**Location:** `PurchaseFlow.tsx` line 96: `Authorization: *** ${token}``

**Observation:**
The client sends `Authorization: *** ${token}`, but the checkout API expects `Bearer ${token}`. The `***` placeholder appears to be an artifact or redaction from the file read and should be verified in the actual source. If it is literally three asterisks, the checkout call will 401.

**Recommendation:**
Confirm the real source contains `Bearer ${token}` or `Token ${token}`. This is a likely bug.

---

## 4. SEO Impact

### 4.1 Detail page SEO is preserved

**Severity:** Good

**Location:** `src/app/marketplace/[id]/page.tsx` lines 43–78, 80–141

**Observation:**
- The left column (story, pedigree, trainer, image) is still server-rendered from static JSON.
- `generateMetadata`, `ProductJsonLd`, OpenGraph and Twitter cards are unchanged and still include the share price in structured data.
- The right column action panel hydrates client-side.

**Caveat:**
Including the share price inside `ProductJsonLd` (line 123) means the price **is** in the server-rendered HTML for bots. This is generally desirable for SEO/rich snippets, but it contradicts the intent of hiding investment terms from unauthenticated users. If the business requirement is that no investment data should reach unauthenticated users, the price should be removed from the JSON-LD or populated only for authenticated renders (which would break rich snippets for bots). This is a product decision, not a code defect.

**Recommendation:**
Decide whether bots are allowed to see price. If yes, document the exception. If no, remove `price`/`AggregateOffer` from `ProductJsonLd`.

---

## 5. Edge Cases

| Scenario | Current behavior | Risk | Severity |
|---|---|---|---|
| **Auth fails / Firebase init unavailable** | `loading` becomes `false` in `auth-context` when `!isAuthInitialized()`. Both panel and purchase page treat this as logged-out and redirect/show sign-in CTA. | OK for panel, but purchase page will redirect. Could be a loop if `/auth/login` also cannot init Firebase. | Warning |
| **KYC pending** | Treated as `kycStatus !== "verified"` and redirected to `/mystable/verify`. | User loses purchase context; no polling/return path. | Warning |
| **User refreshes purchase page mid-flow** | State resets to Step 1. | Frustration, possible duplicate agreement confusion. | Warning |
| **Back button from Stripe checkout** | `cancel_url` is `/marketplace/${slug}/purchase`, which reloads the flow at Step 1. | Cart/agreement state lost. | Suggestion |
| **Insufficient shares at checkout creation** | Not checked because no live inventory route was built. | Possible oversell. | Critical |
| **Document files missing (`!hasPds` / `!hasSa`)** | Checkbox is enabled immediately and checkout can proceed. | Allows purchase without valid disclosures if documents are missing at deploy time. | Warning |
| **Direct URL access by unverified user** | Client redirect only; HTML still delivered. | Bypassable. | Critical |
| **Mobile / small viewport embed** | PDF embed may not render well or may allow native scrolling that doesn't trigger the wrapper's `onScroll`. | Scroll detection could fail to enable the checkbox. | Warning |
| **KYC status returns `requires_input` / `failed`** | Not handled in purchase flow at all. | Stuck on `/mystable/verify`. | Warning |

---

## 6. Consistency

### 6.1 Tailwind patterns match

**Severity:** Good

The new components use the same low-opacity borders, rounded-2xl cards, uppercase tracking-widest labels, and brand gold (`#d4a964`) already established in the marketplace pages.

### 6.2 Status system is reused

**Severity:** Good

`RightColumnActionPanel` uses `STATUS_INFO` for badge/dot/label rendering and `getCampaignStatus` is used in the detail page.

### 6.3 Auth context usage is consistent

**Severity:** Good

Both new client components use `useAuth()` in the same way as the rest of the app.

### 6.4 InvestmentTermsModal bypasses KYC

**Severity:** Warning

**Location:** `InvestmentTermsModal.tsx` line 32

The spec's Component 1 says the "Acquire" button inside the InvestmentTermsModal should check `kycStatus`:
- `verified` → purchase page
- `pending` → `/marketplace/[slug]/kyc-processing`
- `none` → trigger Stripe Identity KYC

The current implementation unconditionally routes to `/marketplace/${horseSlug}/purchase`. The purchase page then redirects unverified users away, but the detail page modal should have handled this earlier with context-specific messaging.

---

## 7. Summary of Severity Counts

| Severity | Count |
|---|---|
| Critical | 4 |
| Warning | 13 |
| Suggestion | 6 |

---

## 8. Recommended Next Steps

1. **Before merge:**
   - Fix the `Authorization` header format in `PurchaseFlow.tsx` (verify it is `Bearer`, not `***`).
   - Remove or rename the "Skip to End" buttons; they are a compliance liability.
   - Change the purchase page server wrapper so the purchase form HTML is not statically served to unauthenticated users (`force-dynamic` or server-side auth check).
2. **Before production:**
   - Build `/api/inventory/[slug]` and use it for the detail panel (authenticated only) and purchase page.
   - Update the checkout API to read live price/shares from the inventory source and validate `amount_total` in the webhook.
   - Add a KYC processing page that polls `/api/kyc/status` and returns the user to the purchase page.
   - Replace the read-only signature name with a real electronic-signature acknowledgement that records timestamp/IP/user-agent.
3. **Product decision:**
   - Decide whether JSON-LD/Product schema should expose the share price to bots.

---

*Review completed. No code changes were made.*
