"use client";

import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string; disabled?: boolean }[];
}

const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ label, error, hint, options, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "mt-1 block w-full rounded-lg border border-white/[0.06] bg-panel px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error-border focus:border-error-border focus:ring-error-border/20",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
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

AdminSelect.displayName = "AdminSelect";

export default AdminSelect;
