const fs = require('fs');

async function getFirebaseToken() {
  const email = 'test-live-user@evolutionstables.nz';
  const password = 'TestPassword123!';
  const apiKey = "AIzaSyCjJfkdUIoZS-a3soi0MafZ8yfA4K-m8w0";

  console.log(`1. Ensuring test user ${email} exists...`);
  try {
    const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    const res = await fetch(signUpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log(`   Created new test user: ${data.localId}`);
      return { idToken: data.idToken, localId: data.localId };
    } else {
      const errData = await res.json();
      if (errData.error && errData.error.message === 'EMAIL_EXISTS') {
        console.log('   User already exists, proceeding to login...');
      } else {
        throw new Error(`Sign-up failed: ${JSON.stringify(errData)}`);
      }
    }
  } catch (err) {
    console.log(`   Sign-up message: ${err.message}`);
  }
  
  console.log("2. Signing in with email and password via REST API...");
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  
  if (!res.ok) {
    throw new Error(`Firebase sign-in failed: ${res.status} ${await res.text()}`);
  }
  
  const data = await res.json();
  return { idToken: data.idToken, localId: data.localId };
}

async function getGcpToken(aud) {
  const envLocal = fs.readFileSync('/home/evo/evo_01/02_website/.env.local', 'utf8');
  const oidcTokenMatch = envLocal.match(/VERCEL_OIDC_TOKEN="([^"]+)"/);
  if (!oidcTokenMatch) {
    throw new Error("No OIDC token found in .env.local");
  }
  const oidcToken = oidcTokenMatch[1];
  
  const WIF_POOL = "projects/851430309148/locations/global/workloadIdentityPools/vercel-pool";
  const WIF_PROVIDER = "vercel-oidc-team";
  const SERVICE_ACCOUNT = "website-api@evolution-engine.iam.gserviceaccount.com";
  
  // 1. STS exchange
  const stsRes = await fetch("https://sts.googleapis.com/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grantType: "urn:ietf:params:oauth:grant-type:token-exchange",
      audience: `//iam.googleapis.com/${WIF_POOL}/providers/${WIF_PROVIDER}`,
      requestedTokenType: "urn:ietf:params:oauth:token-type:access_token",
      subjectTokenType: "urn:ietf:params:oauth:token-type:jwt",
      subjectToken: oidcToken,
      scope: "https://www.googleapis.com/auth/cloud-platform",
    }),
  });
  
  if (!stsRes.ok) {
    throw new Error(`STS failed: ${stsRes.status} ${await stsRes.text()}`);
  }
  
  const stsData = await stsRes.json();
  const accessToken = stsData.access_token;
  
  // 2. Generate ID token
  const idRes = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${SERVICE_ACCOUNT}:generateIdToken`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        audience: aud,
        includeEmail: true,
      }),
    }
  );
  
  if (!idRes.ok) {
    throw new Error(`ID Token generation failed: ${idRes.status} ${await idRes.text()}`);
  }
  
  const idData = await idRes.json();
  return idData.token;
}

async function run() {
  console.log("🚀 Starting live KYC flow E2E validation...");
  
  try {
    // Step 1: Sign in to Firebase
    const firebase = await getFirebaseToken();
    console.log(`   Success! Firebase UID: ${firebase.localId}`);
    
    // Step 2: Get GCP identity token
    const aud = "https://australia-southeast1-evolution-engine.cloudfunctions.net/kyc";
    console.log(`3. Exchanging Vercel OIDC token for GCP identity token for audience: ${aud}...`);
    const gcpToken = await getGcpToken(aud);
    console.log("   Success! GCP Token obtained.");
    
    // Step 3: Call KYC create-session directly
    console.log("4. Calling /create-session on the deployed KYC Cloud Function...");
    const kycRes = await fetch(`${aud}/create-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${gcpToken}`,
        "X-Firebase-Token": firebase.idToken
      },
      body: JSON.stringify({
        user_id: firebase.localId,
        email: "test-live-user@evolutionstables.nz",
        return_url: "https://www.evolutionstables.nz/auth/verify"
      })
    });
    
    console.log(`   Response status: ${kycRes.status}`);
    const bodyText = await kycRes.text();
    console.log(`   Response body: ${bodyText}`);
    
    if (kycRes.ok) {
      console.log("\n✅ E2E Success! Stripe KYC Session created successfully!");
    } else {
      console.log("\n❌ E2E Failed! The backend returned an error.");
    }
  } catch (err) {
    console.error("\n💥 Error during E2E flow:", err.message);
  }
}

run();
