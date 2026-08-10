"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { AdminButton, AdminInput, AdminSelect, AdminForm, AdminBadge, AdminEmptyState } from "@/components/admin";
// DORMANT: was import { uploadAsset } from "@/lib/api";
// Admin is dormant — GCP backend retired. This function hits dead endpoints.

interface UploadResult {
  name: string;
  success: boolean;
  data?: any;
  error?: string;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export default function UploadPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [entityType, setEntityType] = useState("horse");
  const [entityId, setEntityId] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return `${file.name}: Unsupported file type. Allowed: images (jpg, png, webp) and videos (mp4, mov)`;
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      const maxMB = isImage ? MAX_IMAGE_SIZE / 1024 / 1024 : MAX_VIDEO_SIZE / 1024 / 1024;
      return `${file.name}: File too large (${sizeMB}MB). Max: ${maxMB}MB`;
    }

    return null;
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const errors: string[] = [];
    const validFiles = Array.from(selectedFiles).filter(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
        return false;
      }
      return true;
    });

    setValidationErrors(errors);
    
    // Create a FileList-like object from valid files
    const dataTransfer = new DataTransfer();
    validFiles.forEach(file => dataTransfer.items.add(file));
    setFiles(dataTransfer.files);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;
    if (!entityId) {
      setError("Entity ID is required");
      return;
    }

    setUploading(true);
    setError(null);
    setResults([]);
    setValidationErrors([]);

    const uploaded: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entity_type", entityType);
      formData.append("entity_id", entityId);
      if (tags) formData.append("tags", tags);

      try {
        // DORMANT: uploadAsset() hit the retired GCP assets endpoint.
        throw new Error("Admin is dormant — asset upload is unavailable (GCP backend retired).");
      } catch (err: any) {
        uploaded.push({ name: file.name, success: false, error: err.message });
      }
    }

    setResults(uploaded);
    setUploading(false);
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Bulk Upload</h1>
        <Link href="/admin/assets" className="text-sm text-muted hover:text-foreground">
          ← Back to Assets
        </Link>
      </div>

      <AdminForm onSubmit={handleSubmit} className="mt-8">
        {error && (
          <div className="rounded-lg border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text">
            {error}
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="rounded-lg border border-warning-border bg-warning-bg px-4 py-3 space-y-1">
            {validationErrors.map((err, i) => (
              <p key={i} className="text-sm text-warning-text">{err}</p>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-dashed border-white/[0.12] bg-panel p-8 text-center">
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            accept={ALLOWED_IMAGE_TYPES.concat(ALLOWED_VIDEO_TYPES).join(",")}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-4xl">📁</div>
            <p className="mt-2 text-sm text-foreground">Click to select files</p>
            <p className="text-xs text-muted">Or drag and drop here</p>
            <p className="mt-1 text-xs text-muted">
              Images: jpg, png, webp (max 10MB) • Video: mp4, mov (max 100MB)
            </p>
          </label>
          {files && files.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-gold">{files.length} file{files.length !== 1 ? "s" : ""} selected</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {Array.from(files).map((file, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-muted">
                    {file.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AdminSelect
            label="Entity Type"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            options={[
              { value: "horse", label: "Horse" },
              { value: "owner", label: "Owner" },
              { value: "trainer", label: "Trainer" },
              { value: "hlt", label: "HLT" },
            ]}
          />
          <AdminInput
            required
            label="Entity ID"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            placeholder={entityType === "horse" ? "Microchip (e.g. 985125000126462)" : "Entity ID"}
          />
        </div>

        <AdminInput
          label="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="training, morning, paddock"
        />

        <div className="flex items-center gap-4 pt-4">
          <AdminButton type="submit" isLoading={uploading}>
            {uploading ? "Uploading..." : `Upload ${files?.length || 0} file${files?.length !== 1 ? "s" : ""}`}
          </AdminButton>
          <Link href="/admin/assets" className="text-sm text-muted hover:text-foreground">
            Cancel
          </Link>
        </div>
      </AdminForm>

      {results.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-semibold text-foreground">Upload Results</h2>
            {successCount > 0 && (
              <AdminBadge value={`${successCount} successful`} variant="default" size="sm" />
            )}
            {failCount > 0 && (
              <AdminBadge value={`${failCount} failed`} variant="default" size="sm" />
            )}
          </div>

          <div className="space-y-2">
            {results.map((result, i) => (
              <div
                key={i}
                className={`rounded-lg border px-4 py-3 ${
                  result.success
                    ? "border-success-border bg-success-bg"
                    : "border-error-border bg-error-bg"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${result.success ? "text-success-text" : "text-error-text"}`}>
                    {result.name}
                  </p>
                  {result.success ? (
                    <span className="text-xs text-success-text">✓ Uploaded</span>
                  ) : (
                    <span className="text-xs text-error-text">✗ {result.error}</span>
                  )}
                </div>
                {result.success && result.data?.public_url && (
                  <a
                    href={result.data.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs text-gold hover:underline"
                  >
                    View file →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !files && (
        <AdminEmptyState
          message="No files uploaded yet."
          icon="📤"
        />
      )}
    </div>
  );
}
