# 02_website — Progress (Diary)

**Last updated:** 2026-07-13 (/end session 2)  
**Current phase:** Manolo 1 unit held; terms UX polish; docs before public open  
**Money:** `PURCHASES_ENABLED` unset (kill-switch OFF)  
**Blockers:** Legal PDS/SA still stubs; public open gated on docs

> ⛔ **Not the “what’s next” file.** This is history.  
> **Boot:** [`../00_START_HERE.md`](../00_START_HERE.md) → [`../relay/continue.md`](../relay/continue.md) → [`../../docs/next-session-notes.md`](../../docs/next-session-notes.md)  
> **Map:** [BUILD_SUMMARY.md](BUILD_SUMMARY.md)

---

## What's next (canonical)

1. Iterate investment terms / purchase UX locally — baseline: `relay/2026-07-13-investment-terms-ui-baseline.md`  
2. Final Manolo PDS + SA (`public/documents/i-stole-a-manolo/`)  
3. Purchase window: qty → live % of horse (optional polish)  
4. Controlled open remaining lots when docs ready (`PURCHASES_ENABLED=true`)  
5. Optional: rotate chat-exposed Stripe `sk_live` if still live  

---

## Session log

| Date | Focus | Outcome | Notes |
|------|-------|---------|-------|
| 2026-07-13 | Manolo live pay + fulfill + MyStable + terms hierarchy | **Shipped** | [log](logs/2026-07-13.md) session 2 · webhook + recover · $225 list |
| 2026-07-13 | Go-live catalog + Manolo trial prep + session protocol | **Shipped** | [log](logs/2026-07-13.md) |
| 2026-07-13 | Session wrap | **Notes** | Trial still next; boot hardened; islands have continue+STATE |
| 2026-07-13 | Live ops + pricing + lifecycle + Manolo stage | **Deployed** | `0f53d2a`…`287971e`. Manolo listed; kill-switch off; health green. |
| 2026-07-13 | Session protocol all islands + boot harden | **Docs** | continue/STATE; `00_START_HERE`; GAME_PLAN non-boot |
| 2026-07-12 | Hard-close purchases | **Deployed** | `bfa4929` — PURCHASES_ENABLED gate |
| 2026-06-17 | Go-live + OAuth (historical) | Complete | Pre-reframe; WIF era — **obsolete as current status** |
| 2026-06-12 | Ownership applications | Complete | Historical |
| 2026-06-11 | GCP/WIF infra | Complete | **GCP path retired** |

---

## Architecture status (quick)

| Area | Status |
|------|--------|
| Live `hlts` catalog | ✅ |
| Pricing model | ✅ + list $ round up to $5 |
| Campaign lifecycle | ✅ |
| TML slug | ✅ |
| Kill-switch | ✅ off |
| Manolo listed SKU | ✅ 12 mo · start 2026-08-01 · $225 unit |
| Payment E2E (charge + fulfill) | ✅ founder 1 unit held ($294 historical) |
| LIVE checkout webhook | ✅ |
| Recover fulfill path | ✅ `/api/checkout/recover` |
| MyStable live holdings | ✅ |
| Investment terms hierarchy | ✅ iterate further |
| PDF e-sign | ⏸️ deferred |
| Manolo legal docs | ⏳ stubs |
| Nellie / TML | draft |

---

## Phase history (collapsed)

- Phases 0–5 (assets → content → marketplace → SEO → applications): complete historically  
- Phase 6 WIF/GCP: **abandoned** — replaced by Sheets + Stripe direct  
- Phase 7: Go-live catalog honesty + controlled open-SKU  
- Phase 8 (current): **Money path proven; commercial clarity + docs before public open**

---

## How to update this file

End of session: add one table row under Session log; refresh “What's next” if it changed.  
Do not paste full chat. Details go in `docs/logs/` or next-session-notes.
