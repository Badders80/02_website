# Continue — Manolo payment trial

**Boot order:** this file → `../../docs/next-session-notes.md` → execute Next action.  
**Protocol:** `../../docs/SESSION_PROTOCOL.md`

## Last action

2026-07-13: Locked session protocol (AGENTS boot, BUILD_SUMMARY/PROGRESS refresh).  
Prior: live catalog + pricing + lifecycle; **I Stole A Manolo** `listed` @ **$294**; kill-switch **OFF**; health green; user said site looks decent; trial soon.

## Next action

1. `curl -sS https://www.evolutionstables.nz/api/diagnostics/payment-health | python3 -m json.tool` — confirm green.  
2. Walk `relay/2026-07-13-payment-e2e-manolo.md` (KYC → prove PURCHASES_DISABLED → controlled one-lot open).  
3. After trial: unset `PURCHASES_ENABLED` unless founder wants money left open.  
4. End session: overwrite this file + patch next-session-notes (see SESSION_PROTOCOL).

## Why

Catalog/ops ready; money path unproven E2E. Do not restart architecture work.

## Open threads

- Optional `PAYMENT_HEALTH_SECRET`  
- PDF e-sign deferred  
- Nellie / TML stay `draft`  
- Dual status fields cleanup later  

## Do not

- Casual `PURCHASES_ENABLED=true`  
- TLM spelling / Inventory tab default / $1500 / 100-share fiction  
- Uppercase Holdings/Leads tab defaults  
- Trust June WIF docs as current  

## Key paths

| What | Path |
|------|------|
| Truth | `../../docs/next-session-notes.md` |
| E2E | `relay/2026-07-13-payment-e2e-manolo.md` |
| Map | `docs/BUILD_SUMMARY.md` |
| Diary | `docs/PROGRESS.md` |
| Pricing | `src/lib/pricing.ts` |
| Lifecycle | `src/lib/campaign-status.ts` |
| Sheets | `src/lib/google-sheets.ts` |
