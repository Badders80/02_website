# Website — Agent Rules

**Identity:** Evolution Website Build Agent — public frontend for Evolution Stables  
**Repo:** `02_website/` · prod: https://www.evolutionstables.nz · Vercel: `evolution-3-0`

---

## Agent boot (required — 2 files only)

| Order | File | Role |
|-------|------|------|
| **1** | [`relay/continue.md`](relay/continue.md) | **Next action** — overwrite every session wrap |
| **2** | [`../docs/next-session-notes.md`](../docs/next-session-notes.md) | **Current truth** — status, numbers, kill-switch, trial |

Then execute **Next action**. Do not re-derive state from chat or stale June docs.

| Optional | When |
|----------|------|
| [`docs/BUILD_SUMMARY.md`](docs/BUILD_SUMMARY.md) | Architecture / map / rules |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Session diary table |
| [`relay/*-e2e-*.md`](relay/) | Runbooks linked from continue |

**Do not boot from:** old SESSION_BRIEF WIF docs, sandbox HTML, or chat memory alone.

### Session wrap (30s ritual)

1. Overwrite `relay/continue.md` — Last action / Next action / Do not  
2. Update top of `../docs/next-session-notes.md` — status + next steps  
3. Append one row to `docs/PROGRESS.md` if useful  
4. Update `docs/BUILD_SUMMARY.md` **only** if architecture/rules changed  
5. Optional daily log: `../docs/logs/YYYY-MM-DD.md`

---

## Core laws

1. **Live ops SSOT** — catalog stock/status/rates from Google Sheet tab **`hlts`**. Static `src/data/*.json` is fallback only.  
2. **Kill-switch** — `PURCHASES_ENABLED` must be exactly `"true"` to charge. Default off.  
3. **Pricing** — owner rate = `$/month per 1%`; list = owner × (1+fee%); purchase price = list × lot% × months. Code: `src/lib/pricing.ts`.  
4. **Lots** — clean fractions (e.g. 5%/20 = 0.25%). No fractional slop.  
5. **Lifecycle** — first-class `campaign_status` on sheet. Code: `src/lib/campaign-status.ts`.  
6. **TML not TLM** — Turn Me Loose → slug `tml-x-yearn`.  
7. **No commercial fiction** — no $1500 defaults, no 100-share fake inventory.  
8. **Minimal secrets in code** — Stripe/Firebase secrets in Vercel only.  
9. **Sheet tab casing** — `hlts`, `holdings`, `leads`, `communications` (lowercase).  
10. **gws** — sheet edits via `gws` CLI when credentials available.

---

## Current phase (2026-07-13)

**Phase: Manolo controlled payment trial**  
Site live; catalog honest; **I Stole A Manolo** `listed` @ $294 list lot; money **closed**.

| Component | Status |
|-----------|--------|
| Marketplace (live Sheets) | ✅ Live |
| Pricing model + `pricing.ts` | ✅ Live |
| 6-state lifecycle | ✅ Live |
| Hard-close / eligibility | ✅ Live |
| KYC + Checkout routes | ✅ Built; money kill-switched |
| Payment health | ✅ `/api/diagnostics/payment-health` |
| Manolo trial E2E | ⏳ Not run — next |
| PDF e-sign | ⏸️ Deferred |
| Nellie / TML | `draft` (hidden) |

GCP Cloud Functions / WIF = **retired**. Do not revive.

---

## Data flow (canonical)

```
Google Sheet (hlts)  ──runtime──►  marketplace / inventory API / checkout eligibility
        │
        └── static fallback ──►  src/data/hlts.json (if Sheets fails)

Firebase Auth  →  Stripe Identity (KYC)  →  Stripe Checkout  →  webhook
                                                              → holdings tab
                                                              → shares_sold++
                                                              → SMTP email
```

Spreadsheet: `1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg`

---

## Campaign statuses

| Status | On site | Buy* |
|--------|---------|------|
| `draft` | No | No |
| `coming_soon` | Yes | No |
| `coming_soon_details` | Yes | No |
| `listed` | Yes | Yes* |
| `fully_subscribed` | Yes | No |
| `completed` | Yes | No |

\* Also requires stock, valid price, **`PURCHASES_ENABLED=true`**.

---

## Key code

| Area | Path |
|------|------|
| Pricing | `src/lib/pricing.ts` |
| Lifecycle | `src/lib/campaign-status.ts` |
| Eligibility | `src/lib/purchase-eligibility.ts` |
| Sheets | `src/lib/google-sheets.ts` |
| Checkout | `src/app/api/checkout/create-session/route.ts` |
| Webhook | `src/app/api/checkout/webhook/route.ts` |
| Health | `src/app/api/diagnostics/payment-health/route.ts` |

---

## Do not

- Set `PURCHASES_ENABLED=true` without founder intent + E2E plan  
- Reintroduce TLM spelling or Inventory tab default  
- Invent owner rates or lot prices  
- Open Nellie/TML until Manolo trial done  
- Treat June WIF/GCP docs as current  
