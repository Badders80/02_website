"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  getAdditionalUserInfo,
} from "firebase/auth"
import { auth, isAuthInitialized } from "@/lib/firebase"
import { AuthForm } from "@/components/ui/sign-in-1"
import { LOGOS } from "@/lib/assets"

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

  return (
    <div className="flex min-h-screen w-full bg-canvas text-heading">
      {/* Left Pane: Authentication Form */}
      <div className="flex w-full min-h-screen items-center justify-center px-6 py-16 lg:w-1/2">
        <AuthForm
          mode={mode}
          onModeChange={setMode}
          email={email}
          onEmailChange={setEmail}
          password={password}
          onPasswordChange={setPassword}
          loading={loading}
          googleLoading={googleLoading}
          error={error}
          onSubmit={handleSubmit}
          onGoogleSignIn={handleGoogleSignIn}
          logoSrc={LOGOS.simple.grey}
        />
      </div>

      {/* Right Pane: Slick Jockey Video Split Screen */}
      <div className="relative hidden h-screen overflow-hidden lg:block lg:w-1/2">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover object-[center_70%]"
        >
          <source
            src="/images/content/video/jockey-walk-out.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
      </div>
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
