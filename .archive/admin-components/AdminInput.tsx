"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "mt-1 block w-full rounded-lg border border-white/[0.06] bg-panel px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error-border focus:border-error-border focus:ring-error-border/20",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1 text-xs text-muted">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-error-text">{error}</p>
        )}
      </div>
    );
  }
);

AdminInput.displayName = "AdminInput";

export default AdminInput;
