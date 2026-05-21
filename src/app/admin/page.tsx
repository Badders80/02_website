"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AdminStat, AdminCard, AdminButton } from "@/components/admin";

interface Stats {
  horses: number;
  owners: number;
  trainers: number;
  hlts: number;
  assets: number;
}

export default function AdminDashboard() {
  const { role, kycStatus } = useAuth();
  const [stats, setStats] = useState<Stats>({
    horses: 0,
    owners: 0,
    trainers: 0,
    hlts: 0,
    assets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/ssot/horses").then((r) => r.json()),
      fetch("/api/ssot/owners").then((r) => r.json()),
      fetch("/api/ssot/trainers").then((r) => r.json()),
      fetch("/api/ssot/hlts").then((r) => r.json()),
      fetch("/api/assets/retrieve").then((r) => r.json()),
    ])
      .then(([h, o, t, hl, a]) => {
        setStats({
          horses: h.horses?.length || 0,
          owners: o.owners?.length || 0,
          trainers: t.trainers?.length || 0,
          hlts: hl.hlts?.length || 0,
          assets: a.assets?.length || 0,
        });
      })
      .catch(() => {
        // Silently fail — stats are decorative
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Horses", value: stats.horses, href: "/admin/horses" },
    { label: "Owners", value: stats.owners, href: "/admin/owners" },
    { label: "Trainers", value: stats.trainers, href: "/admin/trainers" },
    { label: "HLTs", value: stats.hlts, href: "/admin/hlts" },
    { label: "Assets", value: stats.assets, href: "/admin/assets" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage horses, owners, trainers, HLTs, and assets.
        </p>
      </div>

      {kycStatus !== "verified" && (
        <AdminCard hover={false} className="border-warning-border bg-warning-bg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Identity verification required
                </p>
                <p className="text-xs text-muted">
                  Complete KYC to unlock full platform access.
                </p>
              </div>
            </div>
            <AdminButton href="/auth/verify" size="sm">
              Verify Identity
            </AdminButton>
          </div>
        </AdminCard>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {statCards.map((s) => (
          <AdminStat
            key={s.label}
            label={s.label}
            value={s.value}
            href={s.href}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}
