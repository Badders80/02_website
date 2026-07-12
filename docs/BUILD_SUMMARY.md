# Evolution Stables — Website Build Summary (Map)

**Last updated:** 2026-07-13  
**Repository:** `02_website/`  
**Prod:** https://www.evolutionstables.nz  
**Git remote:** `Badders80/02_website` · Vercel project `evolution-3-0`

> **This is the map** — what the system is and the rules.  
> **Boot agents from:** [`relay/continue.md`](../relay/continue.md) → [`../../docs/next-session-notes.md`](../../docs/next-session-notes.md)  
> **Diary:** [PROGRESS.md](PROGRESS.md)

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
| **List rate** | `owner_rate × (1 + fee_pct/100)` e.g. 70 → 73.50 |
| **Lot** | Min purchase size; e.g. 5% stake / 20 lots = **0.25%** of horse |
| **Purchase price (list lot)** | `list_rate × lot_pct × months` |
| **Investor return** | Per lease, % of **gross stakes** (row field) |

Code: `src/lib/pricing.ts` · test: `node scripts/test_pricing.mjs`

**Manolo (trial SKU):** rate 70 · fee 5 · 5%/20 · 16 mo · list lot **$294** · return 75%

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

Auth → KYC verified → create-session (eligibility) → Stripe Checkout → webhook → append `holdings` → `shares_sold++` → SMTP welcome email  

PDF signing: deferred (empty signed URL fields OK for trial).

---

## Current phase

**Manolo controlled payment trial** — catalog live; money kill-switched; E2E pending.  
See `relay/continue.md` and `docs/next-session-notes.md`.

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
