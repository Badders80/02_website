"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  href?: string;
}

const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, href, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "rounded-full bg-gold text-black hover:bg-gold-hover focus:ring-gold",
      secondary: "rounded-lg border border-white/[0.06] bg-white/[0.04] text-foreground hover:bg-white/[0.08]",
      ghost: "rounded-lg text-xs text-muted hover:bg-white/[0.04] hover:text-foreground",
      danger: "rounded-lg p-1 text-muted hover:bg-red-500/10 hover:text-red-400",
    };
    
    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-2.5 text-sm",
    };
    
    const content = (
      <>
        {isLoading && (
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </>
    );
    
    if (href) {
      return (
        <Link href={href} className={cn(baseStyles, variants[variant], sizes[size], className)}>
          {content}
        </Link>
      );
    }
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

AdminButton.displayName = "AdminButton";

export default AdminButton;
