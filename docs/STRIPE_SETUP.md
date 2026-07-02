# Stripe Setup Checklist — For Alex (manual steps)

This is what you need to do in Stripe Dashboard + Vercel + Firebase Console to get KYC and checkout working end-to-end. The code is already wired — this is just secrets + configuration.

## 1. Stripe Dashboard (https://dashboard.stripe.com)

### Get API keys (test mode first):
- **Secret key:** `sk_test_...` — copy this
- **Publishable key:** `pk_test_...` — copy this

### Register webhook endpoints:
1. Developers → Webhooks → Add endpoint
2. Create two endpoints:
   - **KYC callback:**
     - URL: `https://www.evolutionstables.nz/api/kyc/callback`
     - Events: `identity.verification_session.verified`, `identity.verification_session.requires_input`, `identity.verification_session.canceled`
     - Copy signing secret: `whsec_...` → this is `STRIPE_KYC_WEBHOOK_SECRET`
   - **Checkout webhook:**
     - URL: `https://www.evolutionstables.nz/api/checkout/webhook`
     - Events: `checkout.session.completed`, `checkout.session.expired`
     - Copy signing secret: `whsec_...` → this is `STRIPE_CHECKOUT_WEBHOOK_SECRET`
3. **Note:** Each endpoint has its own signing secret. They are NOT the same.

## 2. Vercel (https://vercel.com/dashboard)

Go to your project → Settings → Environment Variables. Set these for **all environments** (Production/Preview/Development):

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `STRIPE_KYC_WEBHOOK_SECRET` | `whsec_...` (from KYC endpoint) |
| `STRIPE_CHECKOUT_WEBHOOK_SECRET` | `whsec_...` (from checkout endpoint) |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Full JSON from step 3 below (escaped as string) |
| `NEXT_PUBLIC_APP_URL` | `https://www.evolutionstables.nz` |
| `GOOGLE_OAUTH_TOKEN` | Contents of `scripts/token.json` (paste as JSON string) |
| `GOOGLE_CLIENT_SECRET` | Contents of `scripts/client-secret.json` (paste as JSON string) |

**Remove these if still set:**
- `NEXT_PUBLIC_API_BASE`
- `CLOUD_RUN_PROXY_URL`
- `PAYMENTS_API_BASE`
- `NEXTAUTH_*`
- `GOOGLE_SHEETS_WEB_APP_URL`

## 3. Firebase Console (https://console.firebase.google.com)

1. Project Settings → Service accounts → **Generate new private key**
2. Download the JSON file
3. This entire JSON becomes the value of `FIREBASE_SERVICE_ACCOUNT_KEY` in Vercel
4. (Paste the full JSON content as the env var value — Vercel handles it as a string)
5. Authentication → Sign-in method → ensure **Email/Password** and **Google** are enabled

## 4. Local .env.local (for dev testing)

```env
NEXT_PUBLIC_BYPASS_STRIPE=true
NEXT_PUBLIC_BYPASS_AUTH_KYC=true
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_KYC_WEBHOOK_SECRET=whsec_...
STRIPE_CHECKOUT_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For local Stripe webhook testing, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook
stripe listen --forward-to localhost:3000/api/kyc/callback
```

## 5. Test Flow (just-me)

Once everything is configured:

1. `npm run dev` with bypass flags
2. Visit `/marketplace` → click a horse → see CTAs
3. Login (email/Google) → redirected back to detail page
4. Click "Verify Identity (KYC)" → Stripe Identity test flow → complete
5. Return → KYC status updates to "verified"
6. Submit an enquiry → check Google Sheet Applications tab for new row
7. (If checkout wired) Click Acquire → Stripe test checkout → complete
8. Check Google Sheet holdings tab for new row
9. Run `python3 scripts/sync_inventory.py` → `npm run build` → MyStable shows holding

## 6. Going Live

When ready to switch from test to live:
1. Replace test keys with live keys in Vercel
2. Update webhook endpoints to live mode in Stripe
3. Remove `NEXT_PUBLIC_BYPASS_STRIPE` and `NEXT_PUBLIC_BYPASS_AUTH_KYC`
4. Deploy: `vercel --prod`