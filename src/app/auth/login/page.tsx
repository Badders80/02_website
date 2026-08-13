"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  getAdditionalUserInfo,
} from "firebase/auth"
import { auth, isAuthInitialized } from "@/lib/firebase"
import { LOGOS } from "@/lib/assets"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

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
  const [error, setError] = useState<string | null>(null)

  // Check redirect result on mount (to handle redirect login fallback)
  useEffect(() => {
    if (!isAuthInitialized()) return

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          router.push(getRedirectTarget())
        }
      })
      .catch((err) => {
        console.error("[Google Redirect Sign-In] Error:", err)
        setError(err.message || "Google sign-in failed.")
      })
  }, [router, searchParams])

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
    setGoogleLoading(true)
    setError(null)
    try {
      if (!isAuthInitialized()) {
        throw new Error(
          "Firebase authentication is not configured. Please contact support.",
        )
      }

      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })

      try {
        console.log("[Google Sign-In] Attempting popup auth...")
        const result = await signInWithPopup(auth, provider)
        // First-time Google users only
        const info = getAdditionalUserInfo(result)
        if (info?.isNewUser && result.user) {
          const { posthog } = await import("@/lib/posthog-client")
          posthog.identify(result.user.uid, {
            email: result.user.email || undefined,
          })
          posthog.capture("signup_completed", { method: "google" })
        }
        router.push(getRedirectTarget())
      } catch (popupErr: any) {
        // If popup is blocked, cancelled, or closed, fallback to redirect immediately
        if (
          popupErr.code === "auth/popup-blocked" ||
          popupErr.code === "auth/cancelled-popup-request" ||
          popupErr.code === "auth/popup-closed-by-user" ||
          popupErr.message?.includes("popup")
        ) {
          console.warn(
            "[Google Sign-In] Popup issue encountered, falling back to redirect...",
            popupErr,
          )
          setError(
            "Popup blocked. Redirecting to Google secure login...",
          )
          await signInWithRedirect(auth, provider)
        } else {
          throw popupErr
        }
      }
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
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl bg-surface-base/80 px-4 py-3 font-medium text-white transition-all duration-200 hover:border-steel-border hover:bg-surface-base/80 hover:text-white hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Connecting...
            </span>
          ) : (
            <>
              <svg
                className="h-5 w-5 text-gray-900 transition duration-200"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
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
