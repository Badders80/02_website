# Blockers & Handoff Points — Website (Post-GCP)

**Last Updated:** 2026-06-24
**Supersedes:** v1.0 (GCP-backend architecture — retired)

---

## GCP Backend — 🔴 RETIRED

GCP Cloud Functions, Firestore, and GCS are retired (billing delinquent). The website is being reframed to operate without them. See [01_evolution/BLOCKERS.md](../01_evolution/BLOCKERS.md) for GCP retirement details.

All former blockers referencing GCP APIs, Cloud Function deployment, and backend integration are **moot** — the backend is gone.

---

## Active Blockers (Post-GCP Reframe)

### ~~1. Spreadsheet Inventory Design~~ ✅ DONE

Sync script built: `scripts/sync_inventory.py` (pure Python stdlib, no deps)
- `--seed` flag: generates JSON from existing mock data (already run)
- `--sheet <name>`: syncs one sheet from Google Sheets CSV export
- No args: syncs all sheets from `sheets_config.json`
Config template: `scripts/sheets_config.json` (placeholder IDs, needs real sheet IDs)
CSV templates: `scripts/sheet_templates/` (horses, hlts, trainers, owners, holdings)
JSON data: `src/data/` (horses.json 4 records, hlts.json 4 records, trainers.json 2, owners.json 2, holdings.json 0)
TypeScript compiles clean.

**Remaining handoff (user):**
1. Create Google Sheet with 5 tabs (horses, hlts, trainers, owners, holdings)
2. Import CSV templates from `scripts/sheet_templates/` into each tab
3. Share as "Anyone with link"
4. Copy sheet ID from URL, paste into `scripts/sheets_config.json` replacing `YOUR_SHEET_ID_HERE`
5. Run `python3 scripts/sync_inventory.py` (no --seed) to verify
6. Replay workflow: Edit Sheet → `python3 scripts/sync_inventory.py` → `npm run build` → `git commit`

---

### 3. Stripe Route Rewrite — 🔴 TODO

**Status:** Not started
**What's needed:** Install `stripe` server package and rewrite four Next.js API routes to call Stripe directly instead of proxying through GCP:

| Route | Current (dead — forwards to GCP) | Target |
|---|---|---|
| `src/app/api/kyc/create-session/route.ts` | `getGcpIdentityToken()` → `fetch(${KYC_API_BASE}/create-session)` | Call `stripe.identity.VerificationSession.create()` directly |
| `src/app/api/checkout/create-session/route.ts` | `getGcpIdentityToken()` → `fetch(${PAYMENTS_API_BASE}/create-session)` | Call `stripe.checkout.Session.create()` directly |
| `src/app/api/kyc/callback/route.ts` | Uses GCP auth for Stripe webhook | Verify Stripe signature directly |
| `src/app/api/checkout/webhook/route.ts` | Uses GCP auth for Stripe webhook | Verify Stripe signature directly |

**Additional GCP-coupled routes (dormant-ify):** `api/proxy/[...path]/`, `api/diagnostics/wif/`, `api/applications/submit/`, `api/applications/list/` — all import `gcp-auth.ts`, all dead.

**Prerequisite:** `stripe` server SDK is NOT installed. Only `@stripe/stripe-js` (client) is in package.json. Must `npm install stripe` first.

**Handoff:** User provides `STRIPE_SECRET_KEY` for Vercel env vars. Currently the secret key lives in GCP env — needs to move to Vercel.

**ETA:** 2-3 hours

---

### 4. Marketplace/MyStable Rewire — 🔴 TODO

**Status:** Not started
**What's needed:** Rewire two pages to read from local JSON instead of dead API calls:

| Page | Current (dead) | Target |
|---|---|---|
| `src/app/marketplace/page.tsx` | `import { getHlts } from "@/lib/api"` → GCP API call | `import hlts from "@/data/hlts.json"` |
| `src/app/mystable/page.tsx` | `import { getHoldings, getHlts, getContent } from "@/lib/api"` → GCP API calls | `import holdings from "@/data/holdings.json"` |

**Dependencies:** Sync script (blocker 2) must produce the JSON files first.

**ETA:** 2-3 hours

---

### 5. Environment Variables — 🔴 TODO

**Status:** Not started
**What's needed:** Configure Vercel environment variables for post-GCP architecture:

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_CONFIG` | Client | Firebase Auth (likely already set) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Stripe.js (likely already set) |
| `STRIPE_SECRET_KEY` | Server | Stripe session creation (NEW — was in GCP) |
| `NEXT_PUBLIC_APP_URL` | Client/Server | App URL for redirects |
| `NEXT_PUBLIC_BYPASS_STRIPE` | Client (dev) | **Critical** — gates mock data path for marketplace/mystable. Without it, listings are empty in dev. |
| `GOOGLE_SHEETS_WEB_APP_URL` | Server | Google Apps Script URL — needed by replay script (build-order #3) |

**Remove (no longer needed):**
- `NEXT_PUBLIC_API_BASE` — no backend API
- `CLOUD_RUN_PROXY_URL` — GCP retired
- `PAYMENTS_API_BASE` — GCP retired
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `NEXTAUTH_*` — NextAuth server-side, likely stale

**Handoff:** User sets these in Vercel dashboard.

---

## Resolved Blockers (Historical)

### ~~Asset Extraction~~ ✅ DONE
427 files consolidated into `_assets/`. Symlinks active. See [_assets/WHATS_LEFT.md](../_assets/WHATS_LEFT.md).

### ~~Content Extraction~~ ✅ DONE (partial)
Homepage copy, press releases, footer content extracted. Horse profiles pending spreadsheet design.

### ~~Cloud Function Deployment~~ 🔴 RETIRED (was: TODO)
Was: deploy applications Cloud Function. Now: GCP retired, no functions to deploy.

### ~~Email Notification Implementation~~ 🔴 DEFERRED
Was: placeholder logs to console. Now: secondary priority. The "Enquire" CTA can use a simple `mailto:` link or embedded form initially. Full email provider integration is post-launch.

---

## Related

- **[AGENTS.md](AGENTS.md)** — Website agent rules (post-GCP)
- **[HANDSHAKE.md](HANDSHAKE.md)** — Data + auth contract (post-GCP)
- **[01_evolution/BLOCKERS.md](../01_evolution/BLOCKERS.md)** — Backend blockers (GCP retired)
- **[_assets/WHATS_LEFT.md](../_assets/WHATS_LEFT.md)** — Asset consolidation status
- **[GAME_PLAN.md](../01_evolution/GAME_PLAN.md)** — Post-GCP reframe plan