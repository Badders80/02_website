# 🚀 Quick Deploy Checklist

**Time Required:** 5 minutes  
**Do these steps NOW to unblock OAuth**

---

## Step 1: Add Firebase Config to Vercel (2 min)

1. **Go to:** https://vercel.com/dashboard
2. **Click:** Project `evolution-3-0`
3. **Navigate:** Settings → Environment Variables
4. **Add Variable:**
   - **Name:** `NEXT_PUBLIC_FIREBASE_CONFIG`
   - **Value:** `{"apiKey":"AIzaSyCjJfkdUIoZS-a3soi0MafZ8yfA4K-m8w0","authDomain":"evolution-engine.firebaseapp.com","projectId":"evolution-engine","storageBucket":"evolution-engine.firebasestorage.app","messagingSenderId":"851430309148","appId":"1:851430309148:web:41dd7c7e2be68539beced9"}`
   - **Environments:** ✅ ALL THREE (Dev, Preview, Prod)
5. **Save**

---

## Step 2: Redeploy Without Cache (1 min)

1. **Click:** Deployments tab
2. **Click:** ⋮ (three dots) on latest deployment
3. **Click:** Redeploy
4. **⚠️ UNCHECK:** "Use Build Cache"
5. **Click:** Redeploy (confirm)
6. **Wait:** 2-3 minutes

---

## Step 3: Test OAuth (2 min)

1. **Visit:** https://www.evolutionstables.nz
2. **Click:** Login (top right)
3. **Select:** Google account
4. **Verify:** Redirects back successfully
5. **Open:** Browser console (F12)
6. **Paste:** Contents of `test-oauth-browser.js`
7. **Check:** All tests pass ✅

---

## Expected Results

✅ Firebase config found  
✅ Handshake page accessible  
✅ User session active (shows your email)  
✅ Backend APIs responding (200 OK)

---

## If Something Fails

**No Firebase config?** → Re-add env variable, redeploy without cache  
**Login redirect error?** → Check Google Cloud Console authorized URIs  
**Backend APIs failing?** → Check GCP Cloud Function logs  
**403 on application submit?** → This is expected (see DEPLOYMENT_ACTION_PLAN.md)

---

## Full Documentation

- **Detailed steps:** DEPLOYMENT_ACTION_PLAN.md
- **OIDC setup:** VERCEL_OIDC_SETUP.md
- **Session log:** docs/logs/2026-06-17.md
- **Progress:** docs/PROGRESS.md

---

**After completion:** Continue with Horse Media Console or Stables page implementation
