import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import hltsData from "@/data/hlts.json";
import PurchaseFlow from "@/components/marketplace/PurchaseFlow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PurchasePage({ params }: Props) {
  const { id } = await params;
  const hlt = (hltsData as any[]).find((h) => (h.horse_slug || h.id) === id);

  if (!hlt) notFound();

  // Check if documents exist
  const pdsPath = path.join(process.cwd(), "public", "documents", id, "pds.pdf");
  const saPath = path.join(process.cwd(), "public", "documents", id, "syndicate-agreement.pdf");
  const hasPds = fs.existsSync(pdsPath);
  const hasSa = fs.existsSync(saPath);

  // Only pass non-sensitive props. Investment data is fetched client-side from /api/inventory/[slug]
  return (
    <PurchaseFlow
      horseName={hlt.horse_name || "Racehorse"}
      horseSlug={id}
      horseImage={hlt.image_path || "/images/content/horses/placeholder.png"}
      hasPds={hasPds}
      hasSa={hasSa}
    />
  );
}