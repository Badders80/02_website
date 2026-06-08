import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { getHltById } from "@/lib/api";
import { PurchaseFormSandbox } from "@/components/marketplace/PurchaseFormSandbox";
import { DetailTabsSandbox } from "@/components/marketplace/DetailTabsSandbox";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailSandboxPage({ params }: Props) {
  const { id } = await params;
  let hlt: any = null;

  // Mock campaign detail assets for local/test bypass mode
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
        image_url: "/updates/prudentia_te_rapa_may30.jpg",
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
      },
      races: [
        { date: "2026-05-30", venue: "Te Rapa", race: "BM75 Sprint (1200m)", trackCondition: "Soft", result: "5th", margin: "1.8L" },
        { date: "2026-04-17", venue: "Te Rapa", race: "Rating 65 Benchmark (1300m)", trackCondition: "Heavy 10", result: "1st", margin: "0.33L" },
        { date: "2025-03-15", venue: "Tauranga", race: "Maiden Grade (1400m)", trackCondition: "Heavy", result: "1st", margin: "1.5L" },
        { date: "2025-02-05", venue: "Te Rapa", race: "Maiden Grade (1400m)", trackCondition: "Good", result: "2nd", margin: "0.5L" },
        { date: "2025-01-18", venue: "Matamata", race: "Maiden Grade (1300m)", trackCondition: "Soft", result: "3rd", margin: "1.2L" }
      ],
      documents: {
        term_sheet: { status: "reviewed", gcs_url: "gs://evolution-horse-docs/prudentia/term_sheet.docx" },
        pds: { status: "reviewed", gcs_url: "gs://evolution-horse-docs/prudentia/pds.docx" },
        sa: { status: "reviewed", gcs_url: "gs://evolution-horse-docs/prudentia/sa.docx" }
      }
    },
    "hottathanafantasy": {
      id: "hottathanafantasy",
      status: "reviewed",
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
        image_url: "/images/marketplace/hottathanafantasy.jpg",
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
      },
      races: [],
      documents: {
        term_sheet: { status: "pending", gcs_url: null },
        pds: { status: "pending", gcs_url: null },
        sa: { status: "pending", gcs_url: null }
      }
    },
    "first-gear": {
      id: "first-gear",
      status: "reviewed",
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
        image_url: "/images/marketplace/first-gear.png",
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
      },
      races: [
        { date: "2026-04-12", venue: "Wanganui", race: "Rating 65 (1400m)", trackCondition: "Soft", result: "1st", margin: "2.1L" },
        { date: "2026-03-01", venue: "Otaki", race: "Maiden Grade (1200m)", trackCondition: "Good", result: "2nd", margin: "0.2L" }
      ],
      documents: {
        term_sheet: { status: "pending", gcs_url: null },
        pds: { status: "pending", gcs_url: null },
        sa: { status: "pending", gcs_url: null }
      }
    },
    "i-stole-a-manolo": {
      id: "i-stole-a-manolo",
      status: "reviewed",
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
        image_url: "/images/marketplace/i-stole-a-manolo.jpg",
        story: `Daughter of Group 1 winner Satono Aladdin with real presence and correct action. In early racing education at Wexford Stables with Lance O'Sullivan & Andrew Scott.
        
        She is being carefully prepared to follow in the footsteps of the stable's many Group 1 champions on the turf.`,
        life_number: "NZ00427113",
        left_shoulder_brand: "LO",
        right_shoulder_brand: "11 OVER 4",
        breeder: "Waikato Syndicate Stud"
      },
      trainer: {
        name: "Lance O'Sullivan",
        stable_name: "Wexford Stables",
        location: "Matamata, NZ",
        nztr_license_number: "LIC-WEXFORD"
      },
      owner: {
        name: "Evolution Stables"
      },
      races: [],
      documents: {
        term_sheet: { status: "pending", gcs_url: null },
        pds: { status: "pending", gcs_url: null },
        sa: { status: "pending", gcs_url: null }
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
      console.error(`Failed to fetch HLT ${id} in sandbox:`, err.message);
      // Fallback in case of dev testing or missing backend entries
      hlt = MOCK_CAMPAIGNS[id] || MOCK_CAMPAIGNS.prudentia;
    }
    if (!hlt) {
      hlt = MOCK_CAMPAIGNS[id] || MOCK_CAMPAIGNS.prudentia;
    }
  }

  const horse = hlt.horse;
  const trainer = hlt.trainer;
  const sharesAvailable = hlt.shares_total - hlt.shares_sold;
  const sharePriceNzd = hlt.share_price_cents / 100;
  const totalLeasePercent = hlt.leasehold_stake_percentage || 100;
  const races = hlt.races || [];

  // Generate dynamic JSON-LD Schema structures for perfect SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": horse?.name || "Racehorse Campaign",
    "description": `${horse?.age || ""}YO ${horse?.sex || ""} by ${horse?.sire_name || ""} out of ${horse?.dam_name || ""}`,
    "image": horse?.image_url ? `https://evolutionstables.nz${horse.image_url}` : "",
    "offers": {
      "@type": "Offer",
      "price": sharePriceNzd,
      "priceCurrency": "NZD",
      "description": `${hlt.fractional_interest_per_share || (100 / hlt.shares_total)}% leasehold stake unit`,
      "availability": sharesAvailable > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
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
            <Link href="/marketplace-sandbox" className="hover:text-white/60 transition duration-300">
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
                <DetailTabsSandbox hlt={hlt} races={races} />
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
                    <span className="text-white">{hlt.lease_period_months} Months</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.04] pb-3">
                    <span className="text-white/40">Lease Start</span>
                    <span className="text-white">{hlt.lease_start_date}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-white/40">Prize Dividends</span>
                    <span className="text-[#34D399] font-medium">{hlt.investor_return_percentage}% of Net Earnings</span>
                  </div>
                </div>
              </div>

              {/* Client Purchase Card (Sandbox Isolated Component) */}
              <PurchaseFormSandbox hlt={hlt} horseName={horse?.name || "Racehorse"} />
            </div>
          </div>
        </div>
      </main>
      <Footer minimal={true} />
    </>
  );
}
