/**
 * OAuth Flow Validation Script
 * 
 * This script tests the Google OAuth login flow for the Evolution Stables website.
 * Run this after deploying to Vercel with the Firebase config environment variable set.
 * 
 * Usage:
 *   npx ts-node test-oauth-flow.ts
 * 
 * Or in browser console on the deployed site:
 *   Copy/paste this code into the browser console on https://www.evolutionstables.nz
 */

// Configuration
const CONFIG = {
  productionUrl: 'https://www.evolutionstables.nz',
  handshakeUrl: 'https://www.evolutionstables.nz/handshake',
  adminUrl: 'https://www.evolutionstables.nz/admin',
};

// Test 1: Check Firebase Config
async function testFirebaseConfig() {
  console.log('🔍 Test 1: Checking Firebase Configuration...');
  
  try {
    const response = await fetch(`${CONFIG.handshakeUrl}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    const data = await response.json();
    
    if (data.firebase) {
      console.log('✅ Firebase config is present in the app');
      console.log('   Project ID:', data.firebase.projectId);
      return true;
    } else {
      console.error('❌ Firebase config is missing');
      console.error('   This means NEXT_PUBLIC_FIREBASE_CONFIG is not set in Vercel');
      return false;
    }
  } catch (error: any) {
    console.error('❌ Error checking Firebase config:', error);
    return false;
  }
}

// Test 2: Check Backend Connectivity
async function testBackendConnectivity() {
  console.log('\n🔗 Test 2: Checking Backend API Connectivity...');
  
  const endpoints = [
    { name: 'SSOT API', url: 'https://australia-southeast1-evolution-engine.cloudfunctions.net/ssot/health' },
    { name: 'Assets API', url: 'https://australia-southeast1-evolution-engine.cloudfunctions.net/assets/health' },
    { name: 'KYC API', url: 'https://australia-southeast1-evolution-engine.cloudfunctions.net/kyc/health' },
    { name: 'Applications API', url: 'https://australia-southeast1-evolution-engine.cloudfunctions.net/applications/health' },
  ];
  
  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      try {
        const response = await fetch(endpoint.url, { method: 'GET' });
        const status = response.ok ? '✅' : '⚠️';
        console.log(`   ${status} ${endpoint.name}: ${response.status}`);
        return { name: endpoint.name, status: response.status, ok: response.ok };
      } catch (error: any) {
        console.log(`   ❌ ${endpoint.name}: ${error.message}`);
        return { name: endpoint.name, status: 'ERROR', ok: false, error: error.message };
      }
    })
  );
  
  return results.filter(r => r.ok).length === results.length;
}

// Test 3: Check Authentication State
async function testAuthState() {
  console.log('\n🔐 Test 3: Checking Authentication State...');
  
  // This would need to be run in the browser context
  if (typeof window === 'undefined') {
    console.log('   ⚠️  Auth state check requires browser context');
    console.log('   Run this in your browser console on the deployed site:');
    console.log('   ```javascript');
    console.log('   import { auth } from "@/lib/firebase";');
    console.log('   import { onAuthStateChanged } from "firebase/auth";');
    console.log('   onAuthStateChanged(auth, (user) => {');
    console.log('     console.log("Auth state:", user ? "Logged in as " + user.email : "Not logged in");');
    console.log('   });');
    console.log('   ```');
    return null;
  }
  
  try {
    const { auth } = await import('@/lib/firebase');
    const { onAuthStateChanged } = await import('firebase/auth');
    
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log('✅ User is authenticated:', user.email);
          console.log('   UID:', user.uid);
          console.log('   Display Name:', user.displayName);
          console.log('   Photo URL:', user.photoURL);
          resolve(true);
        } else {
          console.log('ℹ️  No user is currently logged in');
          console.log('   Click "Login" to test Google OAuth');
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.error('❌ Error checking auth state:', error);
    return false;
  }
}

// Test 4: Test Token Exchange (WIF)
async function testTokenExchange() {
  console.log('\n🎫 Test 4: Testing WIF Token Exchange...');
  
  if (typeof window === 'undefined') {
    console.log('   ⚠️  Token exchange requires browser context');
    return null;
  }
  
  try {
    const response = await fetch('/api/auth/token');
    const data = await response.json();
    
    if (data.token) {
      console.log('✅ Successfully obtained GCP identity token');
      console.log('   Token length:', data.token.length);
      return true;
    } else {
      console.error('❌ Failed to obtain identity token');
      console.error('   Response:', data);
      return false;
    }
  } catch (error: any) {
    console.error('❌ Error in token exchange:', error);
    return false;
  }
}

// Test 5: Full OAuth Flow Simulation
async function testFullOAuthFlow() {
  console.log('\n🚀 Test 5: Full OAuth Flow Test...');
  console.log('   This test requires manual interaction:');
  console.log('   1. Navigate to:', CONFIG.productionUrl);
  console.log('   2. Click "Login" button');
  console.log('   3. Select Google account');
  console.log('   4. Verify redirect back to the site');
  console.log('   5. Check that user email is displayed');
  console.log('');
  console.log('   Expected flow:');
  console.log('   / → Click Login → /api/auth/signin/google → Google OAuth → /api/auth/callback → /');
  console.log('');
  return null;
}

// Main Test Runner
async function runAllTests() {
  console.log('🧪 Evolution Stables OAuth Flow Validation');
  console.log('==========================================');
  console.log('Production URL:', CONFIG.productionUrl);
  console.log('Date:', new Date().toISOString());
  console.log('');
  
  const results = {
    firebaseConfig: await testFirebaseConfig(),
    backendConnectivity: await testBackendConnectivity(),
    authState: await testAuthState(),
    tokenExchange: await testTokenExchange(),
    fullFlow: await testFullOAuthFlow(),
  };
  
  console.log('\n📊 Test Summary');
  console.log('==============');
  console.log('Firebase Config:', results.firebaseConfig ? '✅ PASS' : '❌ FAIL');
  console.log('Backend Connectivity:', results.backendConnectivity ? '✅ PASS' : '⚠️  PARTIAL');
  console.log('Auth State:', results.authState !== null ? '✅ CHECKED' : '⚠️  REQUIRES BROWSER');
  console.log('Token Exchange:', results.tokenExchange !== null ? '✅ CHECKED' : '⚠️  REQUIRES BROWSER');
  console.log('Full OAuth Flow:', '⚠️  MANUAL TEST REQUIRED');
  
  const allPassed = results.firebaseConfig && results.backendConnectivity;
  
  if (allPassed) {
    console.log('\n✅ Core infrastructure is ready!');
    console.log('   Next: Manually test the Google OAuth login flow');
  } else {
    console.log('\n❌ Some tests failed. Check the errors above.');
    console.log('   Common issues:');
    console.log('   - NEXT_PUBLIC_FIREBASE_CONFIG not set in Vercel');
    console.log('   - Backend APIs not accessible');
    console.log('   - CORS configuration issues');
  }
  
  return results;
}

// Export for module usage
export { runAllTests, testFirebaseConfig, testBackendConnectivity, testAuthState, testTokenExchange, testFullOAuthFlow };

// Auto-run if executed directly
if (typeof process !== 'undefined' && process.argv[1]?.includes('test-oauth-flow')) {
  runAllTests().catch(console.error);
}
