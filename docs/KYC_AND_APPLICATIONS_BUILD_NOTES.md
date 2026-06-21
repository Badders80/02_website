# KYC and Applications Integration Build Notes

This document captures the architectural insights, troubleshooting notes, and resolutions implemented on **2026-06-17** to fix the Stripe KYC verification flow and the backend `applications` function.

---

## 1. Audience-Based GCP Identity Tokens (WIF)

### The Problem
* **GFE Gateway Level 401 Unauthorized:** Under GCP 1st Gen Cloud Functions, the Google Frontend (GFE) gateway validates that the incoming Google-issued ID token's `aud` (audience) claim **matches the function's exact trigger URL** (e.g., `https://REGION-PROJECT.cloudfunctions.net/FUNCTION`).
* **Root Cause of 401 KYC error:** The frontend was previously requesting identity tokens using the root base API URL `https://australia-southeast1-evolution-engine.cloudfunctions.net` as the audience for all direct calls. This caused the GFE gateway of the `kyc` and `applications` functions to reject requests with a `401 Unauthorized` before reaching the application logic.

### The Fix
* Refactored [src/lib/gcp-auth.ts](file:///home/evo/evo_01/02_website/src/lib/gcp-auth.ts) to key the token cache (`tokenCache` map) by the **requested audience** rather than storing a single global token.
* Updated [src/app/api/kyc/create-session/route.ts](file:///home/evo/evo_01/02_website/src/app/api/kyc/create-session/route.ts) to pass the specific `KYC_API_BASE` (`https://australia-southeast1-evolution-engine.cloudfunctions.net/kyc`) as the target audience.
* Updated [src/app/api/applications/list/route.ts](file:///home/evo/evo_01/02_website/src/app/api/applications/list/route.ts) and [src/app/api/applications/submit/route.ts](file:///home/evo/evo_01/02_website/src/app/api/applications/submit/route.ts) to pass `${baseApi}/applications` as the target audience.

---

## 2. Gen 2 Cloud Function Routing & Audiences

### The Problem
* **Missing Routing segments in backend entry point:** The backend `applications` Cloud Function had a skeleton `main.py` entry point that returned a 404 for any path other than `/`.
* **Missing firebase-admin dependency:** The function's `requirements.txt` lacked the `firebase-admin` dependency, causing startup container health checks to fail during deployment rollout.

### The Fix
* Refactored `main.py` in `/home/evo/evo_01/01_evolution/api/applications/main.py` to check path segments and route requests correctly to `/submit` and `/list` handlers, and added the Firebase token authentication middleware.
* Added `firebase-admin>=6.5.0` to the python dependencies.
* Added `api/applications/core/` to `.gitignore` to keep local workspace builds clean.

---

## 3. Stripe KYC Client-Side Redirection

### The Problem
* **Undefined clientSecret:** The user dashboard verification page at [src/app/mystable/verify/page.tsx](file:///home/evo/evo_01/02_website/src/app/mystable/verify/page.tsx) was extracting a non-existent `clientSecret` from the API response and attempting to redirect the browser to `identity.stripe.com/verify/undefined`.

### The Fix
* Stripe Identity Verification Session API returns a pre-formed secure URL (`session.url`). The backend returns this directly as `url`.
* Updated `/mystable/verify/page.tsx` to pull `url` from the response and redirect `window.location.href = url` directly.

---

## 4. Secret Propagation and Deployments

### The Problem
* **Environment Variable Stripping:** Deploying Cloud Functions using `gcloud functions deploy --env-vars-file /tmp/env_vars.yaml` fails or deploys without secrets if the temporary `/tmp/env_vars.yaml` file has been cleared by the operating system.

### The Fix
* When executing manual deploys or setting up build agents, convert local `.env` keys into YAML format at `/tmp/env_vars.yaml` before invoking `just deploy-kyc` or `just deploy-assets`.
* Template schema for `/tmp/env_vars.yaml`:
  ```yaml
  STRIPE_SECRET_KEY: <stripe_secret_key>
  STRIPE_WEBHOOK_SECRET: <stripe_webhook_secret>
  GOOGLE_CLOUD_PROJECT: evolution-engine
  STORAGE_BUCKET_IMAGES: evolution-horse-images
  STORAGE_BUCKET_DOCS: evolution-horse-docs
  ALLOWED_ORIGINS: <comma_separated_origins>
  ```

---

## 5. Live Mode Transition (2026-06-17)

### Live Credentials Applied
* **Live Publishable Key:** `pk_live_51TLJdLJ2fl0Q0SxY7XCRx8lNnD3I1h6OlVYhOehhH5kxhrnx4N3jONMAqAMnmGJmyk3z8dmml9is85g45rc54M7Q00wBkDfCYp`
* **Live Secret Key:** `rk_live_...` (Restricted Key configured in GCP KYC Function and Vercel)
* **Live Webhook Endpoint:** Registered at Stripe for `https://australia-southeast1-evolution-engine.cloudfunctions.net/kyc/webhook`.
* **Live Webhook Secret:** `whsec_...` (Signature secret configured in GCP KYC Function and Vercel)

