# Continue — Manolo: 1 unit held; terms polish; docs then go-live

**Boot order:** this file → `../../docs/next-session-notes.md` → execute Next action.  
**Do not** open `GAME_PLAN.md` or list the monorepo first.  
**Start here file:** `../00_START_HERE.md`  
**Protocol:** `../../docs/SESSION_PROTOCOL.md`

## Last action

2026-07-13 session 2 closed (/end).  
Live pay + fulfill + webhook + MyStable + terms hierarchy v1.  
Founder holds 1 unit (paid $294; new list **$225** / rate **$75** after $5 snap).  
Manolo: **12 mo** from **2026-08-01**. Kill-switch **OFF**.  
UI baseline: `relay/2026-07-13-investment-terms-ui-baseline.md`.

## Next action

1. Local iterate investment terms / purchase UX (prefer local over push spam).  
2. Finalise Manolo PDS + SA under `public/documents/i-stole-a-manolo/`.  
3. Optional: purchase qty → % of horse.  
4. Controlled open remaining lots only when docs ready.  
5. Do **not** refund founder unit unless asked.

## Why

Money path proven; commercial clarity + legal docs gate public open.

## Open threads

- PDF e-sign deferred  
- Server-side KYC later  
- Nellie / TML draft  
- Rotate chat-exposed `sk_live` if still needed  

## Do not

- Casual `PURCHASES_ENABLED=true` without docs  
- Refund / wipe holdings without ask  
- GAME_PLAN as boot  

## Key paths

| What | Path |
|------|------|
| Terms UI | `src/components/marketplace/InvestmentTermsModal.tsx` |
| Pricing snap | `src/lib/pricing.ts` |
| Fulfill | `src/lib/checkout-fulfill.ts` |
| Baseline UI | `relay/2026-07-13-investment-terms-ui-baseline.md` |
