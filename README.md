# Evolution Stables — Website

**Repository:** `02_website/`  
**Deploy:** Vercel → https://www.evolutionstables.nz  
**Live state:** [`STATE.md`](STATE.md)

---

## Agent boot (2 files)

```
STATE.md  →  README.md
```

Add [`../SURFACES.md`](../SURFACES.md) §1 only when shipping to production.

---

## Quick start

```bash
cd /home/evo/evo_01/02_website
npm install
npm run dev    # http://localhost:3000
npm run lint && npm run build
```

**Dev tip:** `NEXT_PUBLIC_BYPASS_STRIPE=true` shows marketplace listings without live Stripe.

---

## What lives here

- Public marketing (home, press, privacy, terms)
- Marketplace + MyStable (local JSON inventory)
- Firebase Auth + Stripe KYC/checkout (Vercel API routes)

**Not here:** Canonical SSOT writes (see `01_evolution/` knowledge repo). GCP backend is **retired** for this vertical.

---

## Architecture

```
scripts/sync_inventory.py  →  src/data/*.json
                                    ↓
              marketplace / mystable pages (build-time / static import)
                                    ↓
              Firebase Auth  →  Stripe (api/kyc, api/checkout on Vercel)
```

Inventory replay (when Google Sheet is wired):

```bash
python3 scripts/sync_inventory.py
npm run build
```

---

## Folder map

```
02_website/
├── STATE.md              ← live state (read first)
├── src/app/              ← pages + API routes
├── src/data/             ← inventory JSON (SSOT for site display)
├── scripts/              ← sync_inventory.py, sheet templates
├── public/               ← static assets
├── dna/                  ← brand + content atoms
├── docs/                 ← session history (not boot docs)
└── _sandbox/ (parent)    ← static HTML experiments
```

---

## Environment

Public keys in Vercel / `.env` symlink chain. Server secret: `STRIPE_SECRET_KEY` (Vercel only).

```env
NEXT_PUBLIC_FIREBASE_CONFIG=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_APP_URL=https://www.evolutionstables.nz
```

Do **not** set `NEXT_PUBLIC_API_BASE` for new work — GCP SSOT API is retired.

---

## Related

- [`STATE.md`](STATE.md) — remaining work, handoffs, verify commands
- [`AGENTS.md`](AGENTS.md) — rules (short)
- [`../SURFACES.md`](../SURFACES.md) — delivery surfaces (on ship)