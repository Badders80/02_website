"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { LOGOS } from "@/lib/assets"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

/**
 * App-mediated Google OAuth (consent shows our client, not *.supabase.co).
 * Enabled via NEXT_PUBLIC_APP_MEDIATED_GOOGLE=1; unset = legacy GoTrue flow.
 * Bridge errors land on /auth/callback?auth_error=<code>; that page renders
 * the same message text as this map (keep both in sync — audit finding 1).
 */
const APP_MEDIATED_GOOGLE = process.env.NEXT_PUBLIC_APP_MEDIATED_GOOGLE === "1";
const GOOGLE_ERRORS: Record<string, string> = {
  google_not_configured: "Google sign-in is not available right now — please use email sign-in.",
  google_denied: "Google sign-in was cancelled.",
  google_callback_invalid: "Google sign-in could not be verified. Please try again.",
  google_csrf: "Sign-in session expired. Please try again.",
  google_token_exchange: "Google sign-in failed. Please try again.",
  google_signin_failed: "Google sign-in could not create your session. Please try again.",
};

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signUp, user } = useAuth()
  const [mode, setMode] = useState<"signin" | "signup">("signin")

  const getRedirectTarget = useCallback(
    () => searchParams.get("redirect") || "/mystable",
    [searchParams],
  )
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    () => GOOGLE_ERRORS[searchParams.get("error") ?? ""] ?? null,
  )

  // If user is already signed in (e.g. persisted), redirect respecting ?redirect (from KYC CTA etc)
  useEffect(() => {
    if (user) {
      router.push(getRedirectTarget())
    }
  }, [user, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === "signin") {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      router.push(getRedirectTarget())
    } catch (err: any) {
      setError(err.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    if (APP_MEDIATED_GOOGLE) {
      window.location.href = `/api/auth/google?next=${encodeURIComponent(getRedirectTarget())}`;
      return;
    }
    try {
      const { createBrowserClient } = await import("@/lib/supabase")
      const supabase = createBrowserClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(getRedirectTarget())}`
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      })
      if (oauthError) {
        throw oauthError
      }
      // On success the browser navigates to Google; no further handling.
    } catch (err: any) {
      console.error("[Google Sign-In] Error:", err)
      setError(
        err.message || "Google sign-in failed. Please try email sign-in.",
      )
    } finally {
      setGoogleLoading(false)
    }
  }

  const heading = mode === "signin" ? "Sign In" : "Create Account"
  const submitLabel = mode === "signin" ? "Sign In" : "Create Account"
  const toggleLabel =
    mode === "signin"
      ? "Need an account? Sign up"
      : "Already have an account? Sign in"

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-canvas px-6 py-16">
      <Card variant="default" className="w-full max-w-sm rounded-3xl border-border p-8 shadow-xl backdrop-blur-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center border-b border-border pb-6">
          <Link href="/" className="group block focus:outline-none">
            <Image
              src={LOGOS.simple.grey}
              alt="Evolution Stables"
              width={240}
              height={80}
              className="h-14 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
              priority
            />
          </Link>
        </div>

        {/* Heading */}
        <h2 className="mb-6 text-[14px] font-[300] uppercase tracking-[0.2em] text-heading">
          {heading}
        </h2>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-surface-base/80 px-4 py-3 font-medium text-white transition-all duration-200 hover:border-white/30 hover:bg-surface-base/80 hover:text-white hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Connecting...
            </span>
          ) : (
            <>
              <svg
                className="h-5 w-5 transition duration-200"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#4285F4"
                  d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
                />
                <path
                  fill="#34A853"
                  d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
                />
                <path
                  fill="#FBBC05"
                  d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
                />
                <path
                  fill="#EA4335"
                  d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-border" />
          <span className="px-4 text-sm text-muted-foreground">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="auth-email"
              className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
            >
              Email Address
            </Label>
            <Input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete={mode === "signin" ? "email" : "email"}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="auth-password"
              className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
            >
              Password
            </Label>
            <Input
              id="auth-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Please wait...
                </span>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>

        {/* Forgot Password */}
        {mode === "signin" && (
          <div className="mt-4 text-center">
            <Link
              href="/auth/forgot-password"
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-200 hover:text-frost"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin")
              setError(null)
            }}
            className="text-[10px] uppercase tracking-[0.2em] text-gold transition-colors duration-200 hover:text-white"
          >
            {toggleLabel}
          </button>
        </div>
      </Card>
    </div>
  )
}

// Wrapper required by Next.js for useSearchParams() (avoids prerender bailout / suspense boundary error)
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas text-foreground">
          Loading login...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
