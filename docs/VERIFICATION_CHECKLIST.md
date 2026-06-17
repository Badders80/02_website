# 🔍 Post-Deployment Verification Checklist

**Date:** 2026-06-17  
**Trigger:** Redeploy with environment variables  
**Commit:** `c672835` - "chore: trigger redeploy with env vars"

---

## ✅ Test 1: Navbar Auth State

**What to Test:**  
Navbar should show user menu when logged in (NOT "Get Started")

**Steps:**
1. Visit https://www.evolutionstables.nz
2. Login with Google OAuth (alex@evolutionstables.nz)
3. Check navbar

**Expected Result:**
- ✅ Shows "MyStable" + "Sign Out" dropdown
- ✅ Shows user email in dropdown

**Failed Result:**
- ❌ Shows "GET STARTED" button (auth state not syncing)

**Fix If Failed:**
- Check browser console for Firebase errors
- Verify `NEXT_PUBLIC_FIREBASE_CONFIG` is correct
- Check if AuthProvider is wrapping the app in `src/app/layout.tsx`

---

## ✅ Test 2: KYC Flow

**What to Test:**  
KYC "Start Verification" button should create Stripe session (no 404)

**Steps:**
1. Visit https://www.evolutionstables.nz/mystable
2. Login with Google OAuth
3. Find "Identity Verification" section
4. Click "Start Verification"

**Expected Result:**
- ✅ Redirects to Stripe Identity verification
- ✅ Shows Stripe URL with verification form

**Failed Result:**
- ❌ Shows "API error: 404"
- ❌ Shows "Failed to create KYC session"

**Fix If Failed:**
- Check Vercel deployment logs for errors
- Verify Cloud Function `/kyc/create-session` is deployed
- Test Cloud Function directly: `curl https://australia-southeast1-evolution-engine.cloudfunctions.net/kyc/create-session -X POST -H "Content-Type: application/json" -d '{"user_id":"test","email":"test@test.com"}'`

---

## ✅ Test 3: Backend API Calls

**What to Test:**  
Marketplace and MyStable should load data from backend

**Steps:**
1. Visit https://www.evolutionstables.nz/marketplace
2. Check if horses load
3. Visit https://www.evolutionstables.nz/mystable
4. Check if dashboard statistics load

**Expected Result:**
- ✅ Marketplace shows horses
- ✅ MyStable shows holdings, HLTS, content
- ✅ No "Failed to load" errors

**Failed Result:**
- ❌ Shows "Failed to load dashboard statistics"
- ❌ Shows "Failed to fetch" errors

**Fix If Failed:**
- Check browser DevTools → Network tab
- Look for failed API calls
- Verify `NEXT_PUBLIC_API_BASE` is correct
- Check Cloud Function logs in GCP

---

## ✅ Test 4: Environment Variables

**What to Verify:**  
All required env vars are set in Vercel

**Required Variables:**
```
NEXT_PUBLIC_API_BASE = https://australia-southeast1-evolution-engine.cloudfunctions.net
NEXT_PUBLIC_APP_URL = https://www.evolutionstables.nz
NEXT_PUBLIC_FIREBASE_CONFIG = {"apiKey":"AIzaSyCjJfkdUIoZS-a3soi0MafZ8yfA4K-m8w0",...}
```

**Check Here:**
https://vercel.com/baddeley0-2132s-projects/evolution-3-0/settings/environment-variables

**Should Show:**
- ✅ All three variables exist
- ✅ Set for "Production and Preview" environments
- ✅ Values match above

---

## ✅ Test 5: Auth Flow End-to-End

**What to Test:**  
Complete login → dashboard → logout flow

**Steps:**
1. Visit https://www.evolutionstables.nz
2. Click "Login" (should be in navbar)
3. Login with Google OAuth
4. Should redirect to /mystable
5. Click "Sign Out"
6. Should redirect to homepage

**Expected Result:**
- ✅ Login works
- ✅ Redirects to MyStable
- ✅ User data loads
- ✅ Logout works
- ✅ Navbar updates on all state changes

---

## 🐛 Troubleshooting Guide

### Issue: Navbar Still Shows "Get Started"

**Possible Causes:**
1. Firebase config not loaded
2. AuthProvider not wrapping app
3. Browser cache showing old version

**Debug Steps:**
```javascript
// Open browser console on homepage
console.log('Firebase config:', process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
// Should show full config object

// Check auth state
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
onAuthStateChanged(auth, (user) => {
  console.log('User:', user?.email || 'Not logged in');
});
```

**Fix:**
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache
- Check incognito mode

---

### Issue: KYC Still Returns 404

**Possible Causes:**
1. Cloud Function not deployed
2. Cloud Function URL wrong
3. IAM permissions issue

**Debug Steps:**
```bash
# Test Cloud Function directly
curl -X POST https://australia-southeast1-evolution-engine.cloudfunctions.net/kyc/create-session \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","email":"test@test.com"}'

# Expected: 403 (needs auth token)
# If 404: Cloud Function doesn't exist
```

**Fix:**
- Deploy Cloud Function: `cd /home/evo/evo_01/01_evolution/api/kyc && gcloud functions deploy kyc`
- Check GCP logs: https://console.cloud.google.com/logs

---

### Issue: Backend APIs Return 403

**Possible Causes:**
1. Missing GCP identity token
2. WIF not configured in Vercel
3. Cloud Run proxy not set up

**Debug Steps:**
- Check Vercel deployment logs
- Look for "Failed to get GCP identity token" errors

**Fix:**
- Verify Workload Identity Federation is configured
- Check `src/lib/gcp-auth.ts` for proper implementation

---

## 📊 Success Criteria

All tests must pass:
- [ ] ✅ Navbar shows user menu when logged in
- [ ] ✅ KYC flow redirects to Stripe
- [ ] ✅ Marketplace loads horses
- [ ] ✅ MyStable loads dashboard data
- [ ] ✅ Auth flow works end-to-end
- [ ] ✅ No console errors

---

##  Next Steps After Verification

If all tests pass:
1. Update `docs/PROGRESS.md` with verification results
2. Remove old NextAuth env vars from Vercel (NEXTAUTH_SECRET, NEXTAUTH_URL, etc.)
3. Test on mobile devices
4. Run Lighthouse audit
5. Prepare for production launch

If tests fail:
1. Document which tests failed
2. Check error messages in browser console
3. Review Vercel deployment logs
4. Check GCP Cloud Function logs
5. Fix and redeploy

---

**Generated:** 2026-06-17  
**Status:** Waiting for deployment to complete
