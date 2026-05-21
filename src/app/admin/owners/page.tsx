"use client";

import { useEffect, useState } from "react";
import { AdminButton, AdminInput, AdminSelect, AdminForm, AdminTable, AdminEmptyState, AdminBadge } from "@/components/admin";

interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  type: "individual" | "syndicate" | "corporate";
  address: string | null;
  bank_account: string | null;
  ird_number: string | null;
}

export default function OwnersListPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "individual" as "individual" | "syndicate" | "corporate",
    address: "",
    bank_account: "",
    ird_number: "",
  });

  useEffect(() => {
    fetch("/api/ssot/owners")
      .then((res) => res.json())
      .then((data) => {
        setOwners(data.owners || []);
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
        email: form.email,
        type: form.type,
      };
      if (form.phone) payload.phone = form.phone;
      if (form.address) payload.address = form.address;
      if (form.bank_account) payload.bank_account = form.bank_account;
      if (form.ird_number) payload.ird_number = form.ird_number;

      const res = await fetch("/api/ssot/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create owner");
      }

      const created = await res.json();
      setOwners([...owners, created]);
      setShowAddForm(false);
      setForm({ name: "", email: "", phone: "", type: "individual", address: "", bank_account: "", ird_number: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-muted">Loading owners...</div>
      </div>
    );
  }

  const columns = [
    { key: "name", header: "Name", render: (o: Owner) => <span className="font-medium text-foreground">{o.name}</span> },
    { key: "email", header: "Email" },
    { key: "type", header: "Type", render: (o: Owner) => <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-xs text-muted capitalize">{o.type}</span> },
    { key: "phone", header: "Phone" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Owners</h1>
        <AdminButton onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Add Owner"}
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
              type="email"
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <AdminInput
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+64 21 123 4567"
            />
            <AdminSelect
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as any })}
              options={[
                { value: "individual", label: "Individual" },
                { value: "syndicate", label: "Syndicate" },
                { value: "corporate", label: "Corporate" },
              ]}
            />
            <AdminInput
              label="IRD Number"
              value={form.ird_number}
              onChange={(e) => setForm({ ...form, ird_number: e.target.value })}
              placeholder="123-456-789"
            />
          </div>
          <AdminInput
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="123 Main St, Auckland"
          />
          <AdminInput
            label="Bank Account"
            value={form.bank_account}
            onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
            placeholder="01-1234-567890-00"
          />
          <div className="flex justify-end">
            <AdminButton type="submit" isLoading={creating}>
              {creating ? "Creating..." : "Create Owner"}
            </AdminButton>
          </div>
        </AdminForm>
      )}

      {owners.length === 0 ? (
        <AdminEmptyState
          message="No owners yet."
          action={{ label: "Add your first owner", onClick: () => setShowAddForm(true) }}
        />
      ) : (
        <AdminTable columns={columns} data={owners} />
      )}
    </div>
  );
}
