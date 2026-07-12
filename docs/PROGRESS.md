# 02_website — Progress (Diary)

**Last updated:** 2026-07-13  
**Current phase:** Manolo controlled payment trial  
**Money:** `PURCHASES_ENABLED` unset (kill-switch OFF)

> ⛔ **Not the “what’s next” file.** This is history.  
> **Boot:** [`../00_START_HERE.md`](../00_START_HERE.md) → [`../relay/continue.md`](../relay/continue.md) → [`../../docs/next-session-notes.md`](../../docs/next-session-notes.md)  
> **Map:** [BUILD_SUMMARY.md](BUILD_SUMMARY.md)

---

## What's next (canonical)

1. Health check: `/api/diagnostics/payment-health`  
2. E2E runbook: `relay/2026-07-13-payment-e2e-manolo.md`  
3. Controlled one-lot purchase on **I Stole A Manolo** ($294) when founder ready  
4. Unset kill-switch after trial unless leaving open intentionally  

---

## Session log

| Date | Focus | Outcome | Notes |
|------|-------|---------|-------|
| 2026-07-13 | Live ops + pricing + lifecycle + Manolo stage | **Deployed** | Commits `0f53d2a`, `4a0002f`, `287971e`. Manolo listed; kill-switch off; health green. |
| 2026-07-12 | Hard-close purchases | **Deployed** | `bfa4929` — PURCHASES_ENABLED gate |
| 2026-07-13 | Session log protocol lock-in | **Docs** | AGENTS boot, BUILD_SUMMARY/PROGRESS refreshed |
| 2026-06-17 | Go-live + OAuth (historical) | Complete | Pre-reframe; WIF era — **obsolete as current status** |
| 2026-06-12 | Ownership applications | Complete | Historical |
| 2026-06-11 | GCP/WIF infra | Complete | **GCP path retired** |

---

## Architecture status (quick)

| Area | Status |
|------|--------|
| Live `hlts` catalog | ✅ |
| Pricing model | ✅ |
| Campaign lifecycle | ✅ |
| TML slug | ✅ |
| Kill-switch | ✅ off |
| Manolo listed trial SKU | ✅ staged |
| Payment E2E | ⏳ next |
| PDF e-sign | ⏸️ deferred |
| Nellie / TML | draft |

---

## Phase history (collapsed)

- Phases 0–5 (assets → content → marketplace → SEO → applications): complete historically  
- Phase 6 WIF/GCP: **abandoned** — replaced by Sheets + Stripe direct  
- Phase 7 (current): **Go-live catalog honesty + controlled open-SKU**

---

## How to update this file

End of session: add one table row under Session log; refresh “What's next” if it changed.  
Do not paste full chat. Details go in `docs/logs/` or next-session-notes.
