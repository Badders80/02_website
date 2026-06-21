import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { getHltById } from "@/lib/api";
import { PurchaseForm } from "@/components/marketplace/PurchaseForm";
import { ApplyForm } from "@/components/marketplace/ApplyForm";
import { KycRequestCard } from "@/components/marketplace/KycRequestCard";
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

  const MOCK_CAMPAIGNS: Record<string, any> = {
    "prudentia": {
      id: "prudentia",
      status: "published",
      shares_total: 100,
      shares_sold: 23,
      share_price_cents: 150000,
      fractional_interest_per_share: 1.0,
      leasehold_stake_percentage: 100,
      lease_period_months: 18,
      lease_start_date: "2026-07-01",
      investor_return_percentage: 80,
      horse_microchip: "982000123456789",
      horse: {
        name: "Prudentia",
        age: 4,
        sex: "Mare",
        colour: "Bay",
        sire_name: "Proisir (AUS)",
        dam_name: "Little Bit Irish (NZ)",
        image_url: "https://storage.googleapis.com/tokinvest-ds-bucket/offering/2a02e2f0-ead0-4abf-abca-0b2c84eb1107.JPG",
        story: `Prudentia is a New Zealand-bred four-year-old mare by Proisir. Trained from Matamata by Lance O'Sullivan and Andrew Scott at Wexford Stables, she has already recorded a maiden victory and performed across a range of distances and track conditions.

        Her win came over 1400 metres at Tauranga, where she handled testing Heavy conditions to score decisively. Since breaking her maiden, she has stepped into Rating 65 Benchmark company, continuing her preparation against stronger opposition.
        
        Each stake unit secures a fractional interest in an 18-month lease. Investors receive a pro rata share of 80% of net eligible race earnings, with distributions made as earned.`,
        life_number: "NZ00427416",
        left_shoulder_brand: "KB INSIDE CIRCLE",
        right_shoulder_brand: "85 OVER 1",
        breeder: "Golden Eye Trust"
      },
      trainer: {
        name: "Lance O'Sullivan",
        stable_name: "Wexford Stables",
        location: "Matamata, NZ",
        nztr_license_number: "LIC-WEXFORD"
      },
      owner: {
        name: "Evolution Stables"
      }
    },
    "hottathanafantasy": {
      id: "hottathanafantasy",
      status: "published",
      shares_total: 100,
      shares_sold: 0,
      share_price_cents: 150000,
      fractional_interest_per_share: 1.0,
      leasehold_stake_percentage: 100,
      lease_period_months: 18,
      lease_start_date: "2026-08-01",
      investor_return_percentage: 80,
      horse_microchip: "982000123456788",
      horse: {
        name: "Hottathanafantasy",
        age: 2,
        sex: "Filly",
        colour: "Bay",
        sire_name: "Contributer",
        dam_name: "Whiffle",
        image_url: "https://images.squarespace-cdn.com/content/v1/68b3a55795fa0517264bfda3/ecff499a-445a-4cf0-a746-29e763e5ec4c/5caf253b-5ed3-485a-a8ba-4e14cf8ecb73.JPG?format=750w",
        story: `A promising two-year-old with an elite international pedigree. Currently in her first racing preparation at Wexford Stables under Lance O'Sullivan.
        
        She shows the physical traits of a high-performance athlete ready to make her mark on the New Zealand turf. Pedigree analysis points to middle-distance strength in future campaigns.`,
        life_number: "NZ00427812",
        left_shoulder_brand: "WS",
        right_shoulder_brand: "12 OVER 4",
        breeder: "Golden Eye Trust"
      },
      trainer: {
        name: "Lance O'Sullivan",
        stable_name: "Wexford Stables",
        location: "Matamata, NZ",
        nztr_license_number: "LIC-WEXFORD"
      },
      owner: {
        name: "Evolution Stables"
      }
    },
    "first-gear": {
      id: "first-gear",
      status: "published",
      shares_total: 100,
      shares_sold: 0,
      share_price_cents: 150000,
      fractional_interest_per_share: 1.0,
      leasehold_stake_percentage: 100,
      lease_period_months: 36,
      lease_start_date: "2026-07-01",
      investor_return_percentage: 80,
      horse_microchip: "982000123456787",
      horse: {
        name: "First Gear",
        age: 4,
        sex: "Gelding",
        colour: "Bay",
        sire_name: "Derryn",
        dam_name: "A'Guin Ace",
        image_url: "https://storage.googleapis.com/tokinvest-ds-bucket/offering/0f8455e5-6ae4-4524-9ced-43115c3d966b.png",
        story: `Early race success with $20K+ in prizemoney and international buyer interest. Trained by Group 1-winning horseman Stephen Gray at Copper Belt Lodge.
        
        In just five starts he has recorded a win, two placings, and over $20,000 in prizemoney — including turning down a recent six-figure offer from Australian interests.`,
        life_number: "NZ00427901",
        left_shoulder_brand: "CB",
        right_shoulder_brand: "90 OVER 2",
        breeder: "Copper Belt Breeder"
      },
      trainer: {
        name: "Stephen Gray",
        stable_name: "Copper Belt Lodge",
        location: "Palmerston North, NZ",
        nztr_license_number: "LIC-GRAY"
      },
      owner: {
        name: "Evolution Stables"
      }
    },
    "i-stole-a-manolo": {
      id: "i-stole-a-manolo",
      status: "published",
      shares_total: 100,
      shares_sold: 0,
      share_price_cents: 150000,
      fractional_interest_per_share: 1.0,
      leasehold_stake_percentage: 100,
      lease_period_months: 16,
      lease_start_date: "2026-09-01",
      investor_return_percentage: 80,
      horse_microchip: "982000123456786",
      horse: {
        name: "I Stole A Manolo",
        age: 2,
        sex: "Filly",
        colour: "Bay",
        sire_name: "Satono Aladdin",
        dam_name: "Canuhandleajandal",
        image_url: "https://images.squarespace-cdn.com/content/v1/68b3a55795fa0517264bfda3/24dba76b-c802-4d2a-9257-9b73eb5c28f7/IMG_7126.jpg?format=750w",
        story: `Daughter of Group 1 winner Satono Aladdin with real presence and correct action. In early racing education at Wexford Stables with Lance O'Sullivan & Andrew Scott.
        
        She is being carefully prepared to follow in the footsteps of the stable's many Group 1 champions on the turf.`,
        life_number: "NZ00427113",
        left_shoulder_brand: "LO",
        right_shoulder_brand: "11 OVER 4",
        breeder: "Waikato Syndicate Stud"
      },
      trainer: {
        name: "Lance O'Sullivan & Andrew Scott",
        stable_name: "Wexford Stables",
        location: "Matamata, NZ",
        nztr_license_number: "LIC-WEXFORD"
      },
      owner: {
        name: "Evolution Stables"
      }
    }
  };

  const isBypass = process.env.NEXT_PUBLIC_BYPASS_STRIPE === "true" || process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";

  if (isBypass) {
    hlt = MOCK_CAMPAIGNS[id] || MOCK_CAMPAIGNS.prudentia;
  } else {
    try {
      hlt = await getHltById(id, true);
    } catch (err: any) {
      console.error(`Failed to fetch HLT ${id}:`, err.message);
    }
    if (!hlt) {
      hlt = MOCK_CAMPAIGNS[id] || MOCK_CAMPAIGNS.prudentia;
    }
  }

  // Handle error states from brief (draft or archive should disable or not show)
  if (hlt.status !== "published" && hlt.status !== "publish_ready") {
    // If not found or not published, render the 404 message or render as disabled
    // We will render it but pass the status downstream so PurchaseForm is disabled if not published
  }

  const horse = hlt.horse;
  const trainer = hlt.trainer;
  const sharesAvailable = hlt.shares_total - hlt.shares_sold;
  const totalLeasePercent = hlt.leasehold_stake_percentage || 100;

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
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950">
                {horse?.image_url ? (
                  <>
                    <Image
                      src={horse.image_url}
                      alt={horse.name}
                      fill
                      className="object-cover"
                      priority
                    />
                    {/* Bottom vignette fade overlay (gradient: transparent -> black 80%) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 pointer-events-none" />
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
                    <span className="text-white font-medium">{hlt.lease_period_months} Months</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.06] pb-3.5">
                    <span className="text-white/40">Lease Start Date</span>
                    <span className="text-white font-medium">{hlt.lease_start_date}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-white/40">Investor Returns</span>
                    <span className="text-[#34D399] font-medium">{hlt.investor_return_percentage}% of prize money</span>
                  </div>
                </div>
              </div>

              {/* Section G: The Purchase Widget */}
              <PurchaseForm hlt={hlt} horseName={horse?.name || "Racehorse"} />

              {/* Section H: Apply for Ownership (Simple Application) */}
              <ApplyForm hltId={hlt.id} horseName={horse?.name || "Racehorse"} />

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
