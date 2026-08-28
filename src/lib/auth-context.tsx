"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase";
import { posthog } from "./posthog-client";

/**
 * Supabase-backed auth context — drop-in replacement for the Firebase
 * AuthProvider. The exported interface is IDENTICAL, so every consumer
 * (NavBar, marketplace cards, KYC banner, MyStable) works unchanged.
 *
 * Two compat details that keep the surface stable:
 * 1. `user` is a Supabase User exposing the same fields consumers read
 *    (id, email, user_metadata).
 * 2. `getIdToken()` is provided on an augmented user object so existing
 *    `Authorization: Bearer <token>` API calls keep working verbatim —
 *    it now returns the Supabase access token, which the API routes
 *    verify via GoTrue instead of Firebase public keys.
 */

type AugmentedUser = User & {
  /** Firebase-era alias of `id` — consumers read `user.uid`. */
  uid: string;
  /** Firebase-era alias — resolved from metadata/email for display. */
  readonly displayName: string | null;
  /** Returns the Supabase access token for `Authorization: Bearer` calls. */
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
};

interface AuthContextType {
  user: AugmentedUser | null;
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

function augmentUser(user: User): AugmentedUser {
  const augmented = user as AugmentedUser;
  const meta = { ...(user.user_metadata ?? {}) };
  augmented.uid = user.id;
  Object.defineProperty(augmented, "displayName", {
    get: () =>
      (meta.full_name as string) ||
      (meta.name as string) ||
      user.email ||
      null,
  });
  augmented.getIdToken = async (forceRefresh = false) => {
    const supabase = createBrowserClient();
    if (forceRefresh) {
      const { data } = await supabase.auth.refreshSession();
      if (data.session?.access_token) return data.session.access_token;
    }
    const { data } = await supabase.auth.getSession();
    if (!data.session?.access_token) {
      throw new Error("No active session");
    }
    return data.session.access_token;
  };
  return augmented;
}

function readClaims(user: User | null): { role: string; kycStatus: string } {
  if (!user) return { role: "viewer", kycStatus: "none" };
  const meta = { ...(user.app_metadata ?? {}), ...(user.user_metadata ?? {}) };
  return {
    role: (meta.role as string) || "viewer",
    kycStatus: (meta.kyc_status as string) || "none",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AugmentedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("viewer");
  const [kycStatus, setKycStatus] = useState("none");

  useEffect(() => {
    const supabase = createBrowserClient();

    // Initial session + reactive claim updates on any auth state change
    // (sign-in, token refresh, KYC webhook updating app_metadata, sign-out).
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser ? augmentUser(nextUser) : null);

      if (nextUser) {
        posthog.identify(nextUser.id, { email: nextUser.email || undefined });
        if (event === "SIGNED_IN") {
          posthog.capture("signup_completed", { method: "supabase" });
        }
        const meta = {
          ...(nextUser.app_metadata ?? {}),
          ...(nextUser.user_metadata ?? {}),
        };
        setRole((meta.role as string) || "viewer");
        setKycStatus((meta.kyc_status as string) || "none");
      } else {
        posthog.reset();
        setRole("viewer");
        setKycStatus("none");
      }
      setLoading(false);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    const signIn = async (email: string, password: string) => {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
    };

    const signUp = async (email: string, password: string) => {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw new Error(error.message);
      // Prod has mailer_autoconfirm=false: a new signup must confirm via
      // email before a session exists. Surface that clearly.
      const { data } = await createBrowserClient().auth.getSession();
      if (!data.session) {
        throw new Error("Account created — check your inbox to confirm your email, then sign in.");
      }
    };

    const signOut = async () => {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
    };

    const refreshClaims = async () => {
      if (!user) return;
      try {
        const supabase = createBrowserClient();
        if (user.is_anonymous) return;
        const { data } = await supabase.auth.refreshSession();
        const nextUser = data.session?.user;
        if (nextUser) {
          const meta = {
            ...(nextUser.app_metadata ?? {}),
            ...(nextUser.user_metadata ?? {}),
          };
          setRole((meta.role as string) || "viewer");
          setKycStatus((meta.kyc_status as string) || "none");
        }
      } catch (e) {
        console.error("refreshClaims error:", e);
      }
    };

    return {
      user,
      loading,
      role,
      kycStatus,
      isAdmin: role === "admin",
      signIn,
      signUp,
      signOut,
      refreshClaims,
    };
  }, [user, loading, role, kycStatus]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}