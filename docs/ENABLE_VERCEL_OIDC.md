# 🚨 CRITICAL: Enable Vercel OIDC - 2026-06-17

## Problem
KYC verification shows "API error: 403" because Vercel OIDC is not enabled.

The code in `src/lib/gcp-auth.ts` expects `VERCEL_OIDC_TOKEN` environment variable, but Vercel doesn't provide it automatically - **you must enable it manually**.

---

## 🔧 Solution (60 seconds)

### Step 1: Enable OIDC in Vercel Dashboard

1. **Go to:** https://vercel.com/baddeley0-2132s-projects/evolution-3-0/settings/security
2. **Scroll down** to "OpenID Connect" section
3. **Toggle ON** "Enable OpenID Connect"
4. **Click Save** (if prompted)

**Direct Link:**  
👉 https://vercel.com/baddeley0-2132s-projects/evolution-3-0/settings/security

---

### Step 2: Redeploy to Vercel

After enabling OIDC, trigger a redeploy:

**Option A: Via Dashboard**
1. Go to: https://vercel.com/baddeley0-2132s-projects/evolution-3-0/deployments
2. Click the **three dots (⋮)** on latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

**Option B: Via Git**
```bash
cd /home/evo/evo_01/02_website
git commit --allow-empty -m "chore: redeploy with OIDC enabled"
git push origin 22May
```

---

## ✅ Verification

After redeployment completes:

1. **Visit:** https://www.evolutionstables.nz/mystable
2. **Login** with Google OAuth
3. **Click** "Start Verification"
4. **Should:** Redirect to Stripe Identity (no 403 error!)

---

## 📋 What's Happening

**Before (403 Error):**
```
Browser → Next.js Route → Cloud Function
                    ↓
            getGcpIdentityToken()
                    ↓
            VERCEL_OIDC_TOKEN = undefined ❌
                    ↓
            No GCP auth token sent
                    ↓
            Cloud Function rejects: 403 Forbidden
```

**After (Working):**
```
Browser → Next.js Route → Cloud Function
                    ↓
            getGcpIdentityToken()
                    ↓
            VERCEL_OIDC_TOKEN = [JWT token] ✅
                    ↓
            Exchange for GCP token via WIF
                    ↓
            Send Authorization header
                    ↓
            Cloud Function accepts: 200 OK
```

---

## 🎯 Why This Matters

The KYC flow requires:
1. ✅ Firebase Auth (user logged in) - **WORKING**
2. ✅ Cloud Function endpoint - **WORKING**
3. ✅ GCP Workload Identity Federation - **CONFIGURED**
4. ❌ Vercel OIDC - **NOT ENABLED** ← **THIS IS THE BLOCKER**

Once you enable OIDC in Vercel, the entire auth chain works:
- Vercel provides OIDC token
- Exchanged for GCP access token
- Exchanged for GCP identity token
- Sent to Cloud Function
- Cloud Function validates and processes KYC request

---

## 📞 If Still Broken After Enabling OIDC

1. **Check Vercel deployment logs:**
   - Look for "Failed to get GCP identity token" errors
   - Should see successful WIF token exchange

2. **Test handshake endpoint:**
   - Visit: https://www.evolutionstables.nz/handshake
   - All 7 checks should be green

3. **Check GCP logs:**
   - https://console.cloud.google.com/logs
   - Filter by Cloud Function: `kyc`
   - Look for authentication errors

---

**Generated:** 2026-06-17  
**Priority:** CRITICAL  
**Action Required:** Enable OIDC in Vercel dashboard NOW
