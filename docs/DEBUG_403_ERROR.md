# 🔍 Debugging 403 Error - 2026-06-17

## Current Status

**OIDC in Vercel:** ✅ ENABLED (confirmed from screenshot)  
**KYC Route:** ✅ DEPLOYED (correct endpoint `/kyc/create-session`)  
**Error:** 403 Forbidden when clicking "Start Verification"

---

## Root Cause Analysis

The 403 error means the Cloud Function is **rejecting the authentication**. This could be:

### Possibility 1: GCP WIF Not Configured for Vercel OIDC Issuer

**Vercel OIDC Issuer** (from your screenshot):
```
https://oidc.vercel.com/baddeley0-2132s-projects
```

**GCP WIF Pool Provider** needs to trust this issuer.

**Check in GCP Console:**
1. Go to: https://console.cloud.google.com/iam-admin/workload/identity/pools
2. Click on pool: `vercel-pool`
3. Click on provider: `vercel-oidc`
4. Check "Issuer URI" - should match Vercel's issuer above
5. Check "Attribute mapping" - should map `google.subject` to `assertion.sub`

**If mismatch:** The WIF provider needs to be updated to trust Vercel's issuer.

---

### Possibility 2: Service Account Missing Permissions

The `website-api@evolution-engine.iam.gserviceaccount.com` needs:
- `roles/cloudfunctions.invoker` on the KYC Cloud Function
- `roles/iam.serviceAccountTokenCreator` (for generating identity tokens)

**Check in GCP Console:**
1. Go to: https://console.cloud.google.com/iam-admin/iam
2. Find: `website-api@evolution-engine.iam.gserviceaccount.com`
3. Verify it has both roles above

---

### Possibility 3: Cloud Function Rejecting Firebase Token

The KYC Cloud Function might be:
- Not receiving the Firebase token
- Firebase token expired/invalid
- Firebase Auth not properly configured in Cloud Function

**Check Cloud Function Logs:**
1. Go to: https://console.cloud.google.com/logs
2. Filter by:
   - Resource: Cloud Function
   - Function name: `kyc`
3. Look for the error when you click "Start Verification"
4. Should see what authentication failed

---

## 🛠️ Immediate Diagnostic Steps

### Step 1: Check Vercel Deployment Logs

1. Go to: https://vercel.com/baddeley0-2132s-projects/evolution-3-0/deployments
2. Click on the latest deployment (should be the one with KYC fix)
3. Click "View Build Logs" or "Function Logs"
4. Look for errors related to:
   - `getGcpIdentityToken()`
   - `VERCEL_OIDC_TOKEN`
   - WIF token exchange

**Expected:** Should see successful token generation  
**If failing:** Will show "Failed to get GCP identity token" error

---

### Step 2: Test Handshake Endpoint

Visit: https://www.evolutionstables.nz/handshake

This endpoint tests all the authentication pieces:
- Vercel OIDC → GCP WIF → Cloud Functions
- Firebase Auth forwarding
- Service Account permissions

**Expected:** All 7 checks green  
**If red:** Shows exactly which piece is broken

---

### Step 3: Check GCP WIF Configuration

Run this in your terminal to check WIF setup:

```bash
# Check WIF pool exists
gcloud iam workload-identity-pools describe vercel-pool \
  --location=global \
  --project=evolution-engine

# Check WIF provider
gcloud iam workload-identity-pools providers describe vercel-oidc \
  --location=global \
  --pool=vercel-pool \
  --project=evolution-engine
```

**Expected:** Should show provider details with correct issuer URI

---

## 🎯 Most Likely Fix

Based on the 403 error and OIDC being enabled, the issue is probably:

**GCP WIF provider not configured to trust Vercel's OIDC issuer**

**Fix:**
1. Go to GCP Console → IAM & Admin → Workload Identity Federation
2. Click on pool `vercel-pool`
3. Click on provider `vercel-oidc`
4. Edit the provider
5. Set "Issuer URI" to: `https://oidc.vercel.com/baddeley0-2132s-projects`
6. Save
7. Redeploy Vercel

---

## 📋 Quick Checklist

- [ ] Check Vercel function logs for token generation errors
- [ ] Test /handshake endpoint (should show which auth piece fails)
- [ ] Verify GCP WIF provider issuer matches Vercel's OIDC issuer
- [ ] Check Cloud Function logs for authentication errors
- [ ] Verify service account has correct IAM roles

---

**Next Action:** Check the handshake endpoint and Vercel logs to pinpoint the exact failure point.
