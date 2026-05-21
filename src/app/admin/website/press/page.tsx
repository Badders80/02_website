"use client";

import { useState } from "react";
import { AdminButton, AdminInput, AdminForm, AdminEmptyState } from "@/components/admin";

interface PressArticle {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  excerpt: string;
}

export default function PressAdminPage() {
  const [articles, setArticles] = useState<PressArticle[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    source: "",
    date: "",
    url: "",
    excerpt: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newArticle: PressArticle = {
      id: Math.random().toString(36).slice(2),
      ...form,
    };
    setArticles([...articles, newArticle]);
    setForm({ title: "", source: "", date: "", url: "", excerpt: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Press Articles</h1>
        <AdminButton onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Article"}
        </AdminButton>
      </div>

      {showForm && (
        <AdminForm onSubmit={handleSubmit}>
          <AdminInput
            required
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Article title"
          />
          <div className="grid grid-cols-2 gap-4">
            <AdminInput
              required
              label="Source"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="NZ Herald"
            />
            <AdminInput
              required
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <AdminInput
            required
            label="URL"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://..."
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full rounded-lg border border-white/[0.06] bg-panel px-3 py-2 text-sm text-foreground placeholder-muted focus:border-gold focus:outline-none"
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <AdminButton type="submit">Add Article</AdminButton>
          </div>
        </AdminForm>
      )}

      {articles.length === 0 ? (
        <AdminEmptyState
          message="No press articles yet."
          action={{ label: "Add your first article", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="mt-4 space-y-3">
          {articles.map((a) => (
            <div key={a.id} className="rounded-xl border border-white/[0.06] bg-panel p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{a.title}</p>
                  <p className="mt-1 text-xs text-muted">{a.source} • {a.date}</p>
                </div>
                <a href={a.url} target="_blank" rel="noreferrer" className="text-xs text-gold hover:underline">
                  View →
                </a>
              </div>
              <p className="mt-2 text-sm text-muted">{a.excerpt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
