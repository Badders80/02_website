/**
 * Browser Console Test Script
 * 
 * Paste this directly into your browser console on https://www.evolutionstables.nz
 * to test the OAuth flow in real-time.
 */

(async function testOAuthFlow() {
  console.clear();
  console.log('🧪 Evolution Stables OAuth Flow Test');
  console.log('====================================');
  console.log('Running on:', window.location.href);
  console.log('Date:', new Date().toISOString());
  console.log('');
  
  // Test 1: Check if Firebase config exists
  console.log('🔍 Test 1: Firebase Configuration');
  const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
  
  if (firebaseConfig) {
    console.log('✅ Firebase config found');
    try {
      const config = JSON.parse(firebaseConfig);
      console.log('   Project ID:', config.projectId);
      console.log('   API Key:', config.apiKey?.substring(0, 10) + '...');
    } catch (e) {
      console.log('⚠️  Firebase config is not valid JSON');
    }
  } else {
    console.log('❌ Firebase config is MISSING');
    console.log('   Action needed: Add NEXT_PUBLIC_FIREBASE_CONFIG to Vercel environment variables');
  }
  
  // Test 2: Check handshake endpoint
  console.log('\n🔗 Test 2: Backend Connectivity');
  try {
    const response = await fetch('/handshake');
    const html = await response.text();
    
    if (html.includes('handshake') || html.includes('backend')) {
      console.log('✅ Handshake page is accessible');
    } else {
      console.log('⚠️  Handshake page returned unexpected content');
    }
  } catch (error) {
    console.log('❌ Handshake page error:', error.message);
  }
  
  // Test 3: Check auth context
  console.log('\n🔐 Test 3: Authentication Context');
  try {
    // Try to access Firebase auth
    const { auth } = await import('/_next/static/chunks/app/layout.js');
    console.log('✅ Firebase auth module loaded');
  } catch (error) {
    console.log('⚠️  Firebase auth module not directly accessible');
    console.log('   This is normal - auth is handled through NextAuth');
  }
  
  // Test 4: Check NextAuth session
  console.log('\n🎫 Test 4: NextAuth Session');
  try {
    const sessionResponse = await fetch('/api/auth/session');
    const session = await sessionResponse.json();
    
    if (session?.user) {
      console.log('✅ User is logged in');
      console.log('   Email:', session.user.email);
      console.log('   Name:', session.user.name);
    } else {
      console.log('ℹ️  No active session');
      console.log('   Click "Login" to test Google OAuth');
    }
  } catch (error) {
    console.log('❌ Session check failed:', error.message);
  }
  
  // Test 5: Backend API health checks
  console.log('\n🏗️  Test 5: Backend API Health');
  const backendBase = 'https://australia-southeast1-evolution-engine.cloudfunctions.net';
  const endpoints = [
    { name: 'SSOT', path: '/ssot' },
    { name: 'Assets', path: '/assets' },
    { name: 'KYC', path: '/kyc' },
    { name: 'Applications', path: '/applications' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${backendBase}${endpoint.path}`);
      const status = response.ok ? '✅' : '⚠️';
      console.log(`   ${status} ${endpoint.name}: ${response.status}`);
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
    }
  }
  
  // Summary
  console.log('\n📊 Summary');
  console.log('==========');
  console.log('If Firebase config is missing:');
  console.log('1. Go to Vercel Dashboard → evolution-3-0 → Settings → Environment Variables');
  console.log('2. Add NEXT_PUBLIC_FIREBASE_CONFIG with the Firebase config JSON');
  console.log('3. Redeploy WITHOUT build cache');
  console.log('');
  console.log('If all tests pass:');
  console.log('✅ Your OAuth infrastructure is ready!');
  console.log('👉 Next: Click "Login" to test the Google OAuth flow manually');
})();
