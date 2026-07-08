import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PurchaseFormSandbox } from "@/components/marketplace/PurchaseFormSandbox";
import { DetailTabsSandbox } from "@/components/marketplace/DetailTabsSandbox";
import { ApplyForm } from "@/components/marketplace/ApplyForm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import hltsData from "@/data/hlts.json";
import horsesData from "@/data/horses.json";
import pedigreesData from "@/data/pedigrees.json";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailSandboxPage({ params }: Props) {
  const { id } = await params;

  // Find HLT from local JSON data
  const hlt = (hltsData as any[]).find((h) => h.horse_slug === id);
  if (!hlt) {
    notFound();
  }

  // Find horse data from local JSON
  const horseData = (horsesData as any[]).find((h) => h.slug === id || h.name === hlt.horse_name);

  // Build the HLT record in the shape the sandbox page expects
  const hltRecord = {
    id: hlt.horse_slug || hlt.id,
    status: hlt.listing_status === "active" ? "published" : "draft",
    shares_total: Number(hlt.shares_total),
    shares_sold: Number(hlt.shares_sold),
    share_price_cents: Number(hlt.price_per_share_nzd || 1500) * 100,
    fractional_interest_per_share: 1.0,
    leasehold_stake_percentage: Number(hlt.leasehold_stake_pct || 100),
    lease_period_months: Number(hlt.lease_period_months || 36),
    lease_start_date: hlt.lease_start_date || "TBD",
    investor_return_percentage: Number(hlt.investor_return_pct || 80),
    horse_microchip: hlt.horse_microchip,
    horse: {
      name: hlt.horse_name || horseData?.name || "Racehorse",
      age: horseData?.foaling_date
        ? new Date().getFullYear() - new Date(horseData.foaling_date).getFullYear()
        : undefined,
      sex: (horseData?.sex || "").charAt(0).toUpperCase() + (horseData?.sex || "").slice(1),
      colour: horseData?.colour || "",
      sire_name: horseData?.sire_name || "",
      dam_name: horseData?.dam_name || "",
      image_url: hlt.image_path || horseData?.image_path || "/images/content/horses/placeholder.png",
      story: hlt.story || horseData?.story || "",
      life_number: horseData?.life_number || "",
      microchip: hlt.horse_microchip || horseData?.microchip || "",
      left_shoulder_brand: "",
      right_shoulder_brand: "",
      breeder: horseData?.breeder || "",
      breeding_url: horseData?.breeding_url || "",
      pedigree_data: (pedigreesData as any)[hlt.horse_slug] || null,
    },
    trainer: {
      name: hlt.trainer_name || horseData?.trainer_name || "",
      stable_name: hlt.trainer_stable || horseData?.trainer_stable || "",
      location: hlt.trainer_location || horseData?.trainer_location || "",
      nztr_license_number: "",
    },
    owner: {
      name: hlt.owner_name || "",
    },
    races: [],
    documents: {
      term_sheet: { status: "pending", gcs_url: null },
      pds: { status: "pending", gcs_url: null },
      sa: { status: "pending", gcs_url: null },
    },
  };

  const horse = hltRecord.horse;
  const trainer = hltRecord.trainer;
  const sharesAvailable = hltRecord.shares_total - hltRecord.shares_sold;
  const sharePriceNzd = hltRecord.share_price_cents / 100;
  const totalLeasePercent = hltRecord.leasehold_stake_percentage || 100;
  const races = hltRecord.races || [];

  // Generate dynamic JSON-LD Schema structures for perfect SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: horse?.name || "Racehorse Campaign",
    description: `${horse?.age || ""}YO ${horse?.sex || ""} by ${horse?.sire_name || ""} out of ${horse?.dam_name || ""}`,
    image: horse?.image_url ? `https://evolutionstables.nz${horse.image_url}` : "",
    offers: {
      "@type": "Offer",
      price: sharePriceNzd,
      priceCurrency: "NZD",
      description: `${hltRecord.fractional_interest_per_share || (100 / hltRecord.shares_total)}% leasehold stake unit`,
      availability: sharesAvailable > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <NavBar />
      {/* Expose Schema Markup dynamically to search engines and AI parsers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-black text-foreground font-sans pt-36 pb-24 selection:bg-white/10 selection:text-white">
        <div className="mx-auto max-w-6xl px-12 md:px-16 lg:px-20">
          {/* Breadcrumb (Luxury layout spacing) */}
          <div className="mb-10 flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/30">
            <Link href="/sandbox/marketplace" className="hover:text-white/60 transition duration-300">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-white/60">{horse?.name || "Horse Detail"}</span>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr,1fr] items-start">
            {/* Left Column: Media & Dynamic Tabs */}
            <div className="space-y-12">
              {/* Cover Photo */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950">
                {horse?.image_url ? (
                  <Image
                    src={horse.image_url}
                    alt={horse.name}
                    fill
                    sizes="(max-width: 900px) 100vw, 60vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/20 text-xs font-light">
                    Photo incoming
                  </div>
                )}
              </div>

              {/* Specs grid (High symmetry) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/[0.01] border border-white/[0.04] rounded-xl p-6">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Sex</p>
                  <p className="text-sm font-light text-white capitalize">{horse?.sex || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Colour</p>
                  <p className="text-sm font-light text-white">{horse?.colour || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Sire</p>
                  <p className="text-sm font-light text-white truncate" title={horse?.sire_name}>
                    {horse?.sire_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Dam</p>
                  <p className="text-sm font-light text-white truncate" title={horse?.dam_name}>
                    {horse?.dam_name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Story */}
              <section className="space-y-4">
                <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4a964] mb-1">
                  The Story
                </h2>
                <h3 className="text-[21px] font-light text-white tracking-tight leading-tight">
                  Campaign Overview
                </h3>
                <p className="text-[13px] leading-[1.8] font-light text-white/60 whitespace-pre-line">
                  {horse?.story || "No campaign description has been posted yet. Check back shortly for updates on this thoroughbred's preparation, morning routines, and race targets."}
                </p>
              </section>

              {/* Dynamic Tabs (Details, Trainer, Record, Documents) */}
              <section className="border-t border-white/[0.06] pt-10">
                <DetailTabsSandbox hlt={hltRecord} races={races} />
              </section>
            </div>

            {/* Right Column: Campaign Specifications & Purchase Widget */}
            <div className="space-y-8 lg:sticky lg:top-28">
              {/* Campaign Specifications */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 space-y-6">
                <h3 className="text-sm font-light uppercase tracking-wider text-white/80 border-b border-white/[0.04] pb-4">
                  Campaign Details
                </h3>

                <div className="space-y-4 text-xs font-light">
                  <div className="flex justify-between border-b border-white/[0.04] pb-3">
                    <span className="text-white/40">Total Lease Stake</span>
                    <span className="text-white">{totalLeasePercent}%</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.04] pb-3">
                    <span className="text-white/40">Lease Duration</span>
                    <span className="text-white">{hltRecord.lease_period_months} Months</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.04] pb-3">
                    <span className="text-white/40">Lease Start</span>
                    <span className="text-white">{hltRecord.lease_start_date}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-white/40">Prize Dividends</span>
                    <span className="text-[#34D399] font-medium">{hltRecord.investor_return_percentage}% of Net Earnings</span>
                  </div>
                </div>
              </div>

              {/* Client Purchase Card (Sandbox Isolated Component) */}
              <PurchaseFormSandbox hlt={hltRecord} horseName={horse?.name || "Racehorse"} />

              {/* Apply for Ownership (Simple Application) */}
              <ApplyForm hltId={hltRecord.id} horseName={horse?.name || "Racehorse"} />
            </div>
          </div>
        </div>
      </main>
      <Footer minimal={true} />
    </>
  );
}
