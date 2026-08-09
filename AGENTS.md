# Website — Agent Rules

**Identity:** Evolution Website Build Agent — public frontend for Evolution Stables  
**Repo:** `02_website/` · prod: https://www.evolutionstables.nz · Vercel: `evolution-3-0`

---

## Agent boot (required — 2 files only)

**When the user asks “what’s next”, “status”, or “look at 02_website”:**

1. **First reads must be** (in order, before ListDir sprawl or GAME_PLAN):
   - [`relay/continue.md`](relay/continue.md)
   - [`../docs/next-session-notes.md`](../docs/next-session-notes.md)
2. Answer from those. Execute **Next action** if asked to proceed.
3. Only then open E2E runbook / BUILD_SUMMARY / code if the task needs it.

Shortcut file: [`00_START_HERE.md`](00_START_HERE.md) (same rule).

| Order | File | Role |
|-------|------|------|
| **1** | [`relay/continue.md`](relay/continue.md) | **Next action** — overwrite every session wrap |
| **2** | [`../docs/next-session-notes.md`](../docs/next-session-notes.md) | **Current truth** — status, numbers, kill-switch, trial |

| Optional | When |
|----------|------|
| [`docs/BUILD_SUMMARY.md`](docs/BUILD_SUMMARY.md) | Architecture / map / rules |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Session diary (history only — not “what’s next”) |
| [`relay/*-e2e-*.md`](relay/) | Runbooks **linked from continue** |

**Do not boot from:** `GAME_PLAN.md`, June SESSION_BRIEF/WIF docs, sandbox HTML, parent monorepo listing, or chat memory alone.

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
8. **Secrets layout (locked)** — Local: only **`.env.local`**. Prod: **Vercel env only**. Never write `.env.production*`, `.env.vercel-*`, `.env.review-*`, `vercel-env.json`, or `*key*.json` at the website root. Dumps go in **`.secrets/archive/`** (gitignored). Template: `.env.local.example` only. Pull: `vercel env pull .env.local --environment=development` (or production into a temp path under `.secrets/`, not the root). See `.secrets/README.md`.  
9. **Sheet tab casing** — `hlts`, `holdings`, `leads`, `communications` (lowercase).  
10. **gws** — sheet edits via `gws` CLI when credentials available.

---

## Current phase (2026-08-05)

**Phase: Soft-list Nellie + TML; legal docs generator; Sheet ops rebuild**  
Site live; money **closed** (`PURCHASES_ENABLED` off). Manolo payment path was **workflow-tested** then inventory reset to **0 units sold** (static). Founder test hold is not a live inventory truth.

| Component | Status |
|-----------|--------|
| Marketplace (Sheets + static fallback) | ✅ Built — confirm live spreadsheet access |
| Pricing model + `pricing.ts` | ✅ Live |
| 6-state lifecycle | ✅ Live |
| Hard-close / eligibility | ✅ Live |
| KYC + Checkout routes | ✅ Built; money kill-switched |
| Payment health | ✅ `/api/diagnostics/payment-health` |
| Manolo | `listed` · **0/20 sold** · docs stubs/placeholders |
| Nellie / TML | Soft-list path: `coming_soon*` when flipped (still `draft` until Phase 3) |
| PDS/SA generator | 🟡 Parallel workstream |
| PDF e-sign | ⏸️ Deferred |

GCP Cloud Functions / WIF = **retired**. Do not revive.

**Listing policy (replaces old Manolo-trial gate):**
- Soft-show (`coming_soon` / `coming_soon_details`) is OK while money is off.
- Hard list (`listed`) requires honest catalog + stock + rates; purchases still need kill-switch + eligibility.
- Public **money open** is gated on real PDS/SA (not placeholders), not on “hide every other horse until Manolo E2E.”

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

**Spreadsheet (ops rebuild 2026-08-05):** `1MJvs2zcPsZ6ek_M2LhRP4jecoyheA7Rrkq8EY-8E08I`  
https://docs.google.com/spreadsheets/d/1MJvs2zcPsZ6ek_M2LhRP4jecoyheA7Rrkq8EY-8E08I/edit  

Legacy ID (may still be on Vercel until switched): `1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg` — not visible to alex@ gws; do not assume it is current.  
Config: `scripts/sheets_config.json`. Runtime: `GOOGLE_SPREADSHEET_ID` env.

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

- Set `PURCHASES_ENABLED=true` without founder intent + E2E plan + legal docs intent  
- Reintroduce TLM spelling or Inventory tab default  
- Invent owner rates or lot prices  
- Soft-hide Nellie/TML solely because Manolo was used for payment path testing  
- Hard-list or enable money without deliberate status flip + kill-switch decision  
- Treat June WIF/GCP docs as current  
- Treat placeholder `pds.pdf` / `sa.pdf` as final legal docs  
- Scatter secrets: no extra `.env.*` pulls at repo root; no key JSON dumps next to `package.json`  
- Commit `.env.local`, `.secrets/`, or service-account JSON

