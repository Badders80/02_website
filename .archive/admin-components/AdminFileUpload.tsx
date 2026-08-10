"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { useDropzone, DropEvent, FileRejection } from "react-dropzone";

interface AdminFileUploadProps {
  onFilesAccepted: (files: File[]) => void;
  onFilesRejected?: (files: FileRejection[]) => void;
  accept?: Record<string, string[]>;
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AdminFileUpload({
  onFilesAccepted,
  onFilesRejected,
  accept = { "image/*": [".jpg", ".jpeg", ".png", ".webp"], "video/*": [".mp4", ".mov"] },
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  multiple = true,
  disabled = false,
  className,
}: AdminFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        onFilesAccepted(acceptedFiles);
      }
      
      if (rejectedFiles.length > 0 && onFilesRejected) {
        onFilesRejected(rejectedFiles);
      }
      
      setIsDragOver(false);
    },
    [onFilesAccepted, onFilesRejected]
  );
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxFileSize,
    maxFiles,
    multiple,
    disabled,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    onDropAccepted: () => setIsDragOver(false),
  });
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };
  
  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors",
        isDragOver || isDragActive
          ? "border-gold bg-gold/5"
          : "border-white/[0.06] bg-panel hover:border-white/[0.12]",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input {...getInputProps()} />
      
      <div className="mb-4 text-4xl">📁</div>
      
      {isDragOver || isDragActive ? (
        <div>
          <p className="text-sm font-semibold text-gold">Drop files here</p>
          <p className="mt-1 text-xs text-muted">Release to upload</p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-medium text-foreground">
            {multiple ? "Drag & drop files here, or click to select" : "Click to select a file"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {Object.keys(accept).includes("image/*") && "Images: JPG, PNG, WebP"}
            {Object.keys(accept).includes("video/*") && " Videos: MP4, MOV"}
            {maxFileSize && ` • Max: ${formatFileSize(maxFileSize)}`}
            {maxFiles > 1 && ` • Max ${maxFiles} files`}
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminFileUpload;
