"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import AdminButton from "./AdminButton";

interface AdminEmptyStateProps {
  message: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  icon?: ReactNode;
  className?: string;
}

export function AdminEmptyState({ message, action, icon, className }: AdminEmptyStateProps) {
  return (
    <div className={cn("mt-12 rounded-2xl border border-white/[0.06] bg-panel p-12 text-center", className)}>
      {icon && <div className="mb-4 text-4xl">{icon}</div>}
      <p className="text-muted">{message}</p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="mt-4 inline-block text-gold underline hover:text-gold-hover"
          >
            {action.label}
          </Link>
        ) : (
          <div className="mt-4">
            <AdminButton onClick={action.onClick} size="sm">
              {action.label}
            </AdminButton>
          </div>
        )
      )}
    </div>
  );
}

export default AdminEmptyState;
