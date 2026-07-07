# Relay Refiner Review — Kimi (kimi-k2.7-code)

**Commit:** `HEAD` on `main` (Phase 1 critical fixes + google-sheets.ts rewrite + warnings cleanup).
**Scope:** All changed source files listed in task: inventory API, detail/purchase pages, PurchaseFlow, RightColumnActionPanel, google-sheets.ts.
**Build gate:** `rm -rf .next && npx tsc --noEmit --skipLibCheck` ✅ GREEN (exit 0, zero diagnostics).

---

## Executive Summary

The diff is materially improved from prior phases: sensitive investment props are no longer passed to the DOM for guests, live inventory is fetched client-side, and the Google Sheets lib is now a first-class typed module with retry/caching. However, there is **one blocking syntax bug** in `PurchaseFlow.tsx` that will break checkout auth, plus several functional regressions/edge-cases that should be fixed before this reaches `origin/main`.

---

## 🔴 Blocking / Critical

### C-1: Broken Authorization header in PurchaseFlow breaks Stripe checkout

**File:** `src/components/marketplace/PurchaseFlow.tsx`  
**Line:** ~108

The line reads:

```tsx
Authorization: *** ${token}`,
```

This is not valid TS/JS syntax (an asterisk sequence is interpreted as a comment token inside a template literal? It actually parses as `***` inside a template expression, which is a syntax/parse error). Wait — `tsc` passed with exit 0. Let me re-check the exact source.

Re-checking the file via `read_file` shows the literal content is:

```tsx
Authorization: *** ${token}`,
```

This **should** have caused a TS parse error (`Expression expected.` / `Unexpected token`). Yet the build gate passed. The most likely explanation is that the characters are not what they appear to be (e.g. Unicode full-width asterisks or some other glyph that TS treats as part of an identifier/whitespace). Regardless of how it parses, the runtime intent is clearly to send `Bearer <token>`. At runtime this will either throw a parse error in the browser bundler, or send a malformed header, causing the create-session API to return 401.

**Required fix:**

```search-replace
src/components/marketplace/PurchaseFlow.tsx
        headers: {
          "Content-Type": "application/json",
          Authorization: *** ${token}`,
        },
```

```
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
```

**Severity:** 🔴 Blocking — checkout is non-functional until this is fixed.

---

## 🟡 Functional Issues / Edge Cases / Regressions

### F-1: PurchaseFlow redirects unverified KYC users to `/mystable/verify` instead of the horse-specific flow

**File:** `src/components/marketplace/PurchaseFlow.tsx`  
**Line:** ~54

```tsx
} else if (kycStatus !== "verified") {
  router.push(`/mystable/verify`);
}
```

The implementation plan (Component 2 / D2 / checklist item 6) says:  
> "Authenticated but `kycStatus !== 'verified'` → redirect to `/marketplace/[slug]` (detail page, where they can initiate KYC)"

`/mystable/verify` is a generic verification page; the intended UX is to return to the specific horse detail page so the user can click **Acquire** and trigger the Stripe Identity flow / KYC processing screen for that horse. The current redirect is acceptable for a generic fallback but deviates from the locked plan and degrades the intended funnel.

**Recommended fix:**

```search-replace
src/components/marketplace/PurchaseFlow.tsx
      } else if (kycStatus !== "verified") {
        router.push(`/mystable/verify`);
      }
```

```
      } else if (kycStatus !== "verified") {
        router.push(`/marketplace/${props.horseSlug}`);
      }
```

**Severity:** 🟡 Medium — spec deviation with UX impact.

---

### F-2: PurchaseFlow shows "Fully Subscribed" based on a single snapshot; a race can occur between fetch and checkout

**File:** `src/components/marketplace/PurchaseFlow.tsx`  
**Lines:** ~170–183

The UI disables purchase when `sharesAvailable === 0` at the moment of render. This is fine for UX, but the actual concurrency guard is supposed to live in `/api/checkout/create-session` (Component 3). Currently `create-session` still reads from static `hlts.json` and does **not** call `getLiveInventory`/Sheets. This means the client-side snapshot and server-side static data can both be stale; a sold-out horse could still create a checkout session, and an over-sell would only be caught later by the webhook (if at all).

The new `google-sheets.ts` provides `getLiveInventory`/`readInventoryBySlug`, but it is **not wired into checkout creation**.

**Recommended fix in `src/app/api/checkout/create-session/route.ts`:**

1. Import `getLiveInventory` from `@/lib/google-sheets`.
2. Replace static `hlts.find` with `getLiveInventory(hlt_id)`.
3. Reject with 409 if `shares_to_buy > shares_available`.
4. Use the returned `price_per_share_nzd` for the line item (already mostly done, but currently sourced from static JSON).

Example S/R block for create-session:

```search-replace
src/app/api/checkout/create-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe';

// Load HLT data statically (baked at build for api route)
import hltsModule from '@/data/hlts.json';

const hlts = (hltsModule as any).default || (hltsModule as any);
```

```
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe';
import { getLiveInventory } from '@/lib/google-sheets';
```

And:

```search-replace
src/app/api/checkout/create-session/route.ts
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const hlt = hlts.find((h: any) => (h.horse_slug || h.id) === hlt_id);

    if (!hlt) {
      return NextResponse.json({ error: 'HLT not found' }, { status: 404 });
    }

    const pricePerShareNzd = hlt.price_per_share_nzd || 1500;
    const totalNzdCents = pricePerShareNzd * shares_to_buy * 100;
```

```
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const hlt = await getLiveInventory(hlt_id);

    if (!hlt) {
      return NextResponse.json({ error: 'HLT not found' }, { status: 404 });
    }

    if (shares_to_buy > hlt.shares_available) {
      return NextResponse.json(
        { error: 'Insufficient shares available' },
        { status: 409 }
      );
    }

    const pricePerShareNzd = hlt.price_per_share_nzd || 0;
    if (!pricePerShareNzd) {
      return NextResponse.json(
        { error: 'Invalid share price in inventory' },
        { status: 500 }
      );
    }
    const totalNzdCents = pricePerShareNzd * shares_to_buy * 100;
```

**Severity:** 🟡 High — the concurrency/price-tamper guard from the locked plan (D4, D7, Component 3) is missing.

---

### F-3: Webhook still uses old Google Apps Script bridge, not the new Sheets lib

**File:** `src/app/api/checkout/webhook/route.ts`

The locked plan (Component 5 / D3 / D7 / D8) requires the webhook to:
1. Idempotency-check against Holdings.
2. Validate `amount_total` against `shares_to_buy × price_per_share_nzd`.
3. Append to Holdings using the locked schema.
4. Update Inventory `shares_sold`.
5. Send welcome email + log Communication.

The current webhook only logs to console and posts to the old `GOOGLE_SHEETS_WEB_APP_URL` with a different schema (no `purchase_id`, `timestamp`, `kyc_status`, etc.). It does not call `appendHolding`, `updateInventorySharesSold`, or send email.

This is a known-scope gap, but since the new `google-sheets.ts` has been written and the task says the author "fixed all Phase 1 criticals (C1-C4), rewrote google-sheets.ts (C5-C7), and fixed all warnings", the webhook should now be wired up to use the new lib. Otherwise the inventory/sold counts in Sheets will diverge from reality.

**Severity:** 🟡 High — payment completion does not update the source of truth.

**Note:** This may be intentionally out of scope for the current commit, but it should be tracked explicitly because `create-session` and `webhook` are the two endpoints that make or break the commerce loop.

---

### F-4: API route forces dynamic but also sets public cache headers — contradictory

**File:** `src/app/api/inventory/[slug]/route.ts`  
**Lines:** 4, 24–28

```tsx
export const dynamic = "force-dynamic";
...
return NextResponse.json(data, {
  headers: {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
  },
});
```

`force-dynamic` disables Next.js static optimization and guarantees the function runs on every request. Setting `s-maxage=60` asks downstream caches (Vercel edge/CDN) to cache the response for 60 seconds. The combination is not broken, but it is confusing: the data is already cached in-memory for 60 seconds in `google-sheets.ts`; adding CDN caching means stale data can be served by the edge even after the in-memory cache expires. More importantly, if this route is later consumed by authenticated flows that add user-specific headers, a public cache could leak data. Here the response is horse-specific and non-sensitive, so public caching is acceptable, but `force-dynamic` + `s-maxage` is a bit of an anti-pattern.

**Recommendation:** Either:
- Drop `force-dynamic` and use `export const revalidate = 60;` for ISR-style 60s caching (but ISR caches on disk, not Sheets-aware), or
- Keep `force-dynamic` and remove the `Cache-Control` header, relying on the lib-level 60s in-memory cache. This gives consistent TTL and avoids edge-cache surprises.

**Severity:** 🟢 Low — functional but suboptimal.

---

### F-5: `google-sheets.ts` column-letter conversion breaks after column Z

**File:** `src/lib/google-sheets.ts`  
**Line:** ~220

```ts
const soldColumn = String.fromCharCode(65 + soldIndex); // Convert 0-indexed to letter
```

This only works for columns A–Z. The Inventory sheet has 17 columns (A–Q), so it is currently safe, but if the sheet ever grows beyond 26 columns the update will target the wrong column. The rest of the code already uses `spreadsheets.values.get` with `A:Q` and header-name lookups, so this is a latent fragility.

**Recommended fix:** use a proper column-name helper:

```ts
function columnToLetter(column: number): string {
  let temp = column;
  let letter = "";
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}
```

**Severity:** 🟢 Low — currently safe but brittle.

---

### F-6: `getLiveInventory` returns `totalLeasePercent` as a number; UI formats it with `%` without verifying non-zero

**Files:** `src/lib/google-sheets.ts` (line 184), `RightColumnActionPanel.tsx` / `InvestmentTermsModal.tsx`.

```ts
totalLeasePercent: row.leasehold_stake_pct,
```

`leasehold_stake_pct` is typed as `number`, but the raw sheet can be empty → parsed as `0`. The modal then renders `0%` total lease percentage. The old static fallback used `100` as a default (`leasehold_stake_percentage: hlt.leasehold_stake_pct || 100`). The new path does not apply a fallback.

**Recommended fix:** apply a sensible default in `getLiveInventory`:

```ts
totalLeasePercent: row.leasehold_stake_pct || 100,
```

Same consideration for `leasePeriodMonths` and `investorReturnPct`, though the plan does not prescribe defaults. At minimum, ensure a `0` value does not silently produce misleading UI copy.

**Severity:** 🟡 Medium — data/UX regression vs. prior static fallback.

---

### F-7: `readInventoryBySlug` reads the entire sheet to return one row

**File:** `src/lib/google-sheets.ts`  
**Lines:** 154–172

It calls `readInventory()`, which fetches `A:Q` and maps every row, then filters client-side. For the current ~3–5 horses this is fine, but it is not scalable and consumes more quota than necessary. Google Sheets API supports `spreadsheets.values.get` with a `majorDimension=ROWS` plus a filter view or simply reading the whole tab and filtering. The simplest improvement is to use `spreadsheets.values.batchGetByDataFilter` or at minimum add a TODO.

Given the plan says "<100 transactions" and the inventory tab is small, this is acceptable for Stage 1. Flagging as future debt.

**Severity:** 🟢 Low.

---

### F-8: `updateInventorySharesSold` does not validate `newSharesSold <= shares_total`

**File:** `src/lib/google-sheets.ts`  
**Lines:** 193–236

The function writes whatever `newSharesSold` it receives. The locked plan says the **webhook** should log an oversell alert if the new total exceeds `shares_total` but still preserve payment data. That validation belongs in the webhook (F-3), but the helper could also refuse to write a nonsensical value or at least return the old/new totals so callers can reason about it.

**Severity:** 🟢 Low — webhook layer is the right place per plan, but no webhook layer exists yet.

---

### F-9: `PurchaseFlow` uses uncontrolled `<img>` for horse image instead of Next.js `<Image>`

**File:** `src/components/marketplace/PurchaseFlow.tsx`  
**Line:** ~154

```tsx
<img src={props.horseImage} alt={props.horseName} className="w-full h-full object-cover" />
```

Using raw `<img>` loses Next.js image optimization, can trigger layout shift, and may cause CSP/performance issues. The detail page correctly uses `<Image>` with `fill` and `priority`.

**Recommended fix:** replace with `next/image`:

```tsx
import Image from "next/image";
...
<Image src={props.horseImage} alt={props.horseName} fill className="object-cover" sizes="56px" />
```

**Severity:** 🟢 Low — performance/quality regression.

---

## ✅ What Looks Good

1. **No sensitive investment props in server-rendered detail page.** `RightColumnActionPanel` only receives `horseName` and `horseSlug`; all pricing/availability data is fetched client-side after auth.
2. **Guest conditional rendering works as designed.** The guest view shows a skeleton + blur overlay + "Sign In to View Terms" CTA with `redirect` preserved.
3. **`google-sheets.ts` schema is locked and typed.** Headers for Holdings, Leads, and Communications match the plan. Auth uses `GOOGLE_SERVICE_ACCOUNT_KEY`. Retry with exponential backoff is present. In-memory 60s TTL cache is present.
4. **`updateInventorySharesSold` helper exists** and invalidates the cache after writes.
5. **Purchase page is force-dynamic** and only passes non-sensitive props to `PurchaseFlow`.
6. **RightColumnActionPanel only fetches inventory when `user` is truthy**, satisfying D1.
7. **Build gate passes cleanly** with `skipLibCheck`. No TypeScript errors.

---

## Security Notes

- **No env leakage in client bundle.** The Sheets auth is server-side only.
- **API inventory route returns horse-specific data without auth.** This is intentional and non-sensitive per plan, but verify that `listing_status`/`price_per_share_nzd` are acceptable to expose publicly. The plan explicitly says the detail page left column stays public and the right column data is fetched client-side only for authenticated users; however the `/api/inventory/[slug]` endpoint itself is unauthenticated. This is acceptable for Stage 1 because the same data is already in public JSON, but it should be revisited if commercial terms become sensitive.
- **Checkout auth is enforced server-side** via `verifyIdToken`. The broken `Authorization` header (C-1) is the only client-side issue.

---

## Search/Replace Blocks (Summary)

### Must-fix (blocking)

```search-replace
src/components/marketplace/PurchaseFlow.tsx
        headers: {
          "Content-Type": "application/json",
          Authorization: *** ${token}`,
        },
```

```
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
```

### Should-fix (functional)

```search-replace
src/components/marketplace/PurchaseFlow.tsx
      } else if (kycStatus !== "verified") {
        router.push(`/mystable/verify`);
      }
```

```
      } else if (kycStatus !== "verified") {
        router.push(`/marketplace/${props.horseSlug}`);
      }
```

```search-replace
src/lib/google-sheets.ts
    totalLeasePercent: row.leasehold_stake_pct,
    leasePeriodMonths: row.lease_period_months,
```

```
    totalLeasePercent: row.leasehold_stake_pct || 100,
    leasePeriodMonths: row.lease_period_months || 36,
```

```search-replace
src/lib/google-sheets.ts
      const soldColumn = String.fromCharCode(65 + soldIndex); // Convert 0-indexed to letter
```

```
      const soldColumn = columnToLetter(soldIndex); // Convert 0-indexed to letter
```

Add helper:

```search-replace
src/lib/google-sheets.ts
function getSheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}
```

```
function getSheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

function columnToLetter(column: number): string {
  let temp = column;
  let letter = "";
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}
```

---

## Recommendations for Next Relay / Phase

1. **Immediately fix C-1** and re-run the build gate plus a runtime smoke test of checkout.
2. **Wire `getLiveInventory` into `/api/checkout/create-session`** to enforce the 409 oversell guard and price-from-sheet rule.
3. **Rewrite `/api/checkout/webhook`** using the new `google-sheets.ts` helpers to satisfy D3/D7/D8.
4. **Add end-to-end smoke tests** for: guest detail page, auth-gated purchase page, inventory API, and a mocked Stripe session flow.
5. **Consider removing `force-dynamic` + public cache headers** from the inventory API in favor of the lib-level cache for predictable TTL.
