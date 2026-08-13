"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { LOGOS } from "@/lib/assets"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthFormProps {
  /** 'signin' or 'signup' — controls heading + submit text + toggle link */
  mode: "signin" | "signup"
  /** Called when the user clicks the mode toggle link */
  onModeChange: (mode: "signin" | "signup") => void
  /** Controlled email value */
  email: string
  onEmailChange: (value: string) => void
  /** Controlled password value */
  password: string
  onPasswordChange: (value: string) => void
  /** Email/password submit in progress */
  loading: boolean
  /** Google sign-in in progress */
  googleLoading: boolean
  /** Error message to display, or null */
  error: string | null
  /** Email/password form submit handler */
  onSubmit: (e: React.FormEvent) => Promise<void> | void
  /** Google sign-in click handler */
  onGoogleSignIn: () => Promise<void> | void
  /** Optional logo src override (defaults to LOGOS.simple.grey) */
  logoSrc?: string
  /** Optional additional CSS classes for the outer wrapper */
  className?: string
  /** Optional forgot-password href (defaults to /auth/forgot-password) */
  forgotPasswordHref?: string
  /** Children rendered below the form but above the mode toggle (e.g. extra buttons) */
  children?: React.ReactNode
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AuthForm({
  mode,
  onModeChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  loading,
  googleLoading,
  error,
  onSubmit,
  onGoogleSignIn,
  logoSrc = LOGOS.simple.grey,
  className,
  forgotPasswordHref = "/auth/forgot-password",
  children,
}: AuthFormProps) {
  const heading = mode === "signin" ? "Sign In" : "Create Account"
  const submitLabel = mode === "signin" ? "Sign In" : "Create Account"
  const toggleLabel =
    mode === "signin"
      ? "Need an account? Sign up"
      : "Already have an account? Sign in"

  return (
    <div className={cn("w-full max-w-sm", className)}>
      <Card variant="default" className="rounded-3xl border-border p-8 shadow-xl backdrop-blur-md">
        {/* ─── Logo ─── */}
        <div className="mb-8 flex justify-center border-b border-border pb-6">
          <Link href="/" className="group block focus:outline-none">
            <Image
              src={logoSrc}
              alt="Evolution Stables"
              width={240}
              height={80}
              className="h-14 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
              priority
            />
          </Link>
        </div>

        {/* ─── Heading ─── */}
        <h2 className="mb-6 text-[14px] font-[300] uppercase tracking-[0.2em] text-heading">
          {heading}
        </h2>

        {/* ─── Error ─── */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ─── Google Sign-In ─── */}
        <button
          type="button"
          onClick={onGoogleSignIn}
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

        {/* ─── Divider ─── */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-border" />
          <span className="px-4 text-sm text-muted-foreground">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* ─── Email / Password Form ─── */}
        <form onSubmit={onSubmit} className="space-y-5">
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
              onChange={(e) => onEmailChange(e.target.value)}
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
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
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

        {/* ─── Forgot Password ─── */}
        {mode === "signin" && (
          <div className="mt-4 text-center">
            <Link
              href={forgotPasswordHref}
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-200 hover:text-frost"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {/* ─── Extra children (slot for additional actions) ─── */}
        {children}

        {/* ─── Mode Toggle ─── */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              onModeChange(mode === "signin" ? "signup" : "signin")
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
