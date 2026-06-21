# 🐛 KYC API 404 Fix - 2026-06-17

## Issue Discovered

**Symptom:** KYC "Start Verification" button returned `{"error":"API error: 404"}`

**Root Cause:** Incorrect API endpoint path in `src/app/api/kyc/create-session/route.ts`

### The Bug

```typescript
// BEFORE (WRONG)
const KYC_API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8082';
// ...
const response = await fetch(`${KYC_API_BASE}/create-session`, {...})

// This resolved to:
// https://australia-southeast1-evolution-engine.cloudfunctions.net/create-session
// ❌ Missing /kyc path!
```

### The Fix

```typescript
// AFTER (CORRECT)
const KYC_API_BASE = `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8082'}/kyc`;
// ...
const response = await fetch(`${KYC_API_BASE}/create-session`, {...})

// This resolves to:
// https://australia-southeast1-evolution-engine.cloudfunctions.net/kyc/create-session
// ✅ Correct endpoint!
```

## Why This Happened

The `NEXT_PUBLIC_API_BASE` environment variable is:
```
https://australia-southeast1-evolution-engine.cloudfunctions.net
```

But the Cloud Functions are organized with sub-paths:
- `/ssot` - SSOT API
- `/assets` - Assets API  
- `/kyc` - KYC API ← This was missing!
- `/applications` - Applications API

The route was calling `/create-session` directly instead of `/kyc/create-session`.

## Files Changed

- `src/app/api/kyc/create-session/route.ts` - Fixed KYC_API_BASE constant

## Deployment

**Commit:** `cce930c` - "fix: correct KYC API endpoint path"  
**Branch:** 22May  
**Status:** Deployed to Vercel (waiting for build to complete)

## Testing Plan

Once deployment completes (~3-5 minutes):

1. Visit https://www.evolutionstables.nz/mystable
2. Login with Google OAuth
3. Click "Start Verification"
4. Should redirect to Stripe Identity (no 404!)

## Related Issues

This fix addresses one of two critical bugs:

- ✅ **FIXED:** KYC API returns 404
- ⏳ **PENDING:** Navbar shows "Get Started" when logged in (waiting for auth state sync)

## Next Steps

After KYC is verified working:
1. Test complete KYC flow (Stripe verification → callback → status update)
2. Investigate navbar auth state issue
3. Remove old NextAuth environment variables from Vercel
4. Run full test suite

---

**Generated:** 2026-06-17  
**Status:** Fix deployed, waiting for Vercel build
