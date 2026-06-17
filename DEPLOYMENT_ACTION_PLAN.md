# Deployment Action Plan — 2026-06-17

**Status:** 🟡 Manual Steps Required  
**Priority:** Critical (blocks OAuth and full functionality)

---

## 📋 Checklist

### ✅ Completed (Automated)
- [x] Website deployed to Vercel (www.evolutionstables.nz)
- [x] Applications Cloud Function deployed to GCP
- [x] Google OAuth login implemented
- [x] Firebase config added to `.env.local`
- [x] Test scripts created
- [x] Documentation updated

### ⏳ Pending (Manual — Do These Now)

#### 1. Add Firebase Config to Vercel (2 minutes)
**Why:** Required for Google OAuth to work in production

**Steps:**
1. Go to https://vercel.com/dashboard
2. Log in with your Vercel account
3. Click on project: **evolution-3-0**
4. Go to **Settings** → **Environment Variables**
5. Click **Add New Variable**
6. Fill in:
   - **Name:** `NEXT_PUBLIC_FIREBASE_CONFIG`
   - **Value:** 
   ```json
   {"apiKey":"AIzaSyCjJfkdUIoZS-a3soi0MafZ8yfA4K-m8w0","authDomain":"evolution-engine.firebaseapp.com","projectId":"evolution-engine","storageBucket":"evolution-engine.firebasestorage.app","messagingSenderId":"851430309148","appId":"1:851430309148:web:41dd7c7e2be68539beced9"}
   ```
   - **Environments:** ✅ Development ✅ Preview ✅ Production (select all)
7. Click **Save**

#### 2. Redeploy to Production (1 minute)
**Why:** Environment variables require redeployment to take effect

**Steps:**
1. In Vercel project dashboard, click **Deployments**
2. Click the **three dots** (⋮) on the latest deployment
3. Click **Redeploy**
4. ⚠️ **IMPORTANT:** Uncheck "Use Build Cache" (or select "Redeploy without cache")
5. Click **Redeploy** to confirm
6. Wait 2-3 minutes for deployment to complete

#### 3. Test OAuth Flow (3 minutes)
**Why:** Verify Google login works end-to-end

**Steps:**
1. Visit https://www.evolutionstables.nz
2. Click **Login** button (top right)
3. Select your Google account
4. Verify you're redirected back to the site
5. Check that your email/name is displayed
6. Open browser console (F12)
7. Paste the test script: `test-oauth-browser.js` (contents)
8. Verify all tests pass

**Expected Result:**
- ✅ Firebase config found
- ✅ Handshake page accessible
- ✅ NextAuth session active (shows your email)
- ✅ Backend APIs responding

---

### 🚧 Blocker: Cloud Function Authentication

**Issue:** GCP organization policy blocks `--allow-unauthenticated` flag

**Current State:**
- ✅ Cloud Function deployed and active
- ✅ WIF authentication infrastructure in place
- ✅ Frontend API routes (`/api/applications/submit`) include GCP identity tokens
- ⚠️ Direct unauthenticated calls to Cloud Function return 403

**Solution:** The system is **already designed to work with authentication**. The WIF flow is:

```
User → Frontend → Next.js API Route → GCP Identity Token → Cloud Function → Firestore
```

**Verification Steps:**
1. Complete steps 1-3 above (Firebase config + redeploy)
2. Test "Apply for Ownership" form on marketplace page
3. Check if application is submitted successfully
4. Verify in Firestore console that application document was created

**If Direct API Access is Needed:**
Option A: Request org policy exception from GCP admin  
Option B: Grant Vercel OIDC service account `cloudfunctions.invoker` role  
Option C: Use Cloud Run proxy (already deployed as `evolution-api-proxy`)

---

## 🧪 Testing Checklist

After completing manual steps above:

### Basic Functionality
- [ ] Homepage loads correctly
- [ ] Navigation works (all menu items)
- [ ] Marketplace page displays horses
- [ ] Press page shows articles
- [ ] Login/Logout works with Google OAuth

### Backend Integration
- [ ] Visit `/handshake` — verify backend connectivity indicators
- [ ] Click "Apply for Ownership" on a horse
- [ ] Fill out and submit application form
- [ ] Check browser console for success message
- [ ] Verify Firestore entry created (GCP Console → Firestore)

### Admin Dashboard
- [ ] Visit `/admin` (requires admin@evolutionstables.nz login)
- [ ] Check applications list displays
- [ ] Verify application details are correct

### Performance
- [ ] Run Lighthouse audit (target: 100 Performance, 100 SEO)
- [ ] Check page load time < 2 seconds
- [ ] Verify images are optimized

---

## 📝 Test Scripts Created

### 1. Node.js Test Script
**File:** `test-oauth-flow.ts`  
**Usage:** `npx ts-node test-oauth-flow.ts`  
**Purpose:** Automated testing of OAuth infrastructure

### 2. Browser Console Test
**File:** `test-oauth-browser.js`  
**Usage:** Copy/paste contents into browser console on deployed site  
**Purpose:** Real-time validation of OAuth flow in production

---

## 🔗 Reference Links

- **Vercel Dashboard:** https://vercel.com/baddeley0-2132s-projects/evolution-3-0
- **Production Site:** https://www.evolutionstables.nz
- **Preview Site:** https://evolution-3-0-k3wle9oyz-baddeley0-2132s-projects.vercel.app
- **GCP Console:** https://console.cloud.google.com
- **Vercel OIDC Setup:** VERCEL_OIDC_SETUP.md
- **Session Log:** docs/logs/2026-06-17.md

---

## 🆘 Troubleshooting

### Firebase Config Missing
**Symptom:** Login button doesn't work, console shows "Firebase not configured"  
**Fix:** Re-add `NEXT_PUBLIC_FIREBASE_CONFIG` to Vercel environment variables, redeploy without cache

### OAuth Redirect Error
**Symptom:** After Google login, returns error page  
**Fix:** Check that authorized redirect URIs in Google Cloud Console include:
- `https://www.evolutionstables.nz/api/auth/callback/google`
- `https://evolution-3-0-k3wle9oyz-baddeley0-2132s-projects.vercel.app/api/auth/callback/google`

### Application Submit Fails
**Symptom:** Form submission returns 403 or 500 error  
**Fix:** 
1. Check browser console for error details
2. Verify WIF is working (check `/api/auth/token` endpoint)
3. Check Cloud Function logs in GCP Console

### Handshake Page Shows Red Indicators
**Symptom:** `/handshake` page shows backend connectivity issues  
**Fix:**
1. Verify all Cloud Functions are deployed and active
2. Check service account has correct IAM roles
3. Review Cloud Function logs for errors

---

## ✅ Success Criteria

All of the following must be true:

1. ✅ Can log in with Google OAuth
2. ✅ Firebase config is loaded (verified via browser console test)
3. ✅ Backend APIs are accessible (handshake page shows green)
4. ✅ Can submit ownership application successfully
5. ✅ Application appears in Firestore
6. ✅ Admin dashboard shows applications
7. ✅ Lighthouse score ≥ 90 Performance, 100 SEO

---

**Next Session:** Once all manual steps are complete and tests pass, continue with:
- Horse Media Console (admin panel)
- Data sync implementation
- Stables page with real data
- MyStable dashboard
