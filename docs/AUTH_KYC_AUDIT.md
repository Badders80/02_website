# 🔍 Authentication & KYC Verification Audit

**Date:** 2026-06-17  
**Status:** 🚨 Critical Issues Found  
**Priority:** Immediate Action Required

---

## Executive Summary

**Google OAuth:** ✅ Working (you successfully logged in)  
**NextAuth Session:** ❌ Broken (not persisting session)  
**KYC/Stripe Flow:** ⚠️ Partially Working (blocked by auth issues)  
**Navigation CTAs:** ⚠️ "Get Started" goes to login, not onboarding  
**Backend APIs:** ❌ All returning 403 (authentication required)

---

## Critical Issues (P0)

### 1. ❌ NextAuth Session Not Persisting

**Symptom:** 
- You logged in with Google successfully
- MyStable page shows `alex@evolutionstables.nz` (Firebase auth works)
- BUT `/api/auth/session` returns `{}` (empty session)
- Navbar still shows "Get Started" instead of user menu

**Root Cause:**
NextAuth is not properly configured to sync with Firebase auth state. The system has **two separate auth systems**:

1. **Firebase Auth** - Working (handles Google OAuth, stores user)
2. **NextAuth** - Broken (should manage session, but not syncing with Firebase)

**Impact:**
- User appears logged in Firebase but NextAuth doesn't know
- Protected routes may fail
- Session management is inconsistent

**Files Involved:**
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth config
- `src/lib/auth-context.tsx` - Firebase auth context
- `src/lib/firebase.ts` - Firebase initialization

**Fix Required:**
Either:
A. **Remove NextAuth entirely** and use only Firebase auth (recommended)
B. **Sync Firebase → NextAuth** after Google OAuth callback

---

### 2. ❌ Backend APIs All Returning 403

**Symptom:**
```bash
curl https://australia-southeast1-evolution-engine.cloudfunctions.net/ssot/health
# Returns: 403 Forbidden
```

**Root Cause:**
Cloud Functions require authentication but:
- Direct unauthenticated calls are blocked by GCP org policy
- WIF authentication is in place but may not be working correctly
- Next.js proxy routes (`/api/proxy/[...path]`) should handle this

**Impact:**
- Cannot fetch horses, HLTS, or any backend data
- MyStable dashboard shows "Failed to load dashboard statistics"
- KYC session creation will fail
- Marketplace cannot display real data

**Test Results:**
```
SSOT API:  403 Forbidden ❌
Assets API: 403 Forbidden ❌
KYC API:   403 Forbidden ❌
```

**Fix Required:**
1. Verify WIF is working on Vercel (check OIDC settings)
2. Test `/api/proxy/ssot/horses` endpoint through the website
3. Add proper error handling and user feedback

---

### 3. ⚠️ "Get Started" CTA Flow Confusion

**Current Behavior:**
- "Get Started" button → `/auth/login`
- Login page → Google OAuth or Email/Password
- After login → Redirects to homepage (no onboarding)

**Expected Flow:**
```
Get Started → Login/Signup → KYC Verification → Onboarding → Marketplace
```

**Issues:**
1. No clear onboarding flow after login
2. User lands on homepage with no guidance
3. KYC verification is hidden in MyStable
4. No progressive disclosure (what should user do next?)

**Fix Required:**
- Add post-login redirect to onboarding/KYC
- Make "Get Started" more prominent in user journey
- Add welcome modal or guided tour

---

## High Priority Issues (P1)

### 4. ⚠️ KYC/Stripe Flow Not Tested End-to-End

**Current State:**
- KYC page exists: `/auth/verify`
- "Start Verification" button → Calls `/api/kyc/create-session`
- Should redirect to Stripe Identity
- Returns to `/auth/verify?from=stripe` for status polling

**Unknowns:**
- ❓ Does `/api/kyc/create-session` work? (blocked by API 403)
- ❓ Does Stripe redirect work?
- ❓ Does status polling update correctly?
- ❓ Does Firestore get updated?

**Test Required:**
1. Fix backend API access first
2. Click "Start Verification" on MyStable
3. Complete Stripe Identity flow
4. Verify status updates to "verified"

---

### 5. ⚠️ Mock Data vs Real Data Confusion

**Current State:**
MyStable page has both:
- Mock data (for development)
- Real API calls (for production)

**Code:**
```typescript
const MOCK_HOLDING = { ... };
const MOCK_CAMPAIGN = { ... };

// Then later:
const holdings = await getHoldings(); // Real API call
```

**Issue:**
- `NEXT_PUBLIC_BYPASS_AUTH_KYC` flag controls mock behavior
- Unclear which mode production is running
- May be showing mock data when it should show real data

**Fix Required:**
- Remove mock data from production build
- Add clear loading states
- Better error handling when APIs fail

---

## Medium Priority Issues (P2)

### 6. ⚠️ Environment Variable Configuration

**Missing from Vercel:**
- `NEXTAUTH_URL` should be `https://www.evolutionstables.nz` (currently `http://localhost:3000`)
- `NEXT_PUBLIC_APP_URL` not set (needed for Stripe redirects)
- `PAYMENTS_API_BASE` not set (defaults to localhost)

**Impact:**
- Stripe redirects may go to wrong URL
- API calls may target wrong backend
- Auth callbacks may fail

---

### 7. ⚠️ Error Handling & User Feedback

**Current Issues:**
- "fetch failed" error shown to users (not user-friendly)
- No loading states on many components
- Error messages are technical, not actionable

**Examples:**
```
❌ "fetch failed"
✅ "Unable to connect to our servers. Please refresh the page or try again in a moment."

❌ "Failed to load dashboard statistics"
✅ "We're having trouble loading your dashboard. Your data is safe - please try refreshing."
```

---

## Authentication Flow Analysis

### Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│  User clicks "Get Started" → /auth/login                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  NextAuth + Google Provider                              │
│  - Handles OAuth callback                                │
│  - Creates JWT session                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Firebase Auth (parallel)                                │
│  - Also handles Google OAuth                             │
│  - Stores user in Firebase                               │
│  - Provides ID tokens for API calls                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Auth Context (auth-context.tsx)                         │
│  - Listens to Firebase auth state                        │
│  - Provides user, kycStatus, role to app                 │
│  - Does NOT sync with NextAuth session                   │
└─────────────────────────────────────────────────────────┘
```

### The Problem

**Two Auth Systems Running in Parallel:**
1. **NextAuth** - Manages session cookies, but doesn't integrate with Firebase
2. **Firebase Auth** - Manages users and tokens, but NextAuth doesn't know about it

**Result:**
- User logs in via Google → Firebase knows, NextAuth doesn't
- `/api/auth/session` returns empty (NextAuth has no session)
- But `useAuth()` hook works (Firebase has user)

---

## Recommended Architecture

### Option A: Firebase Auth Only (Recommended) ⭐

**Remove NextAuth entirely:**
- Use Firebase Auth for everything (Google OAuth, email/password, sessions)
- Firebase ID tokens for API authentication
- Simpler, single source of truth

**Changes Required:**
1. Remove `next-auth` dependency
2. Remove `/api/auth/[...nextauth]` routes
3. Update all auth checks to use `useAuth()` from Firebase
4. Add Firebase session persistence to localStorage

**Pros:**
- Single auth system (simpler)
- Firebase handles everything
- No sync issues
- Better Firebase integration

**Cons:**
- Need to refactor auth checks
- Lose NextAuth's session management (but Firebase provides same)

---

### Option B: Sync Firebase → NextAuth

**Keep both, but sync them:**
- After Firebase OAuth success, create NextAuth session
- NextAuth callbacks read from Firebase

**Changes Required:**
1. Update NextAuth `signIn` callback to check Firebase
2. Add Firebase custom claims to NextAuth session
3. Sync session on every page load

**Pros:**
- Keep NextAuth features
- Better for SSR

**Cons:**
- More complex
- Two systems to maintain
- Potential sync issues

---

## KYC/Stripe Flow Analysis

### Current Flow

```
User clicks "Start Verification"
         ↓
POST /api/kyc/create-session
  - user_id, email
  - Gets GCP identity token (WIF)
  - Forwards to Cloud Function
         ↓
Cloud Function: /kyc/create-session
  - Creates Stripe Identity session
  - Returns Stripe URL
         ↓
Redirect to Stripe
  - User completes identity verification
  - Stripe updates Firestore
  - Redirects back to /auth/verify?from=stripe
         ↓
Poll for status
  - Check Firestore every 3s
  - Update UI when status = "verified"
```

### Blockers

1. **Backend API Access** - `/api/kyc/create-session` can't reach Cloud Function (403)
2. **WIF Authentication** - May not be working on Vercel
3. **Stripe Environment** - Missing `PAYMENTS_API_BASE` and `NEXT_PUBLIC_APP_URL`

---

## Test Results Summary

| Component | Status | Notes |
|-----------|--------|-------|
| **Google OAuth Login** | ✅ Working | You successfully logged in |
| **Firebase Auth** | ✅ Working | User shows in MyStable |
| **NextAuth Session** | ❌ Broken | Returns empty `{}` |
| **Navbar Auth State** | ❌ Broken | Still shows "Get Started" |
| **Backend APIs (SSOT, Assets, KYC)** | ❌ 403 | Org policy blocks unauthenticated access |
| **WIF Authentication** | ⚠️ Unknown | Need to test through Next.js proxy |
| **KYC Session Creation** | ⚠️ Blocked | Depends on backend API fix |
| **Stripe Integration** | ⚠️ Config Missing | Environment variables not set |
| **MyStable Dashboard** | ❌ Error | "Failed to load dashboard statistics" |

---

## Immediate Action Plan

### Phase 1: Fix Authentication (30 min)

**Option A1: Remove NextAuth (Recommended)**
1. Remove `next-auth` from `package.json`
2. Delete `/api/auth/[...nextauth]` route
3. Update all imports to use Firebase auth only
4. Fix navbar to use Firebase auth state
5. Update "Get Started" flow

**Option A2: Fix NextAuth + Firebase Sync**
1. Update NextAuth config to sync with Firebase
2. Add session callback to include Firebase claims
3. Fix navbar to check both NextAuth and Firebase

---

### Phase 2: Fix Backend API Access (30 min)

1. **Check Vercel OIDC:**
   - Verify OpenID Connect is enabled in Vercel
   - Check WIF pool configuration

2. **Test Next.js Proxy:**
   - Call `/api/proxy/ssot/horses` through website
   - Check if WIF token is being sent

3. **Add Error Handling:**
   - User-friendly error messages
   - Loading states
   - Retry logic

---

### Phase 3: Test KYC Flow (20 min)

1. **Environment Variables:**
   - Add `NEXT_PUBLIC_APP_URL=https://www.evolutionstables.nz`
   - Add `PAYMENTS_API_BASE` (if needed)

2. **Test End-to-End:**
   - Click "Start Verification"
   - Complete Stripe Identity
   - Verify status updates

---

### Phase 4: Polish & UX (20 min)

1. **Fix "Get Started" Flow:**
   - Add post-login onboarding
   - Clear CTAs for next steps
   - Welcome modal for new users

2. **Error Messages:**
   - User-friendly copy
   - Actionable next steps
   - Better loading states

---

## Files Requiring Changes

### Critical (P0)
- `src/app/api/auth/[...nextauth]/route.ts` - Remove or fix
- `src/components/NavBar.tsx` - Fix auth state display
- `src/lib/auth-context.tsx` - Primary auth source
- `src/app/mystable/page.tsx` - Fix API calls + error handling
- `.env.local` - Add missing environment variables

### High (P1)
- `src/app/api/kyc/create-session/route.ts` - Add error handling
- `src/app/auth/verify/page.tsx` - Test KYC flow
- `src/lib/api.ts` - Add better error messages
- `src/components/KycBanner.tsx` - Fix visibility logic

### Medium (P2)
- `src/app/auth/login/page.tsx` - Improve UX
- `src/lib/usePurchaseFlow.ts` - Add error states
- `src/components/marketplace/PurchaseFormSandbox.tsx` - Error handling

---

## Questions to Answer

1. **Auth Strategy:** Remove NextAuth or sync with Firebase?
2. **Backend Access:** Is Vercel OIDC enabled? Is WIF working?
3. **Stripe Config:** What's the Payments API URL? Is Stripe test mode enabled?
4. **Mock Data:** Should production use mock data or real APIs only?

---

## Next Steps

**I recommend we:**

1. ✅ **Remove NextAuth** and use Firebase only (cleaner architecture)
2. ✅ **Fix backend API access** through Next.js proxy + WIF
3. ✅ **Test KYC flow** end-to-end
4. ✅ **Polish UX** with better error handling and onboarding

**Ready to execute fixes now!** Which approach should I take for authentication?

---

**Generated:** 2026-06-17  
**Session:** Verification Sprint  
**Status:** Awaiting decision on auth architecture
