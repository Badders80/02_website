"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { RegistrationGate } from "./RegistrationGate";

interface GuestProfileGateProps {
  horseName: string;
  horseSlug: string;
  children: React.ReactNode;
}

export function GuestProfileGate({ horseName, horseSlug, children }: GuestProfileGateProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignIn = () => {
    router.push(`/auth/login?redirect=${encodeURIComponent(`/marketplace/${horseSlug}`)}`);
  };

  if (loading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="aspect-[16/10] rounded-2xl bg-surface-base" />
        <div className="h-24 rounded-2xl bg-surface-base" />
        <div className="space-y-3">
          <div className="h-4 bg-white/5 rounded w-1/3" />
          <div className="h-4 bg-white/5 rounded w-full" />
          <div className="h-4 bg-white/5 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[480px]">
      <div
        className="blur-md opacity-25 pointer-events-none select-none max-h-[70vh] overflow-hidden"
        aria-hidden="true"
      >
        {children}
      </div>
      <div className="absolute inset-0 flex items-start justify-center pt-8 md:pt-16 px-4">
        <div className="w-full max-w-md">
          <RegistrationGate horseName={horseName} onSignIn={handleSignIn} />
        </div>
      </div>
    </div>
  );
}