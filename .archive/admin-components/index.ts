/**
 * Evolution Stables — Admin Primitives
 * 
 * Reusable UI components for admin pages.
 * All components use the canonical design tokens from `@/lib/tokens`.
 */

export { default as AdminButton } from "./AdminButton";
export type { AdminButtonProps } from "./AdminButton";

export { AdminBadge } from "./AdminBadge";
export type { BadgeVariant, BadgeSize } from "./AdminBadge";

export { default as AdminInput } from "./AdminInput";
export type { AdminInputProps } from "./AdminInput";

export { default as AdminSelect } from "./AdminSelect";
export type { AdminSelectProps } from "./AdminSelect";

export { AdminForm } from "./AdminForm";

export { AdminTable } from "./AdminTable";
export type { Column } from "./AdminTable";

export { AdminCard } from "./AdminCard";
export { AdminStat } from "./AdminStat";
export { AdminEmptyState } from "./AdminEmptyState";
export { AdminLoading } from "./AdminLoading";
export { AdminFileUpload } from "./AdminFileUpload";
