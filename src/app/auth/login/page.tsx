"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { auth, isAuthInitialized } from "@/lib/firebase";
import { GlowPillButton } from "@/components/ui/GlowPillButton";
import { LOGOS } from "@/lib/assets";



function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRedirectTarget = () => {
    const raw = searchParams.get("redirect") || "";
    if (raw.startsWith("/") && !raw.startsWith("//")) {
      return raw; // safe relative same-origin path
    }
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("//")) {
      try {
        const u = new URL(raw.startsWith("//") ? `https:${raw}` : raw);
        if (typeof window !== "undefined" && u.origin === window.location.origin) {
          return (u.pathname || "/") + (u.search || "") + (u.hash || "");
        }
      } catch {}
    }
    return "/mystable"; // default + strip externals
  };

  // Check redirect result on mount (to handle redirect login fallback)
  useEffect(() => {
    if (!isAuthInitialized()) return;
    
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          router.push(getRedirectTarget());
        }
      })
      .catch((err) => {
        console.error("[Google Redirect Sign-In] Error:", err);
        setError(err.message || "Google sign-in failed.");
      });
  }, [router]);

  // If user is already signed in, push to mystable (respect redirect param)
  useEffect(() => {
    if (user) {
      router.push(getRedirectTarget());
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.push(getRedirectTarget());
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      if (!isAuthInitialized()) {
        throw new Error("Firebase authentication is not configured. Please contact support.");
      }
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      try {
        console.log("[Google Sign-In] Attempting popup auth...");
        await signInWithPopup(auth, provider);
        router.push(getRedirectTarget());
      } catch (popupErr: any) {
        // If popup is blocked, cancelled, or closed, fallback to redirect immediately
        if (
          popupErr.code === "auth/popup-blocked" || 
          popupErr.code === "auth/cancelled-popup-request" || 
          popupErr.code === "auth/popup-closed-by-user" ||
          popupErr.message?.includes("popup")
        ) {
          console.warn("[Google Sign-In] Popup issue encountered, falling back to redirect...", popupErr);
          setError("Popup blocked. Redirecting to Google secure login...");
          await signInWithRedirect(auth, provider);
        } else {
          throw popupErr;
        }
      }
    } catch (err: any) {
      console.error("[Google Sign-In] Error:", err);
      setError(err.message || "Google sign-in failed. Please try email sign-in.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-black text-white">
      {/* Left Pane: Authentication Form */}
      <div className="flex w-full min-h-screen items-center justify-center px-6 py-16 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl border border-white/[0.06] bg-panel p-8 shadow-xl backdrop-blur-md">
            {/* Logo Watermark inside the overall card container */}
            <div className="flex justify-center mb-8 border-b border-white/[0.06] pb-6">
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

            <h2 className="text-[14px] font-[300] tracking-[0.2em] uppercase text-white/90 mb-6">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </h2>

            {error && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="mt-4 w-full flex items-center justify-center gap-3 rounded-xl bg-zinc-900/80 text-white border border-white/15 font-medium py-3 px-4 transition-colors duration-200 hover:bg-zinc-800/80 hover:border-white/30 hover:text-white hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <span className="flex items-center gap-2 text-gray-900">
                  <svg className="animate-spin h-5 w-5 text-gray-900" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connecting...
                </span>
              ) : (
                <>
                  <svg className="h-5 w-5 text-gray-900 filter grayscale hover:grayscale-0 active:grayscale-0 transition duration-200" viewBox="0 0 24 24">
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

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-white/[0.06]" />
              <span className="px-4 text-sm text-white/40">or</span>
              <div className="flex-1 border-t border-white/[0.06]" />
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2 font-[300]">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2 font-[300]">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <GlowPillButton
                  type="submit"
                  disabled={loading}
                  className="w-full text-center !bg-zinc-900/80 hover:!bg-zinc-800/80 !border-white/15 hover:!border-white/30 !text-white/80 hover:!text-white"
                  wrapperClassName="w-full"
                >
                  {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
                </GlowPillButton>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setError(null);
                }}
                className="text-[10px] uppercase tracking-[0.2em] text-gold hover:text-white transition-colors duration-200"
              >
                {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
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
          <source src="/images/content/video/jockey-walk-out.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen w-full bg-black text-white items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

