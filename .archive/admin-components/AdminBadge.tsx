"use client";

import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "status" | "role" | "kyc";
export type BadgeSize = "sm" | "md";

interface AdminBadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  value: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  draft: "bg-status-draft text-status-draft-text",
  reviewed: "bg-status-reviewed text-status-reviewed-text",
  publish_ready: "bg-status-publish-ready text-status-publish-ready-text",
  published: "bg-status-published text-status-published-text",
};

const roleStyles: Record<string, string> = {
  admin: "bg-role-admin text-role-admin-text",
  investor: "bg-role-investor text-role-investor-text",
  viewer: "bg-role-viewer text-role-viewer-text",
};

const kycStyles: Record<string, string> = {
  verified: "bg-kyc-verified text-kyc-verified-text",
  pending: "bg-kyc-pending text-kyc-pending-text",
  requires_input: "bg-kyc-requires-input text-kyc-requires-input-text",
  canceled: "bg-kyc-canceled text-kyc-canceled-text",
  none: "bg-kyc-none text-kyc-none-text",
};

export function AdminBadge({ variant = "default", size = "sm", value, className }: AdminBadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full font-medium";
  
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };
  
  const variantStyles = {
    default: "bg-white/[0.04] text-muted",
    status: statusStyles[value] || "bg-white/[0.04] text-muted",
    role: roleStyles[value] || "bg-white/[0.04] text-muted",
    kyc: kycStyles[value] || "bg-white/[0.04] text-muted",
  };
  
  const displayValue = variant === "status" || variant === "role" || variant === "kyc"
    ? value.replace(/_/g, " ")
    : value;
  
  return (
    <span className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}>
      {displayValue}
    </span>
  );
}

export default AdminBadge;
