# Continue — Manolo payment trial

**Boot order:** this file → `../../docs/next-session-notes.md` → execute Next action.  
**Do not** open `GAME_PLAN.md` or list the monorepo first.  
**Start here file:** `../00_START_HERE.md`  
**Protocol:** `../../docs/SESSION_PROTOCOL.md`

## Last action

2026-07-13 session closed.  
Done this arc: live Sheets catalog, pricing ($70 owner → list lot), 6-state lifecycle, TML rename, Manolo **listed** @ **$294**, payment-health, kill-switch **OFF**.  
Session protocol rolled to **all evo_01 islands** (continue + STATE).  
Boot hardened (`00_START_HERE`, GAME_PLAN banned for “what’s next”).  
Founder walked site (looks decent); Antigravity test found correct next steps.  
**Money E2E not run.**

## Next action

1. Health: `curl -sS https://www.evolutionstables.nz/api/diagnostics/payment-health | python3 -m json.tool`  
2. Walk `relay/2026-07-13-payment-e2e-manolo.md` (browse Manolo → KYC → prove PURCHASES_DISABLED → controlled one lot @ $294).  
3. After trial: unset `PURCHASES_ENABLED` unless founder wants money left open.

## Why

Catalog/ops ready; payment path unproven E2E. Next is trial, not architecture.

## Open threads

- Optional `PAYMENT_HEALTH_SECRET`  
- PDF e-sign deferred  
- Nellie / TML stay `draft`  
- Dual status fields cleanup later  

## Do not

- Casual `PURCHASES_ENABLED=true`  
- TLM / Inventory tab default / $1500 / 100-share fiction  
- Uppercase Holdings/Leads tab defaults  
- Trust June WIF / GAME_PLAN as current  

## Key paths

| What | Path |
|------|------|
| Truth | `../../docs/next-session-notes.md` |
| E2E | `relay/2026-07-13-payment-e2e-manolo.md` |
| Map | `docs/BUILD_SUMMARY.md` |
| Pricing | `src/lib/pricing.ts` |
| Lifecycle | `src/lib/campaign-status.ts` |
| Sheets | `src/lib/google-sheets.ts` |
