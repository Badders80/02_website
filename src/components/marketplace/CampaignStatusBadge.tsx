import { STATUS_INFO, type CampaignStatus } from "@/lib/campaign-status";

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
  className?: string;
}

export function CampaignStatusBadge({ status, className = "" }: CampaignStatusBadgeProps) {
  const statusInfo = STATUS_INFO[status] ?? STATUS_INFO.coming_soon;

  return (
    <div
      className={`inline-flex items-center gap-2 border rounded-full px-3 py-1.5 ${statusInfo.badgeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
      <span className="text-[9px] uppercase tracking-widest font-medium">
        {statusInfo.label}
      </span>
    </div>
  );
}