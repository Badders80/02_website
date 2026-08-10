"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminButton, AdminEmptyState, AdminBadge } from "@/components/admin";

interface Asset {
  id: string;
  entity_type: string;
  entity_id: string;
  file_name: string;
  gcs_url: string;
  content_type: string;
  size_bytes: number;
  tags: string[];
  uploaded_at: string;
}

export default function AssetsListPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "horse" | "owner" | "trainer" | "hlt">("all");
  const [entitySearch, setEntitySearch] = useState("");

  useEffect(() => {
    fetch("/api/assets/retrieve")
      .then((res) => res.json())
      .then((data) => {
        setAssets(data.assets || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load assets");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (assetId: string) => {
    if (!confirm("Delete this asset?")) return;
    try {
      const res = await fetch(`/api/assets/delete?asset_id=${assetId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredAssets = filter === "all" ? assets : assets.filter((a) => a.entity_type === filter);
  const searchedAssets = entitySearch
    ? filteredAssets.filter(
        (a) =>
          a.entity_id.toLowerCase().includes(entitySearch.toLowerCase()) ||
          a.file_name.toLowerCase().includes(entitySearch.toLowerCase()) ||
          (a.tags || []).some((t) => t.toLowerCase().includes(entitySearch.toLowerCase()))
      )
    : filteredAssets;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-muted">Loading assets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Content Repository</h1>
          <p className="mt-1 text-sm text-muted">{assets.length} asset{assets.length !== 1 ? "s" : ""} in the repository</p>
        </div>
        <Link href="/admin/assets/upload">
          <AdminButton>+ Bulk Upload</AdminButton>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {(["all", "horse", "owner", "trainer", "hlt"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-gold text-black"
                  : "border border-white/[0.06] bg-panel text-muted hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by entity, filename, or tag..."
          value={entitySearch}
          onChange={(e) => setEntitySearch(e.target.value)}
          className="rounded-lg border border-white/[0.06] bg-panel px-3 py-1.5 text-sm text-foreground placeholder-muted focus:border-gold focus:outline-none"
        />
      </div>

      {searchedAssets.length === 0 ? (
        <AdminEmptyState message="No assets match your filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {searchedAssets.map((asset) => (
            <div key={asset.id} className="rounded-xl border border-white/[0.06] bg-panel p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{asset.file_name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {asset.entity_type} / {asset.entity_id}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(asset.id)}
                  className="ml-2 rounded-lg p-1 text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <span>{formatBytes(asset.size_bytes)}</span>
                <span>•</span>
                <span className="uppercase">{asset.content_type.split("/")[1]}</span>
              </div>
              {asset.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {asset.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <a
                href={asset.gcs_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-xs text-gold hover:underline"
              >
                View →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
