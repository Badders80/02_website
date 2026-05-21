"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AdminCardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  hover?: boolean;
}

export function AdminCard({ children, className, href, hover = true }: AdminCardProps) {
  const baseStyles = "rounded-xl border border-white/[0.06] bg-panel p-6";
  const hoverStyles = hover ? "transition-colors hover:border-gold/30" : "";
  
  if (href) {
    return (
      <Link href={href} className={cn(baseStyles, hoverStyles, className)}>
        {children}
      </Link>
    );
  }
  
  return (
    <div className={cn(baseStyles, hoverStyles, className)}>
      {children}
    </div>
  );
}

export default AdminCard;
