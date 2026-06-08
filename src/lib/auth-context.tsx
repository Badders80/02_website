"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string;
  kycStatus: string;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("viewer");
  const [kycStatus, setKycStatus] = useState("none");

  useEffect(() => {
    const isBypass = process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";

    if (isBypass) {
      const mockLoggedOut = typeof window !== "undefined" && localStorage.getItem("mock_signed_out") === "true";
      if (mockLoggedOut) {
        setUser(null);
        setRole("viewer");
        setKycStatus("none");
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
        setUser(mockUser);
        setRole(process.env.NEXT_PUBLIC_MOCK_ROLE || "admin");
        setKycStatus(process.env.NEXT_PUBLIC_MOCK_KYC || "verified");
      }
      setLoading(false);
      return;
    }

    if (!auth || !(auth as any)._getRecaptchaConfig) {
      // Firebase not initialized (SSR/build time)
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const token = await u.getIdTokenResult(true);
        setRole((token.claims.role as string) || "viewer");
        setKycStatus((token.claims.kyc_status as string) || "none");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = async (email: string, password: string) => {
    const isBypass = process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";
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

    if (!auth || !(auth as any)._getRecaptchaConfig) throw new Error("Auth not initialized");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const isBypass = process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";
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

    if (!auth || !(auth as any)._getRecaptchaConfig) throw new Error("Auth not initialized");
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    const isBypass = process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";
    if (isBypass) {
      if (typeof window !== "undefined") {
        localStorage.setItem("mock_signed_out", "true");
      }
      setUser(null);
      setRole("viewer");
      setKycStatus("none");
      return;
    }

    if (!auth || !(auth as any)._getRecaptchaConfig) return;
    await firebaseSignOut(auth);
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
