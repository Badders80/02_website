"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface AdminStatProps {
  label: string;
  value: number | string;
  href?: string;
  loading?: boolean;
  className?: string;
}

export function AdminStat({ label, value, href, loading, className }: AdminStatProps) {
  const baseStyles = "rounded-xl border border-white/[0.06] bg-panel p-4";
  const hoverStyles = href ? "transition-colors hover:border-gold/30" : "";
  
  const content = (
    <>
      <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
      <p className={cn("mt-2 text-2xl font-bold text-foreground", loading && "animate-pulse")}>
        {loading ? "—" : value}
      </p>
    </>
  );
  
  if (href) {
    return (
      <Link href={href} className={cn(baseStyles, hoverStyles, className)}>
        {content}
      </Link>
    );
  }
  
  return (
    <div className={cn(baseStyles, hoverStyles, className)}>
      {content}
    </div>
  );
}

export default AdminStat;
