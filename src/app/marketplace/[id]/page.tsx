import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { RightColumnActionPanel } from "@/components/marketplace/RightColumnActionPanel";
import { DetailTabs } from "@/components/marketplace/DetailTabs";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import hltsData from "@/data/hlts.json";
import horsesData from "@/data/horses.json";
import { getCampaignStatus, STATUS_INFO } from "@/lib/campaign-status";

// Racing freshness calculator (NZTR Love Racing records)
const getRacingFreshness = (slug: string) => {
  const currentDate = new Date();
  const lastRaceDates: Record<string, string> = {
    "prudentia": "2026-06-27",
    "first-gear": "2026-01-02",
  };
  
  if (slug in lastRaceDates) {
    const lastRaceDate = new Date(lastRaceDates[slug]);
    const diffTime = Math.abs(currentDate.getTime() - lastRaceDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      label: "Days Since Last Race",
      value: `${diffDays} Days`,
      subtext: `Last raced: ${lastRaceDates[slug]} (Love Racing Record)`,
    };
  } else {
    const targetDate = new Date("2026-09-04");
    const diffTime = targetDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const displayDays = diffDays > 0 ? diffDays : 0;
    return {
      label: "Countdown to Debut",
      value: `${displayDays} Days`,
      subtext: "Estimated preparation cycle remaining",
    };
  }
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const hlt = (hltsData as any[]).find((h) => h.horse_slug === id);
  if (!hlt) return {};
  const horseName = hlt.horse_name || "Racehorse";
  const story = hlt.story || `Digital-syndication opportunity for ${horseName}.`;
  const freshness = getRacingFreshness(id || hlt.id);
  
  return {
    title: `${horseName} | Marketplace`,
    description: story.substring(0, 160),
    other: {
      "racing-freshness-label": freshness.label,
      "racing-freshness-value": freshness.value,
      "racing-freshness-subtext": freshness.subtext,
    },
    alternates: {
      canonical: `/marketplace/${id}`,
    },
    openGraph: {
      title: `${horseName} | Evolution Stables Marketplace`,
      description: story.substring(0, 160),
      url: `https://evolutionstables.nz/marketplace/${id}`,
      type: "website",
      images: hlt.image_path
        ? [{ url: hlt.image_path, width: 1200, height: 630, alt: horseName }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${horseName} | Evolution Stables`,
      description: story.substring(0, 160),
      images: hlt.image_path ? [hlt.image_path] : undefined,
    },
  };
}

function ProductJsonLd({ hltRecord }: { hltRecord: any }) {
  const horse = hltRecord.horse;
  const trainer = hltRecord.trainer;
  const sharePrice = hltRecord.share_price_cents / 100;
  const sharesAvailable = hltRecord.shares_total - hltRecord.shares_sold;

  // Wikidata and Wikipedia entity linkage for Wexford and Stephen Gray
  const trainerSameAs = trainer?.stable_name === "Wexford Stables"
    ? ["https://en.wikipedia.org/wiki/Lance_O%27Sullivan", "https://www.wikidata.org/wiki/Q6483515"]
    : trainer?.stable_name === "Stephen Gray Racing"
      ? ["https://www.wikidata.org/wiki/Q110823377"]
      : [];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: horse?.name || "Racehorse",
    description: horse?.story || `Racehorse ownership opportunity for ${horse?.name || "Racehorse"}.`,
    image: horse?.image_url?.startsWith("http")
      ? horse.image_url
      : `https://evolutionstables.nz${horse?.image_url || ""}`,
    brand: {
      "@type": "Brand",
      name: "Evolution Stables",
    },
    provider: trainer?.stable_name ? {
      "@type": "SportsOrganization",
      name: trainer.stable_name,
      sameAs: trainerSameAs.length > 0 ? trainerSameAs : undefined,
    } : undefined,
    // Injecting freshness indicator inside the structured data
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "racing-freshness-status",
        value: getRacingFreshness(hltRecord.id).value,
        description: getRacingFreshness(hltRecord.id).label
      }
    ],
    offers: {
      "@type": "Offer",
      url: `https://evolutionstables.nz/marketplace/${hltRecord.id}`,
      priceCurrency: "NZD",
      price: sharePrice.toFixed(2),
      availability: sharesAvailable > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
    },
    aggregateOffer: {
      "@type": "AggregateOffer",
      lowPrice: sharePrice.toFixed(2),
      highPrice: sharePrice.toFixed(2),
      priceCurrency: "NZD",
      offerCount: sharesAvailable,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

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
  const horseData = (horsesData as any[]).find((h) => h.slug === id || h.name === hlt.horse_name);

  // Build the HLT object in the shape the page expects
  const hltRecord = {
    id: hlt.horse_slug || hlt.id,
    status: hlt.listing_status === "active" ? "published" : "draft",
    shares_total: Number(hlt.shares_total),
    shares_sold: Number(hlt.shares_sold),
    share_price_cents: Number(hlt.price_per_share_nzd || 1500) * 100,
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
  const status = getCampaignStatus({
    listing_status: hlt.listing_status,
    shares_total: hltRecord.shares_total,
    shares_sold: hltRecord.shares_sold,
  });

  // Initials for avatar fallback
  const trainerInitials = trainer?.name
    ? trainer.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
    : "T";

  return (
    <>
      <ProductJsonLd hltRecord={hltRecord} />
      <NavBar />
      <main className="min-h-screen bg-black text-white font-sans pt-32 pb-24 selection:bg-[#d4a964] selection:text-black">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
          
          {/* Breadcrumb Navigation */}
          <div className="mb-10 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/30">
            <div className="flex items-center gap-2">
              <Link href="/marketplace" className="hover:text-white/60 transition duration-300">
                Marketplace
              </Link>
              <span>/</span>
              <span className="text-white/60">{horse?.name || "Campaign"}</span>
            </div>
            <Link 
              href="/marketplace" 
              className="flex items-center gap-1.5 text-[#d4a964] hover:text-white/80 transition duration-300 normal-case tracking-normal text-[12px] font-medium"
            >
              <span>←</span> Back to Marketplace
            </Link>
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

              {/* Section B2: Gallery (mock placeholders) */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="relative aspect-[4/3] rounded-xl border border-white/[0.04] bg-white/[0.01] flex items-center justify-center overflow-hidden"
                  >
                    <div className="text-[10px] font-light text-white/15 uppercase tracking-wider">
                      Gallery
                    </div>
                  </div>
                ))}
              </div>

              {/* Section C: The Story */}
              <section className="space-y-4">
                <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/30">
                  The story
                </p>
                <h1 className="text-[24px] font-light text-white tracking-tight leading-tight">
                  {horse?.name ? `${horse.name}.` : "Athlete Profile."}
                </h1>
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

              {/* Section D: Dynamic Tabs (Details, Trainer, Record, Documents) */}
              <section className="border-t border-white/[0.06] pt-12">
                <DetailTabs
                  horseName={horse?.name || "Racehorse"}
                  sireName={horse?.sire_name || ""}
                  damName={horse?.dam_name || ""}
                  sex={horse?.sex || ""}
                  colour={horse?.colour || ""}
                  age={horse?.age}
                  wins={hlt.wins || "0"}
                  placed={hlt.placed || "0"}
                  loveracingId={horseData?.loveracing_id}
                  breedingUrl={horseData?.breeding_url}
                  performanceProfileUrl={horseData?.performance_profile_url}
                  trainer={{
                    name: trainer.name,
                    stable_name: trainer.stable_name,
                    contact_name: horseData?.trainer_contact_name || "",
                    location: trainer.location,
                    nztr_license_number: trainer.nztr_license_number || "",
                  }}
                  horseSlug={hltRecord.id}
                />
              </section>
            </div>

            {/* RIGHT COLUMN — Action Layer */}
            <div className="space-y-8 lg:sticky lg:top-28">
              <RightColumnActionPanel
                horseName={horse?.name || "Racehorse"}
                horseSlug={hltRecord.id}
              />
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
