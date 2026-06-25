import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PurchaseForm } from "@/components/marketplace/PurchaseForm";
import { ApplyForm } from "@/components/marketplace/ApplyForm";
import { KycRequestCard } from "@/components/marketplace/KycRequestCard";
import { ComingSoonOverlay } from "@/components/ui/ComingSoonOverlay";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import hltsData from "@/data/hlts.json";
import horsesData from "@/data/horses.json";

// SSG: data comes from local JSON, no runtime API calls.
export const runtime = "nodejs";
// Pre-render known campaign IDs at build time; allow on-demand generation for new ones.
export const dynamicParams = true;

// Pre-render campaigns at build time from local JSON.
export async function generateStaticParams() {
  return (hltsData as any[]).map((hlt) => ({ id: hlt.horse_slug || hlt.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params;
  let hlt: any = null;

  // Find HLT from local JSON data
  hlt = (hltsData as any[]).find((h) => (h.horse_slug || h.id) === id);

  if (!hlt) {
    notFound();
  }

  // Find horse data from local JSON
  const horseData = (horsesData as any[]).find((h) => h.id === id || h.name_slug === id);

  // Build the HLT object in the shape the page expects
  const hltRecord = {
    id: hlt.horse_slug || hlt.id,
    status: hlt.listing_status === "active" ? "published" : "draft",
    shares_total: hlt.shares_total,
    shares_sold: hlt.shares_sold,
    share_price_cents: (hlt.price_per_share_nzd || 1500) * 100,
    fractional_interest_per_share: 1.0,
    leasehold_stake_percentage: hlt.leasehold_stake_pct || 100,
    lease_period_months: hlt.lease_period_months || 36,
    lease_start_date: hlt.lease_start_date || "TBD",
    investor_return_percentage: hlt.investor_return_pct || 80,
    horse_microchip: hlt.horse_microchip,
    horse: {
      name: hlt.horse_name || horseData?.name || "Racehorse",
      age: horseData?.foaling_date ? new Date().getFullYear() - new Date(horseData.foaling_date).getFullYear() : undefined,
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
    },
    trainer: {
      name: hlt.trainer_name || horseData?.trainer_name || "",
      stable_name: hlt.trainer_stable || horseData?.trainer_stable || "",
      location: hlt.trainer_location || horseData?.trainer_location || "",
      nztr_license_number: "",
      bio: "",
    },
    owner: {
      name: hlt.owner_name || "",
    },
  };

  const horse = hltRecord.horse;
  const trainer = hltRecord.trainer;
  const sharesAvailable = hltRecord.shares_total - hltRecord.shares_sold;
  const totalLeasePercent = hltRecord.leasehold_stake_percentage || 100;

  // Initials for avatar fallback
  const trainerInitials = trainer?.name
    ? trainer.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
    : "T";

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-white font-sans pt-32 pb-24 selection:bg-[#d4a964] selection:text-black">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
          
          {/* Breadcrumb Navigation */}
          <div className="mb-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/30">
            <Link href="/marketplace" className="hover:text-white/60 transition duration-300">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-white/60">{horse?.name || "Campaign"}</span>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr,1fr] items-start">
            
            {/* LEFT COLUMN — Narrative Layer (The Athlete) */}
            <div className="space-y-12">
              
              {/* Section A: Cover Media */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
                {horse?.image_url ? (
                  <>
                    <Image
                      src={horse.image_url}
                      alt={horse.name}
                      fill
                      className="object-contain"
                      priority
                    />
                    {/* Bottom vignette fade overlay (gradient: transparent -> black 40%) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-white/20 text-xs font-light bg-zinc-900">
                    Photo incoming
                  </div>
                )}
              </div>

              {/* Section B: Pedigree & Specifications */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl p-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">Sex</p>
                  <p className="text-[14px] font-medium text-white capitalize">{horse?.sex || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">Colour</p>
                  <p className="text-[14px] font-medium text-white">{horse?.colour || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">Sire</p>
                  <p className="text-[14px] font-medium text-white truncate" title={horse?.sire_name}>
                    {horse?.sire_name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">Dam</p>
                  <p className="text-[14px] font-medium text-white truncate" title={horse?.dam_name}>
                    {horse?.dam_name || "—"}
                  </p>
                </div>
              </div>

              {/* Section C: The Story */}
              <section className="space-y-4">
                <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/30">
                  The story
                </p>
                <h3 className="text-[24px] font-light text-white tracking-tight leading-tight">
                  {horse?.name ? `${horse.name}.` : "Athlete Profile."}
                </h3>
                <div className="text-[14px] leading-[1.85] font-light text-white/70 space-y-4">
                  {horse?.story ? (
                    horse.story.split("\n\n").map((para: string, idx: number) => (
                      <p key={idx}>{para}</p>
                    ))
                  ) : (
                    <p>—</p>
                  )}
                </div>
              </section>

              {/* Section D: Trainer Profile */}
              {trainer && (
                <section className="border-t border-white/[0.06] pt-12 space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[18px] text-white font-medium select-none">
                      {trainerInitials}
                    </div>
                    <div>
                      <h4 className="text-[16px] font-medium text-white">{trainer.name}</h4>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        {trainer.stable_name} · {trainer.location}
                      </p>
                      {trainer.nztr_license_number && (
                        <p className="text-[10px] font-medium tracking-wider uppercase text-white/30 mt-1">
                          NZTR Licensed (#{trainer.nztr_license_number})
                        </p>
                      )}
                    </div>
                  </div>
                  {trainer.bio && (
                    <p className="text-[14px] leading-[1.85] font-light text-white/60 max-w-2xl">
                      {trainer.bio}
                    </p>
                  )}
                </section>
              )}

              {/* Section E: Registry Information */}
              <section className="border-t border-white/[0.06] pt-12 space-y-6">
                <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/30">
                  Registry
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-[12px] font-light text-white/50">
                  <div className="flex justify-between border-b border-white/[0.04] pb-3">
                    <span>Microchip (15-digit)</span>
                    <span className="font-mono text-white/70">{horse?.microchip || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.04] pb-3">
                    <span>Life Number</span>
                    <span className="font-mono text-white/70">{horse?.life_number || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.04] pb-3">
                    <span>Left Shoulder Brand</span>
                    <span className="text-white/70">{horse?.left_shoulder_brand || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.04] pb-3">
                    <span>Right Shoulder Brand</span>
                    <span className="text-white/70">{horse?.right_shoulder_brand || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.04] pb-3 md:col-span-2">
                    <span>Breeder</span>
                    <span className="text-white/70">{horse?.breeder || "—"}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN — Transaction Layer (The Acquisition) */}
            <div className="space-y-8 lg:sticky lg:top-28">
              <ComingSoonOverlay>
                <div className="space-y-8">
                  {/* Section F: Campaign Specifications */}
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 space-y-6">
                    <h3 className="text-[16px] font-light text-white tracking-tight">Campaign</h3>
                    
                    <div className="space-y-4 text-[13px] font-light">
                      <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                        <span className="text-white/40">Total Lease Percentage</span>
                        <span className="text-white font-medium">{totalLeasePercent}%</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                        <span className="text-white/40">Lease Period</span>
                        <span className="text-white font-medium">{hltRecord.lease_period_months} Months</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                        <span className="text-white/40">Lease Start Date</span>
                        <span className="text-white font-medium">{hltRecord.lease_start_date}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-white/40">Investor Returns</span>
                        <span className="text-[#34D399] font-medium">{hltRecord.investor_return_percentage}% of prize money</span>
                      </div>
                    </div>
                  </div>

                  {/* Section G: The Purchase Widget */}
                  <PurchaseForm hlt={hltRecord} horseName={horse?.name || "Racehorse"} />
                </div>
              </ComingSoonOverlay>

              {/* Section H: Apply for Ownership (Simple Application) */}
              <ApplyForm hltId={hltRecord.id} horseName={horse?.name || "Racehorse"} />

              {/* Section I: KYC Verification */}
              <KycRequestCard horseName={horse?.name || "Racehorse"} />
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
