# 🧪 Automated Testing Suite

**Date:** 2026-06-17  
**Status:** Ready to Execute  
**Coverage:** Auth, Backend APIs, User Journeys

---

## Available Tests

### 1. Browser Console Test (Manual)
**File:** `test-oauth-browser.js`  
**Usage:** Copy/paste into browser console on production site  
**Tests:**
- Firebase config loaded
- Backend connectivity
- Auth session state
- Token exchange

**Run:**
```javascript
// Open browser console on https://www.evolutionstables.nz
// Paste entire contents of test-oauth-browser.js
// Press Enter
```

---

### 2. Node.js Test Script (Automated)
**File:** `test-oauth-flow.ts`  
**Usage:** Run from terminal  
**Tests:**
- Firebase configuration
- Backend API health
- Auth state (requires browser)
- Token exchange (requires browser)
- Full OAuth flow

**Run:**
```bash
cd /home/evo/evo_01/02_website
npx ts-node test-oauth-flow.ts
```

---

### 3. Build Verification (Automated)
**Command:** `npm run build`  
**Tests:**
- TypeScript compilation
- No unused imports
- No type errors
- Production build succeeds

**Run:**
```bash
cd /home/evo/evo_01/02_website
npm run build
```

**Expected Output:**
```
✓ Compiled successfully
✓ Type checking passed
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

---

### 4. API Endpoint Tests (Automated)

**Script:** Run these curl commands:

```bash
# Test homepage loads
curl -sI https://www.evolutionstables.nz | grep "HTTP"

# Test marketplace page
curl -s https://www.evolutionstables.nz/marketplace | grep -i "error" | wc -l
# Expected: 0 errors

# Test MyStable page
curl -s https://www.evolutionstables.nz/mystable | grep -i "error\|failed" | wc -l
# Expected: 0 errors

# Test handshake page
curl -s https://www.evolutionstables.nz/handshake | grep -c "OK"
# Expected: 7 (all endpoints)
```

---

### 5. User Journey Tests (Manual + Automated)

#### Journey 1: New User Signup ✅
**Automated Checks:**
```bash
# Verify login page exists
curl -sI https://www.evolutionstables.nz/auth/login | grep "HTTP"
# Expected: 200 OK
```

**Manual Steps:**
1. Visit https://www.evolutionstables.nz
2. Click "Get Started"
3. Click "Continue with Google"
4. Select Google account
5. Verify redirect to /mystable
6. Check navbar shows user menu

**Expected Result:** ✅ User logged in, navbar updated

---

#### Journey 2: Email/Password Login ✅
**Automated Checks:**
```bash
# Check Firebase config in page source
curl -s https://www.evolutionstables.nz | grep -o "NEXT_PUBLIC_FIREBASE_CONFIG" | wc -l
# Expected: 1 (config present)
```

**Manual Steps:**
1. Visit /auth/login
2. Enter email/password
3. Click "Sign In"
4. Verify redirect to /mystable

**Expected Result:** ✅ Firebase validates, user logged in

---

#### Journey 3: Logout ✅
**Automated Checks:**
```bash
# Verify sign out function exists in code
grep -r "signOut" src/lib/auth-context.tsx | wc -l
# Expected: 2 (import + implementation)
```

**Manual Steps:**
1. While logged in, click "Sign Out" in navbar
2. Verify page reloads
3. Check navbar shows "Get Started"
4. Visit /mystable → should redirect to login

**Expected Result:** ✅ Session cleared, navbar updated

---

#### Journey 4: KYC Verification ⏳
**Automated Checks:**
```bash
# Verify KYC page exists
curl -sI https://www.evolutionstables.nz/auth/verify | grep "HTTP"
# Expected: 200 OK

# Check KYC API route exists
ls -la src/app/api/kyc/create-session/route.ts
# Expected: File exists
```

**Manual Steps:**
1. Visit /mystable while logged in
2. Click "Start Verification"
3. Should redirect to Stripe Identity
4. Complete test verification
5. Return to /auth/verify?from=stripe
6. Status should poll and update

**Expected Result:** ⏳ Needs testing (Stripe integration)

---

#### Journey 5: Marketplace Browse ⏳
**Automated Checks:**
```bash
# Verify marketplace page exists
curl -sI https://www.evolutionstables.nz/marketplace | grep "HTTP"
# Expected: 200 OK

# Check API proxy route
ls -la src/app/api/proxy/\[...path\]/route.ts
# Expected: File exists
```

**Manual Steps:**
1. Visit /marketplace
2. Should load horses from backend
3. Click on a horse
4. Should show detail page

**Expected Result:** ⏳ Needs backend API verification

---

## Test Coverage Summary

| Test Category | Automated | Manual | Status |
|---------------|-----------|--------|--------|
| **Auth Migration** | ✅ Build test | ✅ Login flows | ✅ Complete |
| **Backend APIs** | ✅ Endpoint checks | ⏳ Data loading | ⏳ Pending |
| **User Journeys** | ✅ Route checks | ✅ Full flows | ⏳ Partial |
| **KYC/Stripe** | ✅ Route exists | ⏳ End-to-end | ⏳ Pending |
| **Error Handling** | ⚠️ Basic | ⏳ User-facing | ⏳ Pending |

---

## Quick Test Commands

### Full Automated Suite
```bash
cd /home/evo/evo_01/02_website

# 1. Build test
npm run build

# 2. Check for errors
npm run build 2>&1 | grep -E "error|Error" | wc -l
# Expected: 0

# 3. Test production endpoints
curl -sI https://www.evolutionstables.nz | grep "HTTP"
curl -sI https://www.evolutionstables.nz/marketplace | grep "HTTP"
curl -sI https://www.evolutionstables.nz/mystable | grep "HTTP"
curl -sI https://www.evolutionstables.nz/auth/login | grep "HTTP"
curl -sI https://www.evolutionstables.nz/handshake | grep "HTTP"

# 4. Check for NextAuth remnants (should be 0)
grep -r "next-auth" src/ --include="*.ts" --include="*.tsx" | wc -l
# Expected: 0
```

### Manual Test Checklist
```markdown
## Authentication
- [ ] Google OAuth login works
- [ ] Email/password login works
- [ ] Session persists on refresh
- [ ] Logout clears session
- [ ] Navbar shows correct state

## Navigation
- [ ] All navbar links work
- [ ] "Get Started" button visible when logged out
- [ ] User menu visible when logged in
- [ ] Protected routes redirect correctly

## Backend Integration
- [ ] Marketplace loads horses
- [ ] MyStable loads dashboard
- [ ] No "fetch failed" errors
- [ ] Network tab shows 200 OK

## KYC/Stripe
- [ ] "Start Verification" button visible
- [ ] Redirects to Stripe
- [ ] Test verification completes
- [ ] Status updates to "verified"
```

---

## Test Results Template

After running tests, fill in:

```markdown
## Test Execution - YYYY-MM-DD

**Tester:** [Your name]
**Environment:** Production
**Date:** YYYY-MM-DD

### Automated Tests
- Build: ✅ PASS / ❌ FAIL
- API Endpoints: ✅ PASS / ❌ FAIL
- No NextAuth remnants: ✅ PASS / ❌ FAIL

### Manual Tests
- Google OAuth: ✅ PASS / ❌ FAIL
- Email Login: ✅ PASS / ❌ FAIL
- Logout: ✅ PASS / ❌ FAIL
- Navbar State: ✅ PASS / ❌ FAIL
- Marketplace: ✅ PASS / ❌ FAIL
- MyStable: ✅ PASS / ❌ FAIL
- KYC Flow: ✅ PASS / ❌ FAIL / ⏳ Not Tested

### Issues Found
1. [Description]
2. [Description]

### Overall Status
🟢 Ready for production / 🟡 Minor issues / 🔴 Critical issues
```

---

## Next Steps

1. **Run automated tests** (5 min)
   ```bash
   cd /home/evo/evo_01/02_website
   npm run build
   ```

2. **Run manual tests** (15 min)
   - Open https://www.evolutionstables.nz
   - Follow manual test checklist above

3. **Document results** (5 min)
   - Fill in test results template
   - Commit to docs/TEST_RESULTS.md

4. **Fix any issues** (as needed)
   - Prioritize critical issues
   - Document fixes

---

**Generated:** 2026-06-17  
**Ready to Execute:** Yes  
**Estimated Time:** 25 minutes total
