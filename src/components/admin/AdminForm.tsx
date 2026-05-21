"use client";

import { FormEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminFormProps {
  children: ReactNode;
  onSubmit: (e: FormEvent) => void | Promise<void>;
  className?: string;
  spacing?: "tight" | "base" | "large";
}

export function AdminForm({ children, onSubmit, className, spacing = "base" }: AdminFormProps) {
  const spacingStyles = {
    tight: "space-y-4",
    base: "space-y-6",
    large: "space-y-8",
  };
  
  return (
    <form
      onSubmit={onSubmit}
      className={cn("w-full", spacingStyles[spacing], className)}
    >
      {children}
    </form>
  );
}

export default AdminForm;
