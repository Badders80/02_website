# Evolution Stables — Website Build Summary (Map)

**Last updated:** 2026-07-13 (session 2)  
**Repository:** `02_website/`  
**Prod:** https://www.evolutionstables.nz  
**Git remote:** `Badders80/02_website` · Vercel project `evolution-3-0`

> **This is the map** — what the system is and the rules.  
> **Boot agents from:** [`00_START_HERE.md`](../00_START_HERE.md) → [`relay/continue.md`](../relay/continue.md) → [`../../docs/next-session-notes.md`](../../docs/next-session-notes.md)  
> **Diary:** [PROGRESS.md](PROGRESS.md) · daily log: monorepo `docs/logs/2026-07-13.md`

---

## What we're building

Public investor site for Evolution Stables: browse syndicates, auth, KYC, checkout, MyStable.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind · Firebase Auth · Stripe Identity + Checkout · Google Sheets (live ops) · Vercel

---

## Architecture (canonical 2026-07)

```
Browser
  → Vercel (Next.js)
      → Firebase Auth (identity)
      → Stripe Identity (KYC) + Checkout (payments)
      → Google Sheets tab `hlts` (live inventory SSOT)
      → Google Sheets tabs `holdings` / `leads` / `communications`
```

**GCP Cloud Functions / WIF:** retired. Do not depend on them.

### Live ops SSOT

| Source | Role |
|--------|------|
| Sheet tab **`hlts`** | Runtime stock, `campaign_status`, owner rate, fee, derived list lot price |
| `src/data/hlts.json` | Fallback if Sheets fails; keep roughly synced on deploy |
| `PURCHASES_ENABLED` | Kill-switch (exact `"true"` to charge) |

Spreadsheet ID: `1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg`  
Sheet tools: `gws` CLI (OAuth) or service account env on Vercel.

---

## Commercial pricing (locked)

| Term | Definition |
|------|------------|
| **Owner rate** | NZD **per month per 1%** of the horse (founder language: “$70”) |
| **Platform fee** | Variable, default **5%** on owner rate → **list rate** (investor-facing) |
| **List rate** | `owner_rate × (1 + fee_pct/100)` then **round UP to nearest dollar** e.g. 70 → 73.50 → **74** |
| **Lot / unit** | Min purchase size; e.g. 5% stake / 20 lots = **0.25%** of horse |
| **Purchase price (list lot)** | snapped list rate × lot_pct × months, then **round UP to nearest dollar** |
| **Investor return** | % of **gross stakes won**, pro-rata to units in Evolution syndicate stake |

Code: `src/lib/pricing.ts` · `roundUpListPriceNzd` · test: `node scripts/test_pricing.mjs`

**Manolo (live SKU):** rate 70 · fee 5 · 5%/20 · **12 mo** from **2026-08-01** · **$75** / mo / 1% · **$225** / unit · return 75%

---

## Campaign lifecycle (locked)

Sheet column `campaign_status` (first-class):

| Status | On website | Can buy* |
|--------|------------|----------|
| `draft` | No | No |
| `coming_soon` | Yes | No |
| `coming_soon_details` | Yes | No |
| `listed` | Yes | Yes* |
| `fully_subscribed` | Yes | No |
| `completed` | Yes | No |

\* + stock + valid price + kill-switch on.  
Code: `src/lib/campaign-status.ts`, `src/lib/purchase-eligibility.ts`

Legacy fields `listing_status` / `marketplace_visible` may still exist; **status SSOT is `campaign_status`**.

---

## Naming

- **TML** = Turn Me Loose → slug `tml-x-yearn` (not TLM)  
- Redirect: `/marketplace/tlm-x-yearn` → `/marketplace/tml-x-yearn`

---

## Key surfaces

| Surface | Notes |
|---------|--------|
| `/marketplace` | Live list; filters `isOnWebsite` (excludes draft) |
| `/marketplace/[slug]` | Detail + purchase UI |
| `/api/inventory/[slug]` | Live inventory + eligibility |
| `/api/checkout/*` | Create session + webhook |
| `/api/kyc/*` | Stripe Identity |
| `/api/diagnostics/payment-health` | Ops health (no secret values) |
| `/mystable` | Investor dashboard |

---

## Payment path

Auth → KYC verified → create-session (eligibility + list price snap) → Stripe Checkout → webhook **`/api/checkout/webhook`** → `fulfillCheckoutSession` → append `holdings` → `shares_sold++` → SMTP welcome + admin → communications log  

Ops backfill: **`POST /api/checkout/recover`** (Bearer `PAYMENT_RECOVER_SECRET`) retrieves paid session and runs same fulfill (idempotent by `purchase_id`).

Shared fulfill: `src/lib/checkout-fulfill.ts`

PDF signing: deferred (empty signed URL fields OK for Stage 1).

### Stripe LIVE webhooks (required)

| Endpoint | Events |
|----------|--------|
| `https://www.evolutionstables.nz/api/checkout/webhook` | `checkout.session.completed`, `checkout.session.expired` |
| `https://www.evolutionstables.nz/api/kyc/callback` | Identity verification sessions |

Secrets: `STRIPE_CHECKOUT_WEBHOOK_SECRET`, `STRIPE_KYC_WEBHOOK_SECRET` on Vercel Production.

---

## Investment terms (UX rules)

- Lead with **Price** ($/mo per 1% of horse) + **Minimum investment** (unit ticket for full term).  
- **Syndicate stake** = Evolution total % of the horse (e.g. 5%), mid/lower hierarchy.  
- **Units** not “shares”; min unit = stake/lots (e.g. 0.25% of horse).  
- Investor return display: **75% gross stakes won\*** with pro-rata quarterly NZTR footnote.  
- Glass greyscale baseline: `relay/2026-07-13-investment-terms-ui-baseline.md`  
- CTA: **Buy now**

---

## Current phase

**Money path proven** (founder holds 1 Manolo unit). Kill-switch OFF. Public open gated on legal docs + terms polish.  
See `relay/continue.md` and monorepo `docs/next-session-notes.md`.

---

## Session logging protocol

| File | Update |
|------|--------|
| `relay/continue.md` | Every wrap — next action only |
| `docs/next-session-notes.md` | Every wrap that changes state |
| This BUILD_SUMMARY | Only when map/rules change |
| PROGRESS.md | Session rows |
| `docs/logs/` | Optional detail |

---

## Explicitly obsolete (do not trust as current)

- WIF / GCP handshake as launch blocker (June 2026)  
- “Inventory” tab name as default (real tab: **hlts**)  
- $1500 / 100-share fiction  
- Static JSON as primary marketplace SSOT  
