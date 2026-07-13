# Continue — Manolo: 1 unit held, docs then go-live

**Boot order:** this file → `../../docs/next-session-notes.md` → execute Next action.  
**Do not** open `GAME_PLAN.md` or list the monorepo first.  
**Start here file:** `../00_START_HERE.md`  
**Protocol:** `../../docs/SESSION_PROTOCOL.md`

## Last action

2026-07-13 (session).  
Live Manolo purchase **kept**: 1 lot @ $294, founder as buyer (`alex@evolutionstables.nz`).  
Stripe paid (`pi_3TsWEa…` / session `cs_live_a10iydu…`).  
Webhook did **not** auto-fire; fulfilled via `/api/checkout/recover`.  
Welcome email + holdings + `shares_sold` 0→1 + MyStable path verified.  
**No refund.** Unit stays as real inventory.  
Kill-switch **OFF**. Public go-live deferred until **docs** (PDS/SA) updated.

## Next action

1. Finalise Manolo legal docs (PDS + Syndicate Agreement) — replace stubs under `public/documents/i-stole-a-manolo/`.  
2. Only then: controlled open (`PURCHASES_ENABLED=true`) for public lots; leave founder unit as sold.  
3. Do **not** reverse holdings / refund unless founder changes mind.

## Why

Money + fulfill + LIVE checkout webhook proven. Docs still gate public open.

## Open threads

- PDF e-sign deferred  
- Server-side KYC on create-session later  
- Nellie / TML stay `draft`  
- `PAYMENT_RECOVER_SECRET` on Vercel for ops backfill  
- **Rotate** `Evo_Website` sk_live if exposed in chat; already set on Vercel Production  

## Do not

- Casual `PURCHASES_ENABLED=true` without webhook proof + docs  
- Refund / zero `shares_sold` without explicit ask  
- Treat GAME_PLAN / June WIF as current  

## Key paths

| What | Path |
|------|------|
| Truth | `../../docs/next-session-notes.md` |
| Fulfill | `src/lib/checkout-fulfill.ts` |
| Recover | `src/app/api/checkout/recover/route.ts` |
| Webhook | `src/app/api/checkout/webhook/route.ts` |
| Docs stubs | `public/documents/i-stole-a-manolo/` |
