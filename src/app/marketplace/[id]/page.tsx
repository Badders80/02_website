import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { getHltById } from "@/lib/api";
import { PurchaseForm } from "@/components/marketplace/PurchaseForm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params;
  let hlt: any = null;

  const MOCK_HLT = {
    id: id || "mock-hlt-id",
    status: "published",
    shares_total: 100,
    shares_sold: 23,
    share_price_cents: 150000,
    fractional_interest_per_share: 1.0,
    leasehold_stake_percentage: 100,
    lease_period_months: 36,
    lease_start_date: "2026-07-01",
    investor_return_percentage: 80,
    horse_microchip: "982000123456789",
    horse: {
      name: "Prudentia",
      age: 3,
      sex: "Mare",
      colour: "Bay",
      sire_name: "Proisir (AUS)",
      dam_name: "Prudent (NZ)",
      image_url: "/updates/prudentia_te_rapa_may30.jpg",
      story: "Prudentia is a high-potential 3-year-old filly with exceptional speed and a strong pedigree. Currently training under top preparation routines at Matamata, she has targets set for spring stakes."
    },
    trainer: {
      name: "Mark Walker",
      stable_name: "Te Akau Racing",
      location: "Matamata, NZ",
      nztr_license_number: "LIC-12345"
    },
    owner: {
      name: "Evolution Stables"
    }
  };

  const isBypass = process.env.NEXT_PUBLIC_BYPASS_STRIPE === "true" || process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";

  if (isBypass) {
    hlt = MOCK_HLT;
  } else {
    try {
      // Fetch dynamic HLT by ID, resolving horse, trainer, owner references
      hlt = await getHltById(id, true);
    } catch (err: any) {
      console.error(`Failed to fetch HLT ${id}:`, err.message);
      notFound();
    }
    if (!hlt) {
      notFound();
    }
  }

  const horse = hlt.horse;
  const trainer = hlt.trainer;
  const owner = hlt.owner;
  const sharesAvailable = hlt.shares_total - hlt.shares_sold;
  const sharePriceNzd = hlt.share_price_cents / 100;
  const totalLeasePercent = hlt.leasehold_stake_percentage || 100;

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-foreground font-sans pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-wider text-white/30">
            <Link href="/marketplace" className="hover:text-white/60 transition">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-white/60">{horse?.name || "Horse Detail"}</span>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr,1fr] items-start">
            {/* Left: Media & Story */}
            <div className="space-y-12">
              {/* Cover Photo */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900">
                {horse?.image_url ? (
                  <Image
                    src={horse.image_url}
                    alt={horse.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/20 text-xs font-light">
                    Photo incoming
                  </div>
                )}
              </div>

              {/* Pedigree & Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl p-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Sex</p>
                  <p className="text-sm font-medium text-white capitalize">{horse?.sex || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Colour</p>
                  <p className="text-sm font-medium text-white">{horse?.colour || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Sire</p>
                  <p className="text-sm font-medium text-white truncate" title={horse?.sire_name}>
                    {horse?.sire_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Dam</p>
                  <p className="text-sm font-medium text-white truncate" title={horse?.dam_name}>
                    {horse?.dam_name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Story */}
              <section className="space-y-4">
                <h2 className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/30">
                  The Story
                </h2>
                <h3 className="text-[24px] font-light text-white tracking-tight leading-tight">
                  Campaign Overview
                </h3>
                <p className="text-sm leading-[1.85] font-light text-white/60 whitespace-pre-line">
                  {horse?.story || "No campaign description has been posted yet. Check back shortly for updates on this thoroughbred's preparation, morning routines, and race targets."}
                </p>
              </section>

              {/* Trainer Profile */}
              {trainer && (
                <section className="border-t border-white/[0.06] pt-12 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-xl text-white font-medium">
                      {trainer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Trainer</p>
                      <h4 className="text-lg font-medium text-white">{trainer.name}</h4>
                      <p className="text-xs text-white/40">{trainer.stable_name} · {trainer.location}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-[1.85] font-light text-white/50">
                    {trainer.nztr_license_number ? `NZTR Licensed (#${trainer.nztr_license_number}). ` : ""}
                    Leveraging decade-long pedigree preparation and a patient training philosophy in the heart of New Zealand thoroughbred racing territory.
                  </p>
                </section>
              )}

              {/* Identification details */}
              <section className="border-t border-white/[0.06] pt-12 space-y-4">
                <h2 className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/30">
                  Registry Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light text-white/50">
                  <div className="flex justify-between border-b border-white/[0.04] pb-2">
                    <span>Microchip (15-digit)</span>
                    <span className="font-mono text-white/70">{horse?.microchip || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.04] pb-2">
                    <span>Life Number</span>
                    <span className="font-mono text-white/70">{horse?.life_number || "N/A"}</span>
                  </div>
                  {horse?.left_shoulder_brand && (
                    <div className="flex justify-between border-b border-white/[0.04] pb-2">
                      <span>Left Shoulder Brand</span>
                      <span className="text-white/70">{horse.left_shoulder_brand}</span>
                    </div>
                  )}
                  {horse?.right_shoulder_brand && (
                    <div className="flex justify-between border-b border-white/[0.04] pb-2">
                      <span>Right Shoulder Brand</span>
                      <span className="text-white/70">{horse.right_shoulder_brand}</span>
                    </div>
                  )}
                  {horse?.breeder && (
                    <div className="flex justify-between border-b border-white/[0.04] pb-2">
                      <span>Breeder</span>
                      <span className="text-white/70">{horse.breeder}</span>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right: Campaign specifications & Purchase Widget */}
            <div className="space-y-8 lg:sticky lg:top-28">
              {/* Campaign details */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 space-y-6">
                <h3 className="text-lg font-light text-white">Campaign Specifications</h3>
                
                <div className="space-y-4 text-sm font-light">
                  <div className="flex justify-between border-b border-white/[0.06] pb-3">
                    <span className="text-white/40">Total Lease percentage</span>
                    <span className="text-white font-medium">{totalLeasePercent}%</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.06] pb-3">
                    <span className="text-white/40">Lease Period</span>
                    <span className="text-white font-medium">{hlt.lease_period_months} Months</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.06] pb-3">
                    <span className="text-white/40">Lease Start Date</span>
                    <span className="text-white font-medium">{hlt.lease_start_date}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-white/40">Investor Returns</span>
                    <span className="text-[#34D399] font-medium">{hlt.investor_return_percentage}% of prize money</span>
                  </div>
                </div>
              </div>

              {/* Client Purchase Card */}
              <PurchaseForm hlt={hlt} horseName={horse?.name || "Racehorse"} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
