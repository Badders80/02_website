# 02_website — Live State

**Last updated:** 2026-06-30  
**Canonical for agents:** yes — this file + [`README.md`](README.md) are the only required reads for most sessions.

---

## Agent boot (2 files)

| When | Read |
|------|------|
| Any `02_website` task | This file → `README.md` |
| Deploy / ship to production | Add [`../SURFACES.md`](../SURFACES.md) §1 |

**Do not read for boot:** `GAME_PLAN.md`, `docs/PROGRESS.md`, `docs/BUILD_SUMMARY.md`, `workspace/memory/STATE.md`, `HANDSHAKE.md` (unless editing contracts), `AGENTS.md` (unless you need rule reminders).

---

## Architecture (canonical)

**Post-GCP.** GCP Cloud Functions / Firestore / GCS are retired (billing). The site runs on **Vercel** with:

```
Google Sheets (inventory, optional) → scripts/sync_inventory.py → src/data/*.json
Firebase Auth (client) → who you are
Stripe Identity + Checkout (Next.js API routes on Vercel) → KYC + payments
```

No runtime calls to `cloudfunctions.net` for marketplace, mystable, KYC, or checkout.

---

## What's live

| Component | Status | Notes |
|-----------|--------|-------|
| **Production** | ✅ | https://www.evolutionstables.nz — ship via `vercel --prod` ([SURFACES.md §1](../SURFACES.md)) |
| **Static pages** | ✅ | Home, press, privacy, terms |
| **Firebase Auth** | ✅ | Client SDK; `useAuth()` |
| **Marketplace** | ✅ | `src/app/marketplace/page.tsx` reads `src/data/hlts.json` |
| **MyStable** | ✅ | `src/app/mystable/page.tsx` reads `src/data/holdings.json` + `hlts.json` |
| **Stripe KYC** | ✅ | `api/kyc/create-session` → Stripe direct |
| **Stripe Checkout** | ✅ | `api/checkout/create-session` → Stripe direct |
| **Sheet writes (OAuth)** | ✅ | `src/lib/sheets-write.ts` — direct Sheets API v4 via OAuth |
| **Webhooks** | ✅ | `api/kyc/callback`, `api/checkout/webhook` — Stripe sig verify, per-endpoint secrets |
| **Local inventory JSON** | ✅ | `src/data/` seeded; `scripts/sync_inventory.py` built |
| **Assets** | ✅ | `_assets/` via symlinks |

---

## Remaining work

1. **Stripe secrets + webhooks on Vercel** — see `.hermes/plans/remaining-work-2026-07-02.md` §4
2. **Dormant-ify GCP leftovers** — `src/lib/api.ts`, `gcp-auth.ts`, `api/proxy/`, admin routes still import dead GCP paths
3. **SEO** — sitemap, JSON-LD, Open Graph (partial — check `src/app/sitemap.xml`)
4. **Sandbox/admin cleanup** — remove dead `api.ts` usage from `src/app/sandbox/`

---

## Handoffs (human)

### Google Sheet inventory replay

1. Create Google Sheet with 5 tabs: horses, hlts, trainers, owners, holdings
2. Import CSV templates from `scripts/sheet_templates/`
3. Share as "Anyone with link"
4. Paste sheet ID into `scripts/sheets_config.json` (replace `YOUR_SHEET_ID_HERE`)
5. Run `python3 scripts/sync_inventory.py` (no `--seed`) → `npm run build` → commit

### Vercel environment

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_FIREBASE_CONFIG` | Client | Likely set |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Likely set |
| `STRIPE_SECRET_KEY` | Server | Required for KYC/checkout |
| `STRIPE_KYC_WEBHOOK_SECRET` | Server | Stripe KYC webhook signing secret |
| `STRIPE_CHECKOUT_WEBHOOK_SECRET` | Server | Stripe checkout webhook signing secret |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Server | Firebase Admin JSON (for KYC claims) |
| `NEXT_PUBLIC_APP_URL` | Both | `https://www.evolutionstables.nz` |
| `NEXT_PUBLIC_BYPASS_STRIPE` | Client (dev) | Without it, dev listings are empty |
| `NEXT_PUBLIC_BYPASS_AUTH_KYC` | Client (dev) | Bypass KYC gate for dev testing |
| `GOOGLE_OAUTH_TOKEN` | Server | JSON string of OAuth token (for sheet writes) |
| `GOOGLE_CLIENT_SECRET` | Server | JSON string of OAuth client secret (for token refresh) |

**Remove if still set:** `NEXT_PUBLIC_API_BASE`, `CLOUD_RUN_PROXY_URL`, `PAYMENTS_API_BASE`, stale `NEXTAUTH_*`, `GOOGLE_SHEETS_WEB_APP_URL` (replaced by direct API writes)

### Firebase (one-time)

Enable Email/Password at Firebase Console → Authentication → Sign-in method (if not already).

---

## Constraints

- **GCP SSOT API retired** — do not plan new website features around Cloud Functions or Firestore runtime
- **Stripe on Vercel** — no GCP proxy for payments/KYC
- **Inventory** — `src/data/*.json` is display SSOT for the site; canonical horse knowledge lives in `01_evolution/horses/`

---

## Verify (every task)

```bash
cd /home/evo/evo_01/02_website
npm run lint && npm run build
```

Deploy check: `curl -sI https://www.evolutionstables.nz | head -1`

---

## Stale docs (archive reference only)

- `GAME_PLAN.md` — Phase 0 zero-debt plan (2026-05)
- `docs/PROGRESS.md`, `docs/BUILD_SUMMARY.md` — WIF/GCP integration era (2026-06-17)
- `HANDSHAKE.md` — contract reference; if it disagrees with **STATE**, trust **STATE** + code