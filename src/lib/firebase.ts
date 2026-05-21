import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let app: FirebaseApp | undefined;
let auth: Auth;

const firebaseConfigRaw = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

if (firebaseConfigRaw && firebaseConfigRaw !== "{}" && typeof window !== "undefined") {
  try {
    const firebaseConfig = JSON.parse(firebaseConfigRaw);
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
  } catch {
    // Fallback: create a dummy auth that will fail gracefully at runtime
    auth = {} as Auth;
  }
} else {
  // Dummy auth for SSR/build time
  auth = {} as Auth;
}

export { auth };
