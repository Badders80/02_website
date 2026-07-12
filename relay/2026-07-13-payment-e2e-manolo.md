# Payment E2E — I Stole A Manolo (controlled open)

## Play (order)

1. **Health** — `GET /api/diagnostics/payment-health` → env + sheets + manolo listed, `purchases_enabled: false`
2. **Browse** — `/marketplace/i-stole-a-manolo` shows as buyable lifecycle (Become An Owner) but money still closed
3. **Auth + KYC** — log in → `/auth/verify` → Stripe Identity → claims verified
4. **Create-session while kill-switch OFF** — click acquire → expect **403 PURCHASES_DISABLED** (proves gate)
5. **Controlled open** (only when ready):
   - Vercel: set `PURCHASES_ENABLED=true` (Production), redeploy if needed
   - Health: `purchases_enabled: true`
   - One purchase (1 lot @ $294 NZD list)
   - Confirm: Stripe paid → `holdings` row → `shares_sold` 0→1 → welcome email
6. **Close money** if anything wrong: unset `PURCHASES_ENABLED` immediately

## Commercial snapshot (Manolo)

| Field | Value |
|-------|-------|
| Owner rate | $70 / mo / 1% |
| Fee | 5% → list $73.50 / mo / 1% |
| Stake / lots | 5% / 20 → 0.25% per lot |
| Months | 16 |
| List lot (purchase price) | **$294** |
| Investor return | 75% gross stakes |

## Kill-switch

`PURCHASES_ENABLED` must be exactly `"true"` to charge. Missing/false = closed.

## Stripe Dashboard checklist

- [ ] Secret key mode matches publishable (live↔live or test↔test)
- [ ] Webhook `…/api/checkout/webhook` → `checkout.session.*` → secret = `STRIPE_CHECKOUT_WEBHOOK_SECRET`
- [ ] Webhook `…/api/kyc/callback` → `identity.verification_session.*` → secret = `STRIPE_KYC_WEBHOOK_SECRET`
- [ ] Success URL base = `NEXT_PUBLIC_APP_URL` (www.evolutionstables.nz)

## After first success

- Decide: leave open for more lots, or flip kill-switch off and set campaign `fully_subscribed` / back to `coming_soon`
- PDF signing still deferred — holdings OK without signed PDF URLs for Stage 1
