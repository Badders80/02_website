"use client";

import { useState } from "react";
import { AdminButton, AdminInput, AdminSelect, AdminForm, AdminEmptyState, AdminBadge } from "@/components/admin";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function FAQAdminPage() {
  const [items, setItems] = useState<FAQItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    question: "",
    answer: "",
    category: "general",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: FAQItem = {
      id: Math.random().toString(36).slice(2),
      ...form,
    };
    setItems([...items, newItem]);
    setForm({ question: "", answer: "", category: "general" });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">FAQ Items</h1>
        <AdminButton onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add FAQ"}
        </AdminButton>
      </div>

      {showForm && (
        <AdminForm onSubmit={handleSubmit}>
          <AdminInput
            required
            label="Question"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            placeholder="What is..."
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Answer</label>
            <textarea
              required
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              className="w-full rounded-lg border border-white/[0.06] bg-panel px-3 py-2 text-sm text-foreground placeholder-muted focus:border-gold focus:outline-none"
              rows={4}
            />
          </div>
          <AdminSelect
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={[
              { value: "general", label: "General" },
              { value: "investment", label: "Investment" },
              { value: "horses", label: "Horses" },
              { value: "technical", label: "Technical" },
            ]}
          />
          <div className="flex justify-end">
            <AdminButton type="submit">Add FAQ</AdminButton>
          </div>
        </AdminForm>
      )}

      {items.length === 0 ? (
        <AdminEmptyState
          message="No FAQ items yet."
          action={{ label: "Add your first FAQ", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/[0.06] bg-panel p-4">
              <div className="flex items-center gap-2 mb-2">
                <AdminBadge value={item.category} variant="default" size="sm" />
              </div>
              <p className="font-medium text-foreground">{item.question}</p>
              <p className="mt-1 text-sm text-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
