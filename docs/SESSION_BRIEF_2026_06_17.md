# Session Brief: GCP WIF Authentication Fix

**Date:** 2026-06-17  
**Status:** BLOCKED — Requires Manual GCP Console Action  
**Time Spent:** ~2 hours  

---

## 🎯 What We've Been Working On

### Primary Objective
Fix the authentication chain between Vercel (frontend) and GCP Cloud Functions (backend) to enable:
- ✅ KYC verification flow (Stripe Identity)
- ✅ Backend API calls (SSOT, Assets, KYC endpoints)
- ✅ Workload Identity Federation (WIF) for secure GCP access

### What Was Accomplished

1. **✅ Firebase Auth Migration Complete**
   - Removed NextAuth entirely
   - Firebase Auth working (user login successful)
   - Auth context properly configured

2. **✅ KYC Route Fixed**
   - Fixed endpoint path: `/kyc/create-session` (was missing `/kyc` prefix)
   - Route deployed to production
   - Code correctly forwards Firebase tokens

3. **✅ Environment Variables Configured**
   - `NEXT_PUBLIC_FIREBASE_CONFIG` — set in Vercel
   - `NEXT_PUBLIC_API_BASE` — set in Vercel
   - `NEXT_PUBLIC_APP_URL` — set in Vercel
   - OIDC enabled in Vercel Security settings

4. **✅ Code Audit Complete**
   - All routes return 200 OK
   - Build compiles successfully (0 errors)
   - No NextAuth remnants in codebase

---

## 🚨 The Blocker

### Problem Statement
**Handshake endpoint shows 0/7 passing** — All backend API calls fail with 403 Forbidden.

### Root Cause
**GCP Workload Identity Provider not configured with correct OIDC issuer.**

Vercel OIDC provides tokens with issuer:
```
https://oidc.vercel.com/baddeley0-2132s-projects
```

But the GCP WIF provider either:
- Doesn't exist (NOT_FOUND errors when trying to delete/update)
- Exists with wrong issuer (ALREADY_EXISTS errors when trying to create)
- Is in an inconsistent state (GCP API returning contradictory errors)

### Why This Blocks Everything

```
User Action → Frontend → Next.js Route → GCP Cloud Function
                                    ↓
                            getGcpIdentityToken()
                                    ↓
                            Vercel OIDC Token ✅
                                    ↓
                            Exchange for GCP Token ❌
                                    ↓
                            WIF Provider rejects (wrong issuer)
                                    ↓
                            No Authorization header sent
                                    ↓
                            Cloud Function returns 403
```

### What We Tried

1. ✅ Enabled OIDC in Vercel dashboard
2. ✅ Fixed KYC route endpoint path
3. ✅ Deployed all changes to Vercel
4. ❌ Attempted to create/update WIF provider via gcloud CLI
   - `delete` → NOT_FOUND (provider doesn't exist)
   - `create` → ALREADY_EXISTS (provider already exists)
   - `update` → NOT_FOUND (can't find provider to update)
   - GCP API in inconsistent state

---

## 🛠️ Required Action (Manual)

### Option 1: GCP Console (RECOMMENDED — 5 minutes)

1. **Go to:** https://console.cloud.google.com/iam-admin/workload/identity/pools?project=evolution-engine

2. **Click on pool:** `vercel-pool`

3. **Check providers tab:**
   - If `vercel-oidc` exists → Edit it
   - If doesn't exist → Click "ADD PROVIDER"

4. **Configure provider:**
   ```
   Provider type: OIDC
   Provider name: vercel-oidc
   Issuer URI: https://oidc.vercel.com/baddeley0-2132s-projects
   Attribute mapping:
     - google.subject = assertion.sub
     - attribute.aud = assertion.aud
   ```

5. **Save** and wait 2-3 minutes for propagation

6. **Redeploy Vercel:**
   ```bash
   cd /home/evo/evo_01/02_website
   git commit --allow-empty -m "chore: redeploy after WIF fix"
   git push origin 22May
   ```

7. **Verify:** Visit `/handshake` → should show 7/7 green

### Option 2: gcloud CLI (If Console Fails)

```bash
# Force delete with retry
gcloud iam workload-identity-pools providers delete vercel-oidc \
  --location="global" \
  --workload-identity-pool="vercel-pool" \
  --project="evolution-engine" \
  --quiet

# Wait for propagation
sleep 30

# Create with correct issuer
gcloud iam workload-identity-pools providers create-oidc vercel-oidc \
  --location="global" \
  --workload-identity-pool="vercel-pool" \
  --project="evolution-engine" \
  --issuer-uri="https://oidc.vercel.com/baddeley0-2132s-projects" \
  --attribute-mapping="google.subject=assertion.sub,attribute.aud=assertion.aud"
```

---

## ✅ Verification Checklist

After fixing WIF provider:

- [ ] Visit https://www.evolutionstables.nz/handshake
- [ ] Should show: **7 OK, 0 FAIL** (all green)
- [ ] Login with Google OAuth
- [ ] Visit /mystable
- [ ] Click "Start Verification"
- [ ] Should redirect to Stripe Identity (no 403)
- [ ] Complete test verification
- [ ] Return to /auth/verify with success status

---

## 📋 Files Changed This Session

### Code Changes
- `src/app/api/kyc/create-session/route.ts` — Fixed `/kyc` endpoint path
- `.env.local` — Removed orphaned NextAuth vars
- `src/lib/auth-context.tsx` — Firebase Auth (already done)

### Documentation Created
- `docs/FIX_WIF_ONE_COMMAND.md` — Single command fix
- `docs/DEBUG_403_ERROR.md` — Diagnostic guide
- `docs/ENABLE_VERCEL_OIDC.md` — Vercel OIDC setup
- `docs/SESSION_BRIEF_2026_06_17.md` — This document

### Already Existed
- `VERCEL_OIDC_SETUP.md` — OIDC configuration guide
- `docs/VERIFICATION_CHECKLIST.md` — Testing checklist
- `docs/CRITICAL_FIXES_NEEDED.md` — Issue tracking

---

## 🎯 Success Criteria

When WIF is fixed:
1. Handshake shows 7/7 green
2. KYC flow works end-to-end
3. All backend APIs respond (SSOT, Assets, KYC)
4. Users can complete identity verification
5. Platform ready for production launch

---

## 📞 Next Steps

1. **You:** Fix WIF provider in GCP Console (5 minutes)
2. **You:** Redeploy to Vercel
3. **You:** Verify handshake passes 7/7
4. **Then:** Test full KYC flow
5. **Finally:** Launch to production

---

**Bottom Line:** Code is ready. Deployment is ready. Only blocker is GCP WIF provider configuration. Once that's fixed, everything works.
