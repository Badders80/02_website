"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function AdminTable<T extends { id?: string | number }>({
  columns,
  data,
  emptyMessage = "No data available",
  className,
  onRowClick,
}: AdminTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="mt-12 rounded-2xl border border-white/[0.06] bg-panel p-12 text-center">
        <p className="text-muted">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className={cn("mt-8 overflow-hidden rounded-2xl border border-white/[0.06]", className)}>
      <table className="w-full">
        <thead className="border-b border-white/[0.06] bg-panel">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  "px-6 py-3 text-left text-xs font-medium uppercase text-muted",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {data.map((item, index) => (
            <tr
              key={item.id ?? index}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "transition-colors hover:bg-white/[0.02]",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={cn("px-6 py-4 text-sm", column.className)}
                >
                  {column.render
                    ? column.render(item)
                    : String(item[column.key as keyof T] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTable;
