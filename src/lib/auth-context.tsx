"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, isAuthInitialized } from "./firebase";
import { posthog } from "./posthog-client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string;
  kycStatus: string;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("viewer");
  const [kycStatus, setKycStatus] = useState("none");

  useEffect(() => {
    const isBypass = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";

    if (isBypass) {
      const mockLoggedOut = typeof window !== "undefined" && localStorage.getItem("mock_signed_out") === "true";
      if (mockLoggedOut) {
        // Defer mock logout state out of the effect body
        setTimeout(() => {
          setUser(null);
          setRole("viewer");
          setKycStatus("none");
        }, 0);
      } else {
        const mockUser: User = {
          uid: "mock-user-123",
          email: "mock-admin@example.com",
          displayName: "Mock User",
          getIdTokenResult: async () => ({
            token: "mock-token",
            authTime: new Date().toISOString(),
            issuedAtTime: new Date().toISOString(),
            expirationTime: new Date().toISOString(),
            signInProvider: "password",
            claims: {
              role: process.env.NEXT_PUBLIC_MOCK_ROLE || "admin",
              kyc_status: process.env.NEXT_PUBLIC_MOCK_KYC || "verified",
            },
          }),
        } as any;
        setTimeout(() => {
          setUser(mockUser);
          setRole(process.env.NEXT_PUBLIC_MOCK_ROLE || "admin");
          setKycStatus(process.env.NEXT_PUBLIC_MOCK_KYC || "verified");
        }, 0);
      }
      setTimeout(() => setLoading(false), 0);
      return;
    }

    if (!isAuthInitialized()) {
      // Firebase not initialized (SSR/build time)
      setTimeout(() => setLoading(false), 0);
      return;
    }

    // onAuthStateChanged for sign-in/out + initial claims
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        posthog.identify(u.uid, { email: u.email || undefined });
        posthog.capture("signup_completed", { method: "email" });
        const token = await u.getIdTokenResult(true);
        setRole((token.claims.role as string) || "viewer");
        setKycStatus((token.claims.kyc_status as string) || "none");
      } else {
        posthog.reset();
        setRole("viewer");
        setKycStatus("none");
      }
      setLoading(false);
    });

    // onIdTokenChanged: keeps claims (role/kycStatus) reactive on any token refresh
    // (polling getIdToken(true), background refresh, etc). Critical for post-webhook UX.
    const unsubToken = onIdTokenChanged(auth, async (u) => {
      if (u) {
        const token = await u.getIdTokenResult();
        setRole((token.claims.role as string) || "viewer");
        setKycStatus((token.claims.kyc_status as string) || "none");
      }
    });

    return () => {
      unsubAuth();
      unsubToken();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const isBypass = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";
    if (isBypass) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("mock_signed_out");
      }
      const mockUser: User = {
        uid: "mock-user-123",
        email: email || "mock-admin@example.com",
        displayName: "Mock User",
        getIdTokenResult: async () => ({
          token: "mock-token",
          authTime: new Date().toISOString(),
          issuedAtTime: new Date().toISOString(),
          expirationTime: new Date().toISOString(),
          signInProvider: "password",
          claims: {
            role: process.env.NEXT_PUBLIC_MOCK_ROLE || "admin",
            kyc_status: process.env.NEXT_PUBLIC_MOCK_KYC || "verified",
          },
        }),
      } as any;
      setUser(mockUser);
      setRole(process.env.NEXT_PUBLIC_MOCK_ROLE || "admin");
      setKycStatus(process.env.NEXT_PUBLIC_MOCK_KYC || "verified");
      return;
    }

    if (!isAuthInitialized()) throw new Error("Auth not initialized");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const isBypass = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";
    if (isBypass) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("mock_signed_out");
      }
      const mockUser: User = {
        uid: "mock-user-123",
        email: email || "mock-admin@example.com",
        displayName: "Mock User",
        getIdTokenResult: async () => ({
          token: "mock-token",
          authTime: new Date().toISOString(),
          issuedAtTime: new Date().toISOString(),
          expirationTime: new Date().toISOString(),
          signInProvider: "password",
          claims: {
            role: process.env.NEXT_PUBLIC_MOCK_ROLE || "admin",
            kyc_status: process.env.NEXT_PUBLIC_MOCK_KYC || "verified",
          },
        }),
      } as any;
      setUser(mockUser);
      setRole(process.env.NEXT_PUBLIC_MOCK_ROLE || "admin");
      setKycStatus(process.env.NEXT_PUBLIC_MOCK_KYC || "verified");
      return;
    }

    if (!isAuthInitialized()) throw new Error("Auth not initialized");
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    const isBypass = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";
    if (isBypass) {
      if (typeof window !== "undefined") {
        localStorage.setItem("mock_signed_out", "true");
      }
      setUser(null);
      setRole("viewer");
      setKycStatus("none");
      return;
    }

    if (!isAuthInitialized()) return;
    await firebaseSignOut(auth);
  };

  const refreshClaims = async () => {
    const isBypass = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";
    if (isBypass) {
      // bypass already static; nothing to refresh
      return;
    }
    if (!user || !isAuthInitialized()) return;
    try {
      const token = await user.getIdTokenResult(true);
      setRole((token.claims.role as string) || "viewer");
      setKycStatus((token.claims.kyc_status as string) || "none");
    } catch (e) {
      console.error("refreshClaims error:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        kycStatus,
        isAdmin: role === "admin",
        signIn,
        signUp,
        signOut,
        refreshClaims,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
