import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import hltsData from "@/data/hlts.json";
import PurchaseFlow from "@/components/marketplace/PurchaseFlow";
import { getCampaignStatus } from "@/lib/campaign-status";
import {
  checkPurchaseEligibility,
  findStaticHlt,
  isPurchasesEnabled,
} from "@/lib/purchase-eligibility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PurchasePage({ params }: Props) {
  const { id } = await params;
  const hlt = findStaticHlt(hltsData as any[], id);

  if (!hlt) notFound();

  const pdsPath = path.join(process.cwd(), "public", "documents", id, "pds.pdf");
  const saPath = path.join(
    process.cwd(),
    "public",
    "documents",
    id,
    "sa.pdf"
  );
  const hasPds = fs.existsSync(pdsPath);
  const hasSa = fs.existsSync(saPath);

  // Server-side gate from static SSOT (no live sheet required for closed catalog)
  const eligibility = checkPurchaseEligibility(id, hlt, null, 1, {
    purchasesEnabled: isPurchasesEnabled(),
    requireLiveInventory: false,
  });
  const campaignStatus = getCampaignStatus(hlt);

  return (
    <PurchaseFlow
      horseName={(hlt as any).horse_name || "Racehorse"}
      horseSlug={id}
      horseImage={
        (hlt as any).image_path || "/images/content/horses/placeholder.png"
      }
      hasPds={hasPds}
      hasSa={hasSa}
      purchasable={eligibility.allowed}
      campaignStatus={campaignStatus}
      closedReason={eligibility.allowed ? undefined : eligibility.reason}
    />
  );
}
