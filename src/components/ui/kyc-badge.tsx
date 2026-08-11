import { Badge } from "./badge"

export type KycStatus = "verified" | "pending" | "requires-input" | "canceled" | "none"

const kycConfig: Record<
  KycStatus,
  { variant: "success" | "warning" | "destructive" | "default" | "outline"; label: string }
> = {
  verified: { variant: "success", label: "Verified" },
  pending: { variant: "warning", label: "Pending" },
  "requires-input": { variant: "warning", label: "Action Required" },
  canceled: { variant: "destructive", label: "Canceled" },
  none: { variant: "outline", label: "Not Started" },
}

export function KycBadge({ status, className }: { status: KycStatus; className?: string }) {
  const config = kycConfig[status] ?? kycConfig.none
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}