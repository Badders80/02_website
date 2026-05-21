"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminTable, AdminButton, AdminEmptyState, AdminLoading, AdminBadge } from "@/components/admin";

interface Horse {
  id: string;
  microchip: string;
  name: string;
  foaling_date: string;
  sex: string;
  colour: string;
  sire_name: string;
  dam_name: string;
  status: string;
  image_url: string | null;
}

export default function HorsesListPage() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ssot/horses")
      .then((res) => res.json())
      .then((data) => {
        setHorses(data.horses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-10 w-48 rounded-xl bg-white/[0.04] animate-pulse" />
          <div className="h-10 w-36 rounded-xl bg-white/[0.04] animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-panel p-4">
              <div className="h-10 w-10 rounded-full bg-white/[0.04] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-white/[0.04] animate-pulse" />
                <div className="h-3 w-48 rounded bg-white/[0.04] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const columns = [
    {
      key: "horse",
      header: "Horse",
      render: (horse: Horse) => (
        <Link href={`/admin/horses/${horse.microchip}`} className="flex items-center gap-3 group">
          {horse.image_url ? (
            <img src={horse.image_url} alt={horse.name} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-muted">🐎</div>
          )}
          <div>
            <p className="font-medium text-foreground group-hover:text-gold transition-colors">{horse.name}</p>
            <p className="text-xs text-muted">{horse.sire_name} × {horse.dam_name}</p>
          </div>
        </Link>
      ),
    },
    { key: "microchip", header: "Microchip" },
    { key: "sex", header: "Sex" },
    {
      key: "age",
      header: "Age",
      render: (horse: Horse) =>
        horse.foaling_date
          ? new Date().getFullYear() - new Date(horse.foaling_date).getFullYear()
          : "—",
    },
    {
      key: "status",
      header: "Status",
      render: (horse: Horse) => (
        <AdminBadge value={horse.status} variant="default" />
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Horses
        </h1>
        <Link href="/admin/horses/new">
          <AdminButton>+ Register Horse</AdminButton>
        </Link>
      </div>

      {horses.length === 0 ? (
        <AdminEmptyState
          message="No horses registered yet."
          action={{ label: "Register your first horse", href: "/admin/horses/new" }}
        />
      ) : (
        <AdminTable columns={columns} data={horses} />
      )}
    </div>
  );
}
