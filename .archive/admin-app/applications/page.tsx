"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AdminCard, AdminButton } from "@/components/admin";

interface Application {
  id: string;
  user_id: string;
  hlt_id: string;
  email: string;
  name: string;
  units_requested: number;
  message: string;
  status: string;
  created_at: { seconds: number };
}

export default function AdminApplicationsPage() {
  const { role, kycStatus } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "admin") {
      setLoading(false);
      return;
    }

    fetch("/api/applications/list")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setApplications(data.applications || []);
        } else {
          setError(data.error || "Failed to load applications");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load applications");
      })
      .finally(() => setLoading(false));
  }, [role]);

  if (role !== "admin") {
    return (
      <AdminCard hover={false} className="border-warning-border bg-warning-bg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Admin access required</p>
            <p className="text-xs text-muted">You must be logged in as an admin to view applications.</p>
          </div>
          <AdminButton href="/auth/login" size="sm">
            Login as Admin
          </AdminButton>
        </div>
      </AdminCard>
    );
  }

  if (kycStatus !== "verified") {
    return (
      <AdminCard hover={false} className="border-warning-border bg-warning-bg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Identity verification required</p>
            <p className="text-xs text-muted">Complete KYC to unlock full platform access.</p>
          </div>
          <AdminButton href="/auth/verify" size="sm">
            Verify Identity
          </AdminButton>
        </div>
      </AdminCard>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Applications</h1>
        <p className="text-sm text-muted">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <AdminCard hover={false} className="border-red-500/20 bg-red-500/5">
        <p className="text-sm font-medium text-red-400">Error loading applications</p>
        <p className="text-xs text-red-300/60 mt-1">{error}</p>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Applications</h1>
        <p className="mt-1 text-sm text-muted">
          Review and manage ownership applications from the marketplace.
        </p>
      </div>

      {applications.length === 0 ? (
        <AdminCard hover={false} className="border-white/[0.04] bg-white/[0.01]">
          <p className="text-sm text-muted">No applications yet.</p>
        </AdminCard>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <AdminCard key={app.id} className="border-white/[0.04] bg-white/[0.01]">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-[#d4a964]">#{app.id.slice(0, 8)}</span>
                    <span className="text-xs text-white/30">•</span>
                    <span className="text-xs text-white/50">
                      {new Date(app.created_at.seconds * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-white">{app.name}</h3>
                  <p className="text-sm text-white/60">{app.email}</p>
                  <p className="text-sm text-white/40 mt-2">
                    Applied for: <span className="text-white">{app.hlt_id}</span> •{" "}
                    <span className="text-[#d4a964]">{app.units_requested} units</span>
                  </p>
                  {app.message && (
                    <p className="text-sm text-white/30 mt-2 italic">"{app.message}"</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    {app.status}
                  </span>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
