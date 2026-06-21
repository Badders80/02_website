# 🔧 Environment Variables Setup

**Date:** 2026-06-17  
**Status:** ⚠️ Manual Setup Required in Vercel Dashboard

---

## Required Environment Variables

These variables **MUST** be added to Vercel for the site to work correctly:

### Critical (P0)

| Name | Value | Environments | Purpose |
|------|-------|--------------|---------|
| `NEXT_PUBLIC_FIREBASE_CONFIG` | `{"apiKey":"AIzaSyCjJfkdUIoZS-a3soi0MafZ8yfA4K-m8w0","authDomain":"evolution-engine.firebaseapp.com","projectId":"evolution-engine","storageBucket":"evolution-engine.firebasestorage.app","messagingSenderId":"851430309148","appId":"1:851430309148:web:41dd7c7e2be68539beced9"}` | Dev, Preview, Prod | Firebase Auth initialization |
| `NEXT_PUBLIC_API_BASE` | `https://australia-southeast1-evolution-engine.cloudfunctions.net` | Dev, Preview, Prod | Backend Cloud Functions URL |
| `NEXT_PUBLIC_APP_URL` | `https://www.evolutionstables.nz` | Dev, Preview, Prod | Stripe redirect URLs |

### Already Set ✅

| Name | Status | Purpose |
|------|--------|---------|
| `GOOGLE_CLIENT_ID` | ✅ Set | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | ✅ Set | Google OAuth |
| `NEXTAUTH_SECRET` | ✅ Set | NextAuth (legacy, can remove) |
| `NEXTAUTH_URL` | ✅ Set | NextAuth (legacy, can remove) |
| `VERCEL_OIDC_TOKEN` | ✅ Set | Vercel OIDC (if enabled) |

---

## How to Add Environment Variables

### Via Vercel Dashboard (Recommended)

1. **Go to:** https://vercel.com/baddeley0-2132s-projects/evolution-3-0
2. **Click:** Settings → Environment Variables
3. **For each variable above:**
   - Click "Add New Variable"
   - Enter Name and Value
   - Select **all three environments** (Development, Preview, Production)
   - Click "Save"
4. **Redeploy:** After adding variables, redeploy without cache

### Via Vercel CLI (Alternative)

```bash
cd /home/evo/evo_01/02_website

# Add Firebase config
vercel env add NEXT_PUBLIC_FIREBASE_CONFIG '{"apiKey":"AIzaSyCjJfkdUIoZS-a3soi0MafZ8yfA4K-m8w0","authDomain":"evolution-engine.firebaseapp.com","projectId":"evolution-engine","storageBucket":"evolution-engine.firebasestorage.app","messagingSenderId":"851430309148","appId":"1:851430309148:web:41dd7c7e2be68539beced9"}'

# Add API base URL
vercel env add NEXT_PUBLIC_API_BASE https://australia-southeast1-evolution-engine.cloudfunctions.net

# Add app URL
vercel env add NEXT_PUBLIC_APP_URL https://www.evolutionstables.nz
```

**Note:** The CLI will prompt you to select which environments to add to. Select all three.

---

## After Adding Variables

1. **Redeploy to Production:**
   - Go to Deployments tab
   - Click three dots (⋮) on latest deployment
   - Click "Redeploy"
   - **UNCHECK** "Use Build Cache"
   - Click "Redeploy"

2. **Wait 2-3 minutes** for deployment to complete

3. **Test:**
   - Visit https://www.evolutionstables.nz
   - Open browser console (F12)
   - Check for errors
   - Test login flow
   - Test backend API calls

---

## Verification Checklist

After redeployment, verify:

### Auth
- [ ] Can log in with Google
- [ ] Can log in with Email/Password
- [ ] Navbar shows user state (MyStable + Sign Out)
- [ ] Session persists on refresh

### Backend APIs
- [ ] Visit `/marketplace` - horses load
- [ ] Visit `/mystable` - dashboard loads
- [ ] No "fetch failed" errors in console
- [ ] Network tab shows 200 OK for API calls

### KYC/Stripe
- [ ] "Start Verification" button visible
- [ ] Clicking it redirects to Stripe
- [ ] Stripe test mode enabled

---

## Troubleshooting

### "Firebase not configured" error
**Cause:** `NEXT_PUBLIC_FIREBASE_CONFIG` not set  
**Fix:** Add the variable and redeploy

### "API error: 403" on backend calls
**Cause:** `NEXT_PUBLIC_API_BASE` not set OR WIF not working  
**Fix:** 
1. Add the variable
2. Verify Vercel OIDC is enabled
3. Check Cloud Function logs

### Stripe redirect fails
**Cause:** `NEXT_PUBLIC_APP_URL` not set  
**Fix:** Add the variable and redeploy

---

## Current Status

**Local (.env.local):** ✅ All variables set  
**Vercel Production:** ⚠️ Needs manual setup

**Variables added to Vercel:**
- ✅ `NEXT_PUBLIC_FIREBASE_CONFIG` (added 2026-06-17)
- ❌ `NEXT_PUBLIC_API_BASE` (needs to be added)
- ❌ `NEXT_PUBLIC_APP_URL` (needs to be added)

---

## Next Steps

1. **You:** Add missing variables via Vercel dashboard (5 minutes)
2. **You:** Redeploy without cache
3. **Me:** Test backend API connectivity
4. **Me:** Test KYC/Stripe flow

---

**Generated:** 2026-06-17  
**Session:** Verification Sprint - Phase 2
