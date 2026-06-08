"use client";

import { useEffect, useState } from "react";
import { AdminTable, AdminButton, AdminEmptyState, AdminLoading, AdminBadge, AdminForm, AdminSelect, AdminInput } from "@/components/admin";

interface HLT {
  id: string;
  horse_microchip: string;
  horse_name?: string;
  owner_id: string;
  owner_name?: string;
  trainer_id: string;
  trainer_name?: string;
  status: "draft" | "reviewed" | "publish_ready" | "published";
  lease_period_months: number;
  lease_start_date: string;
  documents: {
    term_sheet: { status: "pending" | "reviewed"; gcs_url: string | null };
    pds: { status: "pending" | "reviewed"; gcs_url: string | null };
    sa: { status: "pending" | "reviewed"; gcs_url: string | null };
  };
}

interface Horse {
  microchip: string;
  name: string;
}

interface Owner {
  id: string;
  name: string;
}

interface Trainer {
  id: string;
  name: string;
}

export default function HLTsListPage() {
  const [hlts, setHlts] = useState<HLT[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    horse_microchip: "",
    owner_id: "",
    trainer_id: "",
    lease_period_months: 36,
    lease_start_date: "",
    leasehold_stake_percentage: 50,
    investor_return_percentage: 10,
    syndicate_price_cents: 500000,
    shares_total: 50,
    shares_sold: 0,
    share_price_cents: 10000,
    currency: "NZD" as "NZD",
  });

  const handleTransition = async (hltId: string, newStatus: string) => {
    setProcessingId(hltId);
    setError(null);
    try {
      const res = await fetch(`/api/ssot/hlts/${hltId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      // Refresh list
      const updatedres = await fetch("/api/ssot/hlts");
      const updated = await updatedres.json();
      setHlts(updated.hlts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleGenerateDocs = async (hltId: string) => {
    setProcessingId(hltId);
    setError(null);
    try {
      const docTypes = ["term-sheet", "pds", "sa"];
      for (const docType of docTypes) {
        const res = await fetch(`/api/ssot/docs/${docType}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hlt_id: hltId }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: `Failed to generate ${docType}` }));
          throw new Error(data.error || `Failed to generate ${docType}`);
        }
      }

      // Refresh list
      const updatedres = await fetch("/api/ssot/hlts");
      const updated = await updatedres.json();
      setHlts(updated.hlts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/ssot/hlts").then((res) => res.json()),
      fetch("/api/ssot/horses").then((res) => res.json()),
      fetch("/api/ssot/owners").then((res) => res.json()),
      fetch("/api/ssot/trainers").then((res) => res.json()),
    ])
      .then(([hltsData, horsesData, ownersData, trainersData]) => {
        setHlts(hltsData.hlts || []);
        setHorses(horsesData.horses || []);
        setOwners(ownersData.owners || []);
        setTrainers(trainersData.trainers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/ssot/hlts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create HLT");
      }

      const created = await res.json();
      setHlts([...hlts, created]);
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <AdminLoading message="Loading HLTs..." />;
  }

  const columns = [
    { key: "horse", header: "Horse", render: (hlt: HLT) => hlt.horse_name || hlt.horse_microchip },
    { key: "owner", header: "Owner", render: (hlt: HLT) => hlt.owner_name || hlt.owner_id },
    { key: "trainer", header: "Trainer", render: (hlt: HLT) => hlt.trainer_name || hlt.trainer_id },
    {
      key: "status",
      header: "Status",
      render: (hlt: HLT) => (
        <AdminBadge value={hlt.status} variant="status" />
      ),
    },
    {
      key: "lease",
      header: "Lease",
      render: (hlt: HLT) => `${hlt.lease_period_months} months`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (hlt: HLT) => {
        const isProcessing = processingId === hlt.id;
        const docsGenerated = hlt.documents?.term_sheet?.gcs_url && hlt.documents?.pds?.gcs_url && hlt.documents?.sa?.gcs_url;

        return (
          <div className="flex items-center gap-3">
            {hlt.status === "draft" && (
              <AdminButton
                size="sm"
                onClick={() => handleTransition(hlt.id, "reviewed")}
                isLoading={isProcessing}
              >
                Mark Reviewed
              </AdminButton>
            )}
            {hlt.status === "reviewed" && (
              <>
                {!docsGenerated ? (
                  <AdminButton
                    size="sm"
                    variant="secondary"
                    onClick={() => handleGenerateDocs(hlt.id)}
                    isLoading={isProcessing}
                  >
                    Generate Legal Docs
                  </AdminButton>
                ) : (
                  <AdminButton
                    size="sm"
                    onClick={() => handleTransition(hlt.id, "publish_ready")}
                    isLoading={isProcessing}
                  >
                    Mark Publish Ready
                  </AdminButton>
                )}
              </>
            )}
            {hlt.status === "publish_ready" && (
              <AdminButton
                size="sm"
                onClick={() => handleTransition(hlt.id, "published")}
                isLoading={isProcessing}
              >
                Publish to Marketplace
              </AdminButton>
            )}
            {hlt.status === "published" && (
              <span className="text-xs text-muted">Published & Active</span>
            )}
            {docsGenerated && (
              <span className="text-xs text-success-text font-medium" title="Term Sheet, PDS, SA available">
                ✓ Docs OK
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">HLTs</h1>
        <AdminButton onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ New HLT"}
        </AdminButton>
      </div>

      {showAddForm && (
        <div className="rounded-xl border border-white/[0.06] bg-panel p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text">
              {error}
            </div>
          )}
          <AdminForm onSubmit={handleSubmit} spacing="tight">
            <div className="grid grid-cols-3 gap-4">
              <AdminSelect
                label="Horse"
                value={form.horse_microchip}
                onChange={(e) => setForm({ ...form, horse_microchip: e.target.value })}
                options={[
                  { value: "", label: "Select Horse" },
                  ...horses.map((h) => ({ value: h.microchip, label: h.name })),
                ]}
              />
              <AdminSelect
                label="Owner"
                value={form.owner_id}
                onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
                options={[
                  { value: "", label: "Select Owner" },
                  ...owners.map((o) => ({ value: o.id, label: o.name })),
                ]}
              />
              <AdminSelect
                label="Trainer"
                value={form.trainer_id}
                onChange={(e) => setForm({ ...form, trainer_id: e.target.value })}
                options={[
                  { value: "", label: "Select Trainer" },
                  ...trainers.map((t) => ({ value: t.id, label: t.name })),
                ]}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <AdminInput
                label="Lease Months"
                type="number"
                value={form.lease_period_months.toString()}
                onChange={(e) => setForm({ ...form, lease_period_months: parseInt(e.target.value) })}
              />
              <AdminInput
                label="Start Date"
                type="date"
                value={form.lease_start_date}
                onChange={(e) => setForm({ ...form, lease_start_date: e.target.value })}
              />
              <AdminInput
                label="Stake %"
                type="number"
                value={form.leasehold_stake_percentage.toString()}
                onChange={(e) => setForm({ ...form, leasehold_stake_percentage: parseInt(e.target.value) })}
              />
            </div>
            <div className="pt-4">
              <AdminButton type="submit" isLoading={creating}>
                {creating ? "Creating..." : "Create HLT"}
              </AdminButton>
            </div>
          </AdminForm>
        </div>
      )}

      {hlts.length === 0 ? (
        <AdminEmptyState message="No HLTs yet." />
      ) : (
        <AdminTable columns={columns} data={hlts} />
      )}
    </div>
  );
}
