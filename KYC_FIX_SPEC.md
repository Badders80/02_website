# KYC Fix Spec — Stripe Identity → Firebase Custom Claims → Client UI

## Problem
User completes Stripe Identity verification (passport upload). Returns to `/auth/verify?from=stripe`. Page shows "Checking status..." or "being reviewed" indefinitely. KYC status never flips to `verified` in the UI. The `/mystable` KycBanner still shows "Start Verification" even though Stripe may have verified the session.

## Architecture (current)
- **Frontend:** Next.js app on Vercel. Firebase Auth (client SDK) for user auth. `auth-context.tsx` exposes `kycStatus` from custom claims on the Firebase ID token.
- **Backend:** Next.js API routes (serverless functions on Vercel).
  - `POST /api/kyc/create-session` — creates Stripe Identity VerificationSession, sets `client_reference_id = uid`, `metadata.user_id = uid`. Also lists existing sessions first: if verified found → sets claims + returns `{verified:true}`. If processing/requires_input found → reuses session URL.
  - `POST /api/kyc/callback` — Stripe webhook. Verifies signature, reads `session.metadata.user_id`, calls `setCustomClaims`.
- **firebase-admin.ts** — Custom implementation (no firebase-admin SDK). Verifies ID tokens by fetching Firebase public keys and checking RS256 signature. Sets custom claims by minting a service-account JWT → exchanging for OAuth access token with `identitytoolkit` scope → calling `identitytoolkit.googleapis.com/v1/projects/{projectId}/accounts:update`.
- **Vercel env vars:** `STRIPE_SECRET_KEY`, `STRIPE_KYC_WEBHOOK_SECRET` (or fallback `STRIPE_WEBHOOK_SECRET`), `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON), `FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_FIREBASE_CONFIG` (client-side).

## Suspected Failure Points (ranked)

### 1. Webhook secret mismatch / not set
`STRIPE_KYC_WEBHOOK_SECRET` may not be set in Vercel production env, or may not match the secret Stripe shows for the Identity webhook endpoint. If mismatch → `constructEvent` throws → webhook returns 400 → claims never set. User never gets verified via webhook path.

### 2. Service account permissions for setCustomClaims
`setCustomClaims` mints a JWT with `identitytoolkit` scope from `FIREBASE_SERVICE_ACCOUNT_KEY`. If the service account lacks **Firebase Authentication Admin** role (or `identitytoolkit.googleapis.com` API is disabled), the token exchange or the REST call fails. Claims never set — even in the create-session sync path (which also calls setCustomClaims).

### 3. FIREBASE_PROJECT_ID not set in Vercel
`verifyIdToken` defaults to `'evolution-engine'`. If the actual Firebase project ID differs and `FIREBASE_PROJECT_ID` is not set server-side, token verification fails → create-session returns 401 → no KYC flow works at all.

### 4. Webhook reads metadata.user_id but no fallback to client_reference_id
If `session.metadata?.user_id` is undefined (Stripe sometimes doesn't propagate metadata in webhook events for older sessions, or if metadata was set incorrectly), the webhook logs a warning and doesn't set claims. `session.client_reference_id` is also available and should be used as fallback.

### 5. Client polling doesn't force server-side check
The `/auth/verify` page polls `refreshClaims()` every 3s for 60s — this only calls `getIdTokenResult(true)` which forces a client-side token refresh. If the webhook hasn't set claims (because of issues 1-4), this polling will never see `verified`. The polling should ALSO call `/api/kyc/create-session` (which does the Stripe list + sync) rather than just refreshing the Firebase token.

### 6. KycBanner still says "test mode" in pending message
`KycBanner.tsx` line 15: `"Your identity verification is being reviewed. This usually takes 1-2 minutes in test mode."` — this text should have been removed.

## File paths (all under /home/evo/evo_01/02_website/)

| File | Purpose |
|------|---------|
| `src/app/api/kyc/create-session/route.ts` | Create/resume/sync Stripe Identity session |
| `src/app/api/kyc/callback/route.ts` | Stripe webhook handler |
| `src/lib/firebase-admin.ts` | Custom Firebase Admin (verifyIdToken, setCustomClaims) |
| `src/lib/stripe.ts` | Stripe SDK init |
| `src/lib/auth-context.tsx` | Client-side auth context (kycStatus, refreshClaims) |
| `src/app/auth/verify/page.tsx` | Post-Stripe return page (polling + status display) |
| `src/app/mystable/verify/page.tsx` | MyStable verification entry point |
| `src/components/KycBanner.tsx` | Banner shown on /mystable when not verified |

## What to fix (deliverable)

### A. Webhook: add client_reference_id fallback
In `callback/route.ts`, after reading `session.metadata?.user_id`, fall back to `session.client_reference_id` if metadata.user_id is missing. Both are set in create-session.

### B. Client polling: call create-session on the server side
In `verify/page.tsx`, the polling loop should call `POST /api/kyc/create-session` (which does the authoritative Stripe list + sync) instead of only calling `refreshClaims()`. If create-session returns `{verified:true}`, call `refreshClaims()` then redirect to `/mystable`.

### C. Remove "test mode" text from KycBanner
`KycBanner.tsx` pending message still says "1-2 minutes in test mode". Remove the test mode reference.

### D. Add a GET /api/kyc/status endpoint
A lightweight endpoint that:
1. Verifies the Bearer token (verifyIdToken)
2. Lists Stripe verification sessions by client_reference_id
3. If verified found → sets claims → returns `{kyc_status:"verified"}`
4. Otherwise returns current status from Stripe (processing, requires_input, etc.)
This gives the client a single endpoint to poll that does the full server-side check + sync.

### E. Verify env vars are correctly set (Vercel)
Document exactly which env vars must be set in Vercel production for KYC to work:
- `STRIPE_SECRET_KEY`
- `STRIPE_KYC_WEBHOOK_SECRET` (must match Stripe Dashboard → Developers → Webhooks → Identity endpoint secret)
- `FIREBASE_SERVICE_ACCOUNT_KEY` (full JSON, the service account must have Firebase Authentication Admin role)
- `FIREBASE_PROJECT_ID` (must match the Firebase project in NEXT_PUBLIC_FIREBASE_CONFIG)
- `NEXT_PUBLIC_APP_URL` = `https://www.evolutionstables.nz`

### F. Improve error logging
Add structured console.log/error statements at each decision point in create-session and callback so Vercel logs show exactly what happened: which branch was taken, what Stripe returned, whether setCustomClaims succeeded or failed.

## Constraints
- No firebase-admin SDK (current custom implementation works, don't replace it)
- Must work on Vercel serverless (no long-running processes)
- Stripe API version: `2025-06-30.basil`
- Firebase project: `evolution-engine` (verify this)
- Production URL: `https://www.evolutionstables.nz`
- Return all code as complete file contents, not diffs