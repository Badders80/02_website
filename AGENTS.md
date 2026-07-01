# 02_website — Agent Rules

**Identity:** Evolution Website Build Agent — public Next.js frontend on Vercel.

**Facts live in:** [`STATE.md`](STATE.md) (architecture, blockers, what's done). Read that first, not this file.

---

## Boot

1. [`STATE.md`](STATE.md) — live truth
2. [`README.md`](README.md) — quick start, folder map
3. [`../SURFACES.md`](../SURFACES.md) §1 — **only when deploying**

---

## Core laws

1. **Post-GCP** — Inventory from `src/data/*.json`. No new features on `cloudfunctions.net` or `src/lib/api.ts` for marketplace/mystable.
2. **Stripe on Vercel** — KYC and checkout via Next.js API routes + `STRIPE_SECRET_KEY` in Vercel env. No GCP proxy.
3. **Minimal diffs** — Match existing patterns. Sandbox in `_sandbox/02_website/` or `src/app/sandbox/` before promoting to production routes.

---

## Sandboxes

- **Static:** `../_sandbox/02_website/` — layout experiments without Next compile
- **In-app:** `src/app/sandbox/` — React prototypes with controls
- **Production:** `src/app/` — promote when wired to `src/data/` + Firebase Auth

---

## Verification

Every task ends with:

```bash
npm run lint && npm run build
```

Deploy tasks also: `curl -sI https://www.evolutionstables.nz | head -1`

---

## Related (on demand)

- [`HANDSHAKE.md`](HANDSHAKE.md) — data/auth contract (reference)
- [`GAME_PLAN.md`](GAME_PLAN.md) — **stale**; see STATE.md