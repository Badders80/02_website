"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GlowPillButton } from "@/components/ui/GlowPillButton";
import { LOGOS } from "@/lib/assets";

/**
 * Password reset via Supabase Auth email.
 * Linked from /auth/login — was previously a 404.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { createBrowserClient } = await import("@/lib/supabase");
      const supabase = createBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/auth/callback?next=/auth/login` },
      );
      if (resetError) throw resetError;
      setSent(true);
    } catch (err: any) {
      // Avoid account enumeration: same success UX for most errors, log real cause
      console.error("[forgot-password]", err?.message || err);
      const msg = String(err?.message || "");
      if (msg.toLowerCase().includes("invalid email")) {
        setError("Please enter a valid email address.");
      } else if (msg.toLowerCase().includes("rate limit")) {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        // Still show generic success-style path for user-not-found etc.
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-canvas px-6 py-16 text-heading">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-border bg-panel p-8 shadow-xl backdrop-blur-md">
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

          <h2 className="mb-2 text-[14px] font-[300] uppercase tracking-[0.2em] text-heading">
            Reset password
          </h2>
          <p className="mb-6 text-sm font-light text-muted-foreground">
            Enter the email for your account. If it exists, we&apos;ll send a
            reset link.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {sent ? (
            <div className="space-y-6">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                If an account exists for that email, a reset link is on its way.
                Check your inbox and spam folder.
              </div>
              <Link
                href="/auth/login"
                className="block text-center text-[10px] uppercase tracking-[0.2em] text-gold transition-colors hover:text-white"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-[300] uppercase tracking-[0.25em] text-muted-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block h-11 w-full rounded-xl border border-border bg-white/5 px-4 text-sm text-white placeholder:text-muted-foreground transition-all duration-200 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <GlowPillButton
                type="submit"
                disabled={loading}
                className="w-full text-center !border-border !bg-surface-base/80 !text-foreground hover:!border-steel-border hover:!bg-surface-base/80 hover:!text-heading"
                wrapperClassName="w-full"
              >
                {loading ? "Sending..." : "Send reset link"}
              </GlowPillButton>
              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-frost"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
