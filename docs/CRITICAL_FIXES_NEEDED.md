# 🚨 Critical Issues Found - 2026-06-17

**Status:** Requires Immediate Action  
**Severity:** HIGH - Blocks core functionality

---

## Issues Identified

### 1. ❌ Navbar Shows "Get Started" When Logged In

**Symptom:** User is logged in (alex@evolutionstables.nz) but navbar still shows "Get Started" button instead of user menu.

**Root Cause:** 
- Firebase Auth is working (user is logged in)
- BUT the navbar's `useAuth()` hook may not be getting the user state correctly
- Likely cause: Auth context provider wrapping issue OR Firebase not initialized properly in production

**Impact:** 
- Users can't see they're logged in
- No access to logout functionality
- Poor UX

**Files Involved:**
- `src/components/NavBar.tsx` (lines 30-35)
- `src/lib/auth-context.tsx` (AuthProvider)
- `src/app/layout.tsx` (provider wrapping)

---

### 2. ❌ KYC API Returns 404 Error

**Symptom:** Clicking "Start Verification" shows "API error: 404"

**Root Cause:**
The `/api/kyc/create-session` route exists but is trying to call the backend Cloud Function which doesn't have a `/create-session` endpoint, OR the Cloud Function URL is wrong.

**Investigation:**
```bash
curl https://www.evolutionstables.nz/api/kyc/create-session
# Returns: {"error":"API error: 404"}
```

**Expected Flow:**
```
Frontend → /api/kyc/create-session (Next.js route)
         → https://australia-southeast1-evolution-engine.cloudfunctions.net/kyc/create-session
         → Should return Stripe URL
```

**Actual Issue:**
The Cloud Function at `/kyc/create-session` either:
1. Doesn't exist
2. Returns 404
3. Environment variable `NEXT_PUBLIC_API_BASE` not set correctly in Vercel

---

## Immediate Fixes Required

### Fix #1: Verify Vercel Environment Variables

**Action Required:**
1. Go to https://vercel.com/baddeley0-2132s-projects/evolution-3-0/settings/environment-variables
2. Verify these variables exist and are set for **ALL** environments (Production, Preview, Development):

```
NEXT_PUBLIC_API_BASE = https://australia-southeast1-evolution-engine.cloudfunctions.net
NEXT_PUBLIC_APP_URL = https://www.evolutionstables.nz
NEXT_PUBLIC_FIREBASE_CONFIG = {"apiKey":"AIzaSyCjJfkdUIoZS-a3soi0MafZ8yfA4K-m8w0",...}
```

3. If any are missing, add them
4. Click "Save"

---

### Fix #2: Redeploy to Vercel

**After verifying environment variables:**

1. Go to https://vercel.com/baddeley0-2132s-projects/evolution-3-0/deployments
2. Find the latest deployment
3. Click the three dots (⋮)
4. Click **"Redeploy"**
5. ⚠️ **IMPORTANT:** Uncheck "Use Build Cache"
6. Click "Redeploy" to confirm
7. Wait 3-5 minutes for deployment to complete

**Why This Fixes It:**
- Rebuilds the app with correct environment variables
- Ensures Firebase config is baked into the build
- Refreshes all API routes

---

### Fix #3: Verify Backend Cloud Functions

**After redeployment, test:**

1. **Test KYC Cloud Function directly:**
```bash
curl -X POST https://australia-southeast1-evolution-engine.cloudfunctions.net/kyc/create-session \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","email":"test@test.com"}'
```

**Expected:** Should return a Stripe URL or error message (not 404)  
**If 404:** The Cloud Function needs to be redeployed

2. **Test via Next.js proxy:**
```bash
curl -X POST https://www.evolutionstables.nz/api/kyc/create-session \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","email":"test@test.com"}'
```

**Expected:** Should return Stripe URL or proper error

---

### Fix #4: Debug Auth State in Browser

**After redeployment, test:**

1. Open https://www.evolutionstables.nz
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Run this test:

```javascript
// Check if Firebase is initialized
console.log('Firebase config:', process.env.NEXT_PUBLIC_FIREBASE_CONFIG);

// Check auth state
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
  console.log('Auth state:', user ? 'Logged in as ' + user.email : 'Not logged in');
});
```

**Expected:** Should show you're logged in as alex@evolutionstables.nz  
**If not:** Firebase auth not initializing correctly

---

## Testing Checklist

After all fixes:

### Navbar Test
- [ ] Visit homepage while logged in
- [ ] Navbar should show "MyStable" + "Sign Out" (NOT "Get Started")
- [ ] Click "Sign Out" → should logout and show "Get Started"
- [ ] Login again → navbar should update

### KYC Test
- [ ] Visit /mystable while logged in
- [ ] Click "Start Verification"
- [ ] Should redirect to Stripe Identity (no 404 error)
- [ ] Complete test verification
- [ ] Should return to /auth/verify with status

### Backend API Test
- [ ] Visit /marketplace
- [ ] Should load horses (no "fetch failed" error)
- [ ] Open DevTools → Network tab
- [ ] Check for 200 OK on API calls

---

## Root Cause Analysis

### Why This Happened

1. **Environment Variables Not Propagated:**
   - Added to Vercel dashboard but build didn't pick them up
   - Need to redeploy WITHOUT cache to force rebuild

2. **Auth State Not Syncing:**
   - Firebase config not available at build time
   - AuthProvider can't initialize without config
   - Navbar's useAuth() hook returns null user

3. **Backend API 404:**
   - Cloud Function may not be deployed
   - OR environment variable pointing to wrong URL
   - OR Cloud Function has different endpoint path

---

## Next Steps

**Immediate (Do Now - 10 minutes):**

1. ✅ Verify Vercel environment variables
2. ✅ Redeploy without cache
3. ✅ Wait for deployment to complete
4. ✅ Test navbar state
5. ✅ Test KYC flow

**If Still Broken:**

1. Check GCP Cloud Functions console
2. Verify `/kyc/create-session` endpoint exists
3. Check Cloud Function logs for errors
4. May need to redeploy Cloud Functions

---

## Contact Info

If issues persist after redeployment:
- Check Vercel deployment logs: https://vercel.com/baddeley0-2132s-projects/evolution-3-0/deployments
- Check GCP Cloud Function logs: https://console.cloud.google.com/logs
- Check Firebase Console: https://console.firebase.google.com/project/evolution-engine

---

**Generated:** 2026-06-17  
**Priority:** CRITICAL  
**Action:** Redeploy to Vercel immediately
