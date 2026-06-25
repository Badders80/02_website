"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

function UploadForm() {
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<FileList | null>(null);
  const [entityType, setEntityType] = useState(searchParams.get("entity_type") || "horse");
  const [entityId, setEntityId] = useState(searchParams.get("entity_id") || "");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const type = searchParams.get("entity_type");
    const id = searchParams.get("entity_id");
    if (type) setEntityType(type);
    if (id) setEntityId(id);
  }, [searchParams]);

  const validateFile = (file: File): string | null => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    if (!isImage && !isVideo) {
      return `${file.name}: Unsupported file type`;
    }
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      return `${file.name}: File too large (${sizeMB}MB)`;
    }
    return null;
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    const errors: string[] = [];
    const validFiles = Array.from(selectedFiles).filter(file => {
      const err = validateFile(file);
      if (err) { errors.push(err); return false; }
      return true;
    });
    setValidationErrors(errors);
    const dt = new DataTransfer();
    validFiles.forEach(f => dt.items.add(f));
    setFiles(dt.files);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files?.length || !entityId) return;
    setUploading(true);
    setError(null);
    const uploaded: UploadResult[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("entity_type", entityType);
      fd.append("entity_id", entityId);
      if (tags) fd.append("tags", tags);
      try {
        const data = await uploadAsset(fd);
        uploaded.push({ name: file.name, success: true, data });
      } catch (err: any) {
        uploaded.push({ name: file.name, success: false, error: err.message });
      }
    }
    setResults(uploaded);
    setUploading(false);
  };

  const ok = results.filter(r => r.success).length;
  const fail = results.filter(r => !r.success).length;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Bulk Upload</h1>
        <Link href="/admin/assets" className="text-sm text-muted hover:text-foreground">← Back</Link>
      </div>

      <AdminForm onSubmit={handleSubmit}>
        {error && <div className="rounded-lg border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text">{error}</div>}
        {validationErrors.length > 0 && (
          <div className="rounded-lg border border-warning-border bg-warning-bg px-4 py-3 space-y-1">
            {validationErrors.map((err, i) => <p key={i} className="text-sm text-warning-text">{err}</p>)}
          </div>
        )}

        <div className="rounded-xl border border-dashed border-white/[0.12] bg-panel p-8 text-center">
          <input type="file" multiple onChange={handleFileSelect} className="hidden" id="file-upload" accept={ALLOWED_IMAGE_TYPES.concat(ALLOWED_VIDEO_TYPES).join(",")} />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-4xl">📁</div>
            <p className="mt-2 text-sm text-foreground">Click to select files</p>
            <p className="text-xs text-muted">Images: jpg/png/webp (10MB) • Video: mp4/mov (100MB)</p>
          </label>
          {files?.length ? (
            <div className="mt-3">
              <p className="text-sm text-gold">{files.length} file(s) selected</p>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {Array.from(files).map((f, i) => <span key={i} className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-muted">{f.name}</span>)}
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AdminSelect label="Entity Type" value={entityType} onChange={(e) => setEntityType(e.target.value)} options={[
            { value: "horse", label: "Horse" }, { value: "owner", label: "Owner" },
            { value: "trainer", label: "Trainer" }, { value: "hlt", label: "HLT" },
          ]} />
          <AdminInput required label="Entity ID" value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder={entityType === "horse" ? "Microchip" : "Entity ID"} />
        </div>

        <AdminInput label="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="training, morning" />

        <div className="flex items-center gap-4 pt-4">
          <AdminButton type="submit" isLoading={uploading}>{uploading ? "Uploading..." : `Upload ${files?.length || 0} file(s)`}</AdminButton>
          <Link href="/admin/assets" className="text-sm text-muted hover:text-foreground">Cancel</Link>
        </div>
      </AdminForm>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-semibold text-foreground">Results</h2>
            {ok > 0 && <AdminBadge value={`${ok} ok`} variant="default" size="sm" />}
            {fail > 0 && <AdminBadge value={`${fail} failed`} variant="default" size="sm" />}
          </div>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className={`rounded-lg border px-4 py-3 ${r.success ? "border-success-border bg-success-bg" : "border-error-border bg-error-bg"}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${r.success ? "text-success-text" : "text-error-text"}`}>{r.name}</p>
                  {r.success ? <span className="text-xs text-success-text">✓</span> : <span className="text-xs text-error-text">✗ {r.error}</span>}
                </div>
                {r.success && r.data?.public_url && <a href={r.data.public_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-gold hover:underline">View →</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      {!results.length && !files && <AdminEmptyState message="No files uploaded yet." icon="📤" />}
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading...</div>}>
      <UploadForm />
    </Suspense>
  );
}
