import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import hltsData from "@/data/hlts.json";
import horsesData from "@/data/horses.json";
import PurchaseFlow from "@/components/marketplace/PurchaseFlow";

export const runtime = "nodejs";
export const dynamicParams = true;

export async function generateStaticParams() {
  return (hltsData as any[]).map((hlt) => ({ id: hlt.horse_slug || hlt.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PurchasePage({ params }: Props) {
  const { id } = await params;
  const hlt = (hltsData as any[]).find((h) => (h.horse_slug || h.id) === id);

  if (!hlt) notFound();

  const horseData = (horsesData as any[]).find((h) => h.slug === id);
  const sharesTotal = Number(hlt.shares_total || 100);
  const sharesSold = Number(hlt.shares_sold || 0);
  const sharesAvailable = sharesTotal - sharesSold;
  const pricePerShareNzd = Number(hlt.price_per_share_nzd || 1500);

  // Check if documents exist
  const pdsPath = path.join(process.cwd(), "public", "documents", id, "pds.pdf");
  const saPath = path.join(process.cwd(), "public", "documents", id, "syndicate-agreement.pdf");
  const hasPds = fs.existsSync(pdsPath);
  const hasSa = fs.existsSync(saPath);

  return (
    <PurchaseFlow
      horseName={hlt.horse_name || horseData?.name || "Racehorse"}
      horseSlug={id}
      horseImage={hlt.image_path || horseData?.image_path || "/images/content/horses/placeholder.png"}
      horseStory={hlt.story || ""}
      pricePerShareNzd={pricePerShareNzd}
      totalLeasePercent={hlt.leasehold_stake_pct || 100}
      leasePeriodMonths={hlt.lease_period_months || 36}
      leaseStartDate={hlt.lease_start_date || "TBD"}
      investorReturnPct={hlt.investor_return_pct || 80}
      sharesTotal={sharesTotal}
      sharesAvailable={sharesAvailable}
      hasPds={hasPds}
      hasSa={hasSa}
    />
  );
}