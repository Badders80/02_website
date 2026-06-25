"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminButton, AdminBadge, AdminEmptyState, AdminLoading } from "@/components/admin";
// DORMANT: was import { getHorseByMicrochip, retrieveAssets } from "@/lib/api";
// Admin is dormant — GCP backend retired. These functions hit dead endpoints.

interface Horse {
  microchip: string;
  name: string;
  foaling_date: string;
  sex: string;
  colour: string;
  sire_name?: string;
  dam_name?: string;
  breeder?: string;
  left_shoulder_brand?: string;
  right_shoulder_brand?: string;
  status: string;
  image_url?: string | null;
  age?: number;
  loveracing_ref?: {
    loveracing_id: number;
    name_slug: string;
    source_url: string;
  };
}

interface Asset {
  id: string;
  file_name: string;
  public_url: string;
  thumbnail_url?: string | null;
  asset_type: string;
  content_type?: string;
  tags?: string[];
  uploaded_at: string;
}

export default function HorseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const microchip = params.microchip as string;

  const [horse, setHorse] = useState<Horse | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!microchip) return;

    Promise.all([
      getHorseByMicrochip(microchip).catch(() => null),
      retrieveAssets("horse", microchip).catch(() => ({ assets: [] })),
    ])
      .then(([horseData, assetsData]) => {
        setHorse(horseData);
        setAssets(assetsData.assets || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [microchip]);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-10 w-64 rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="h-4 w-40 rounded bg-white/[0.04] animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="h-10 w-32 rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="h-10 w-28 rounded-xl bg-white/[0.04] animate-pulse" />
          </div>
        </div>

        {/* Info Grid Skeleton */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-panel p-4">
              <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse" />
              <div className="mt-3 h-5 w-24 rounded bg-white/[0.04] animate-pulse" />
            </div>
          ))}
        </div>

        {/* Gallery Skeleton */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-24 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-4 w-16 rounded bg-white/[0.04] animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl border border-white/[0.06] bg-panel animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div className="mx-auto max-w-2xl">
        <AdminEmptyState
          message={error || "Horse not found"}
          action={{ label: "Back to Horses", href: "/admin/horses" }}
        />
      </div>
    );
  }

  const images = assets.filter((a) => a.asset_type === "image");
  const videos = assets.filter((a) => a.content_type?.startsWith("video/"));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-foreground">{horse.name}</h1>
            <AdminBadge value={horse.status} variant="default" />
          </div>
          <p className="mt-1 text-sm text-muted">Microchip: {horse.microchip}</p>
          {horse.loveracing_ref && (
            <a
              href={horse.loveracing_ref.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gold hover:underline"
            >
              View on loveracing.nz →
            </a>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/horses/edit?microchip=${microchip}`}>
            <AdminButton variant="secondary">✏️ Edit Horse</AdminButton>
          </Link>
          <Link href={`/admin/assets/upload?entity_type=horse&entity_id=${microchip}`}>
            <AdminButton variant="secondary">+ Upload Image</AdminButton>
          </Link>
          <Link href="/admin/horses">
            <AdminButton variant="ghost">Back to List</AdminButton>
          </Link>
        </div>
      </div>

      {/* Horse Info */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-panel p-4">
          <p className="text-xs text-muted">Sex</p>
          <p className="mt-1 font-medium text-foreground capitalize">{horse.sex}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-panel p-4">
          <p className="text-xs text-muted">Colour</p>
          <p className="mt-1 font-medium text-foreground capitalize">{horse.colour || "—"}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-panel p-4">
          <p className="text-xs text-muted">Foaling Date</p>
          <p className="mt-1 font-medium text-foreground">
            {horse.foaling_date ? new Date(horse.foaling_date).toLocaleDateString() : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-panel p-4">
          <p className="text-xs text-muted">Sire</p>
          <p className="mt-1 font-medium text-foreground">{horse.sire_name || "—"}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-panel p-4">
          <p className="text-xs text-muted">Dam</p>
          <p className="mt-1 font-medium text-foreground">{horse.dam_name || "—"}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-panel p-4">
          <p className="text-xs text-muted">Breeder</p>
          <p className="mt-1 font-medium text-foreground">{horse.breeder || "—"}</p>
        </div>
        {horse.left_shoulder_brand && (
          <div className="rounded-xl border border-white/[0.06] bg-panel p-4">
            <p className="text-xs text-muted">Left Shoulder</p>
            <p className="mt-1 font-medium text-foreground">{horse.left_shoulder_brand}</p>
          </div>
        )}
        {horse.right_shoulder_brand && (
          <div className="rounded-xl border border-white/[0.06] bg-panel p-4">
            <p className="text-xs text-muted">Right Shoulder</p>
            <p className="mt-1 font-medium text-foreground">{horse.right_shoulder_brand}</p>
          </div>
        )}
      </div>

      {/* Image Gallery */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">Images</h2>
          <p className="text-sm text-muted">{images.length} image{images.length !== 1 ? "s" : ""}</p>
        </div>

        {images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.06] bg-panel p-12 text-center">
            <p className="text-muted">No images yet</p>
            <Link
              href={`/admin/assets/upload?entity_type=horse&entity_id=${microchip}`}
              className="mt-2 inline-block text-sm text-gold hover:underline"
            >
              Upload your first image →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img.public_url)}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-panel"
              >
                <img
                  src={img.thumbnail_url || img.public_url}
                  alt={img.file_name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-black">
                      View
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Videos */}
      {videos.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">Videos</h2>
            <p className="text-sm text-muted">{videos.length} video{videos.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {videos.map((vid) => (
              <div key={vid.id} className="rounded-xl border border-white/[0.06] bg-panel p-4">
                <video
                  controls
                  className="w-full rounded-lg"
                  src={vid.public_url}
                />
                <p className="mt-2 text-sm font-medium text-foreground">{vid.file_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-full max-w-full">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-h-[90vh] max-w-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
