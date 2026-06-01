"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";

function KycBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    verified: "bg-green-500/10 text-green-400",
    pending: "bg-yellow-500/10 text-yellow-400",
    requires_input: "bg-orange-500/10 text-orange-400",
    canceled: "bg-red-500/10 text-red-400",
    none: "bg-white/5 text-muted",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${styles[status] || styles.none}`}>
      {status === "none" ? "KYC: Not Started" : status.replace("_", " ")}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "bg-gold/10 text-gold",
    investor: "bg-blue-500/10 text-blue-400",
    viewer: "bg-white/5 text-muted",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${styles[role] || styles.viewer}`}>
      {role}
    </span>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, role, kycStatus, isAdmin } = useAuth();
  const router = useRouter();

  // Auth guard enabled for production/staging/live auth
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Website Navbar - Persistent at top */}
      <NavBar />

      {/* Sidebar - offset by navbar height (mt-16 = 64px) */}
      <aside className="mt-16 flex w-64 flex-col border-r border-white/[0.06] bg-panel font-sans">
        <div className="flex h-16 items-center border-b border-white/[0.06] px-6">
          <Link href="/admin" className="font-display text-lg font-bold text-gold">
            Evolution
          </Link>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Registry
          </div>
          <Link
            href="/admin/horses"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            🐎 Horses
          </Link>
          <Link
            href="/admin/horses/new"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            ➕ New Horse
          </Link>
          <Link
            href="/admin/owners"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            👤 Owners
          </Link>
          <Link
            href="/admin/trainers"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            🏇 Trainers
          </Link>
          <Link
            href="/admin/hlts"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            📄 HLTs
          </Link>

          <div className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Content
          </div>
          <Link
            href="/admin/assets"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            🖼️ Assets
          </Link>
          <Link
            href="/admin/assets/upload"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            ⬆️ Upload
          </Link>

          <div className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Website
          </div>
          <Link
            href="/admin/website/press"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            📰 Press
          </Link>
          <Link
            href="/admin/website/faq"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            ❓ FAQ
          </Link>
        </nav>

        {/* User */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold text-xs font-bold">
              {user?.email?.[0].toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.email || "Dev Mode"}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <RoleBadge role={role} />
                <KycBadge status={kycStatus} />
              </div>
            </div>
          </div>
          {user && (
            <button
              onClick={() => signOut().then(() => router.push("/auth/login"))}
              className="mt-3 w-full rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground"
            >
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Main - offset by navbar height */}
      <main className="flex-1 overflow-auto mt-16 bg-black font-sans">
        <div className="mx-auto max-w-7xl p-8">{children}</div>
      </main>
    </div>
  );
}
