# Evolution Stables — Website

**Repository:** `02_website/` (own git remote)  
**Prod:** https://www.evolutionstables.nz  
**Vercel:** `evolution-3-0`

---

## Agent / session boot (required)

**Anyone working in this folder — start here. Do not re-derive state from chat.**

| Order | File | Role |
|-------|------|------|
| **1** | [`relay/continue.md`](relay/continue.md) | Next action only |
| **2** | [`../docs/next-session-notes.md`](../docs/next-session-notes.md) | Current truth (kill-switch, Manolo, numbers) |

**Copy-paste:**

```text
Read relay/continue.md and ../docs/next-session-notes.md. What's next?
```

| Also | When |
|------|------|
| [`AGENTS.md`](AGENTS.md) | Laws + boot + do-not list |
| [`docs/BUILD_SUMMARY.md`](docs/BUILD_SUMMARY.md) | Architecture map |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Session diary |
| [`../docs/SESSION_PROTOCOL.md`](../docs/SESSION_PROTOCOL.md) | Monorepo wrap ritual |

**End of session:** overwrite `relay/continue.md` + patch `../docs/next-session-notes.md` (30s). See SESSION_PROTOCOL.

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
