"use client";

import { useEffect, useState } from "react";
import { AdminButton, AdminInput, AdminForm, AdminTable, AdminEmptyState } from "@/components/admin";

interface Trainer {
  id: string;
  name: string;
  stable_name: string;
  location: string;
  email: string;
  phone: string | null;
  nztr_license_number: string | null;
}

export default function TrainersListPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    stable_name: "",
    location: "",
    email: "",
    phone: "",
    nztr_license_number: "",
  });

  useEffect(() => {
    fetch("/api/ssot/trainers")
      .then((res) => res.json())
      .then((data) => {
        setTrainers(data.trainers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const payload: any = {
        name: form.name,
        stable_name: form.stable_name,
        location: form.location,
        email: form.email,
      };
      if (form.phone) payload.phone = form.phone;
      if (form.nztr_license_number) payload.nztr_license_number = form.nztr_license_number;

      const res = await fetch("/api/ssot/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create trainer");
      }

      const created = await res.json();
      setTrainers([...trainers, created]);
      setShowAddForm(false);
      setForm({ name: "", stable_name: "", location: "", email: "", phone: "", nztr_license_number: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-muted">Loading trainers...</div>
      </div>
    );
  }

  const columns = [
    { key: "name", header: "Name", render: (t: Trainer) => <span className="font-medium text-foreground">{t.name}</span> },
    { key: "stable_name", header: "Stable" },
    { key: "location", header: "Location" },
    { key: "email", header: "Email" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Trainers</h1>
        <AdminButton onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Add Trainer"}
        </AdminButton>
      </div>

      {showAddForm && (
        <AdminForm onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <AdminInput
              required
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Smith"
            />
            <AdminInput
              required
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@stable.co.nz"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput
              label="Stable Name"
              value={form.stable_name}
              onChange={(e) => setForm({ ...form, stable_name: e.target.value })}
              placeholder="Smith Stables"
            />
            <AdminInput
              label="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Auckland, NZ"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminInput
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+64 21 123 4567"
            />
            <AdminInput
              label="NZTR License Number"
              value={form.nztr_license_number}
              onChange={(e) => setForm({ ...form, nztr_license_number: e.target.value })}
              placeholder="T12345"
            />
          </div>
          <div className="flex justify-end">
            <AdminButton type="submit" isLoading={creating}>
              {creating ? "Creating..." : "Create Trainer"}
            </AdminButton>
          </div>
        </AdminForm>
      )}

      {trainers.length === 0 ? (
        <AdminEmptyState
          message="No trainers yet."
          action={{ label: "Add your first trainer", onClick: () => setShowAddForm(true) }}
        />
      ) : (
        <AdminTable columns={columns} data={trainers} />
      )}
    </div>
  );
}
