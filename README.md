# Evolution Stables — Website

**Repository:** `02_website/` (own git remote)  
**Prod:** https://www.evolutionstables.nz  
**Vercel:** `evolution-3-0`

---

## Agent / session boot (required)

> **STOP.** Before listing the repo or opening `GAME_PLAN.md` / old docs:  
> read **only** the two files below, then answer “what’s next.”

| Order | File | Role |
|-------|------|------|
| **0** | [`00_START_HERE.md`](00_START_HERE.md) | Same rule, hard to miss |
| **1** | [`relay/continue.md`](relay/continue.md) | Next action only |
| **2** | [`../docs/next-session-notes.md`](../docs/next-session-notes.md) | Current truth (kill-switch, Manolo, numbers) |

**Copy-paste:**

```text
Read 02_website/00_START_HERE.md (or relay/continue.md + docs/next-session-notes.md). What's next?
```

**Banned for boot:** `GAME_PLAN.md`, June WIF/SESSION_BRIEF, random `docs/` archaeology, parent `evo_01` tree walk.

| Later | When |
|------|------|
| [`AGENTS.md`](AGENTS.md) | Laws |
| [`docs/BUILD_SUMMARY.md`](docs/BUILD_SUMMARY.md) | Architecture map |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Diary history only |
| [`../docs/SESSION_PROTOCOL.md`](../docs/SESSION_PROTOCOL.md) | Wrap ritual |

**End of session:** *update the end of session notes* → overwrite `relay/continue.md` + patch `../docs/next-session-notes.md`.

---

## Quick start (dev)

```bash
npm install
npm run dev
# http://localhost:3000
```

---

## Purpose

Public investor site: marketplace, auth, KYC, checkout, MyStable.

**Runtime commercial SSOT:** Google Sheet tab **`hlts`** (live).  
**Static JSON** (`src/data/*.json`) = fallback only.  
**`01_evolution`:** knowledge/identity SSOT — not read live by the site; sync when horse truth changes.

**Money kill-switch:** `PURCHASES_ENABLED` must be `"true"` to charge (default off).

---

## Layout

```
02_website/
├── relay/continue.md       ← NEXT ACTION (boot #1)
├── AGENTS.md               ← agent laws
├── src/app/                ← Next.js App Router
├── src/lib/                ← pricing, campaign-status, google-sheets, auth
├── src/data/               ← static fallback JSON
├── docs/BUILD_SUMMARY.md   ← map
├── docs/PROGRESS.md        ← diary
└── public/images/          ← static assets
```

---

## Related

- Monorepo handoff: `../docs/next-session-notes.md`  
- E2E trial: `relay/2026-07-13-payment-e2e-manolo.md`  
- Health: `/api/diagnostics/payment-health`  
