"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

/**
 * OAuth return handler.
 *
 * Google → Supabase GoTrue redirects here with the session fragment
 * (implicit flow) or PKCE code. supabase-js detects and establishes the
 * session automatically on page load (detectSessionInUrl), so this page
 * just waits for the session, then forwards to ?next (default /mystable).
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <AuthCallbackInner />
    </Suspense>
  );
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // App-mediated Google leg: Google lands HERE (registered redirect URI)
    // with ?code&state — forward to the bridge route for token exchange +
    // GoTrue session mint. It redirects back with the session fragment.
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (code && state) {
      const params = new URLSearchParams();
      params.set("code", code);
      params.set("state", state);
      const dbg = searchParams.get("debug");
      if (dbg) params.set("debug", dbg);
      window.location.replace(`/api/auth/google/bridge?${params.toString()}`);
      return;
    }

    // Bridge failure: surface immediately instead of polling for a session
    // that will never arrive.
    const authError = searchParams.get("auth_error");
    if (authError) {
      setError("Google sign-in did not complete. Please try again from the sign-in page.");
      return;
    }

    const rawNext = searchParams.get("next") || "/mystable";
    // Open-redirect hardening: only same-origin relative paths allowed.
    const next = rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.includes("://")
      ? rawNext
      : "/mystable";
    const supabase = createBrowserClient();

    let attempts = 0;
    const poll = window.setInterval(async () => {
      attempts += 1;
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        window.clearInterval(poll);
        router.replace(next);
      } else if (attempts > 100) {
        window.clearInterval(poll);
        setError("Sign-in did not complete. Please try again.");
      }
    }, 200);

    return () => window.clearInterval(poll);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-canvas px-6 text-heading">
      {error ? (
        <div className="max-w-sm text-center">
          <p className="mb-4 text-sm text-red-400">{error}</p>
          <a
            href="/auth/login"
            className="text-[10px] uppercase tracking-[0.2em] text-gold transition-colors hover:text-white"
          >
            Back to sign in
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm font-light text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Completing sign-in…</span>
        </div>
      )}
    </div>
  );
}