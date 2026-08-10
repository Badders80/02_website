import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { RightColumnActionPanel } from "@/components/marketplace/RightColumnActionPanel";
import { DetailTabs } from "@/components/marketplace/DetailTabs";
import { HeroPillarsGrid } from "@/components/marketplace/HeroPillarsGrid";
import { GuestProfileGate } from "@/components/marketplace/GuestProfileGate";
import { CampaignStatusBadge } from "@/components/marketplace/CampaignStatusBadge";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import hltsData from "@/data/hlts.json";
import horsesData from "@/data/horses.json";
import pedigreesData from "@/data/pedigrees.json";
import { getCampaignStatus, isOnWebsite } from "@/lib/campaign-status";
import { getLiveInventory } from "@/lib/google-sheets";
import { roundUpListPriceNzd } from "@/lib/pricing";

// Scan a horse's gallery directory for images (excluding the cover image already used)
function getGalleryImages(slug: string, coverUrl?: string): string[] {
  const dir = path.join(process.cwd(), "public", "images", "content", "horses", slug);
  if (!fs.existsSync(dir)) return [];
  const validExts = [".png", ".jpg", ".jpeg", ".webp", ".avif"];
  const coverBasename = coverUrl ? path.basename(coverUrl) : null;
  return fs
    .readdirSync(dir)
    .filter((f) => validExts.includes(path.extname(f).toLowerCase()))
    .filter((f) => f !== coverBasename) // exclude the cover image from gallery
    .sort()
    .map((f) => `/images/content/horses/${slug}/${f}`)
    .slice(0, 6);
}

// Dynamic Racing freshness calculator (from horse.race_log or slug)
const getRacingFreshness = (horseOrSlug: any) => {
  const currentDate = new Date();
  const horse = typeof horseOrSlug === "object" ? horseOrSlug : (horsesData as any[]).find((h) => h.slug === horseOrSlug);
  if (horse?.race_log && Array.isArray(horse.race_log) && horse.race_log.length > 0) {
    const dates = horse.race_log
      .map((r: any) => (r.date ? new Date(r.date).getTime() : 0))
      .filter((t: number) => !isNaN(t) && t > 0);
    if (dates.length > 0) {
      const maxDate = new Date(Math.max(...dates));
      const diffTime = Math.abs(currentDate.getTime() - maxDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        label: "Days Since Last Race",
        value: `${diffDays} Days`,
        subtext: `Last raced: ${maxDate.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })} (Love Racing Record)`,
      };
    }
  }
  // Try next_up date for horses with no race log
  const nextUp = horse?.next_up;
  if (nextUp && nextUp !== "TBD") {
    const targetDate = new Date(nextUp);
    if (!isNaN(targetDate.getTime())) {
      const diffTime = targetDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        return {
          label: "Countdown to Debut",
          value: `${diffDays} Days`,
          subtext: `Target: ${targetDate.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}`,
        };
      }
      return {
        label: "Next Up",
        value: "Due",
        subtext: `${targetDate.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}`,
      };
    }
  }
  // No race log and no next_up — hide badge gracefully
  return null;
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
      "racing-freshness-label": freshness?.label ?? "",
      "racing-freshness-value": freshness?.value ?? "",
      "racing-freshness-subtext": freshness?.subtext ?? "",
    },
    alternates: {
      canonical: `/marketplace/${id}`,
    },
    openGraph: {
      title: `${horseName} | Marketplace`,
      description: story.substring(0, 160),
      url: `https://www.evolutionstables.nz/marketplace/${id}`,
      type: "website",
      images: hlt.image_path
        ? [{ url: hlt.image_path, width: 1200, height: 630, alt: horseName }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${horseName}`,
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
  const freshness = getRacingFreshness(hltRecord.id);

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
      : `https://www.evolutionstables.nz${horse?.image_url || ""}`,
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
    additionalProperty: freshness ? [
      {
        "@type": "PropertyValue",
        name: "racing-freshness-status",
        value: freshness.value,
        description: freshness.label
      }
    ] : undefined,
    offers: {
      "@type": "Offer",
      url: `https://www.evolutionstables.nz/marketplace/${hltRecord.id}`,
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

export const runtime = "nodejs";
/** Live Sheets ops for status/price/stock — do not SSG stale commercial state. */
export const dynamic = "force-dynamic";
export const dynamicParams = true;

// Known static IDs for build tooling; runtime still force-dynamic for live ops.
export async function generateStaticParams() {
  return (hltsData as any[]).map((hlt) => ({ id: hlt.horse_slug || hlt.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

/** Live row present → use live price only (null stays null). Static only when no live row. Investor list $ snap up to nearest dollar. */
function resolveLotPriceNzd(
  live: Awaited<ReturnType<typeof getLiveInventory>> | null,
  staticPrice: number | string | null | undefined
): number | null {
  if (live) {
    const p = live.price_per_share_nzd;
    if (p != null && Number.isFinite(Number(p)) && Number(p) > 0) {
      return roundUpListPriceNzd(Number(p));
    }
    return null;
  }
  if (
    staticPrice != null &&
    staticPrice !== "" &&
    Number.isFinite(Number(staticPrice)) &&
    Number(staticPrice) > 0
  ) {
    return roundUpListPriceNzd(Number(staticPrice));
  }
  return null;
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params;

  const staticHlt = (hltsData as any[]).find((h) => (h.horse_slug || h.id) === id) || null;

  let live: Awaited<ReturnType<typeof getLiveInventory>> = null;
  try {
    live = await getLiveInventory(id);
  } catch (err: any) {
    console.warn(
      `[marketplace/${id}] Live inventory failed; using static fallback:`,
      err?.message || err
    );
  }

  if (!staticHlt && !live) {
    notFound();
  }

  // Prefer live ops for commercial fields; static for identity/content.
  const hlt = staticHlt || {
    horse_slug: live!.slug,
    horse_name: live!.name,
    listing_status: live!.listing_status,
    campaign_status: live!.campaign_status,
    shares_total: live!.shares_total,
    shares_sold: live!.shares_sold,
    price_per_share_nzd: live!.price_per_share_nzd,
    marketplace_visible: live!.marketplace_visible,
    leasehold_stake_pct: live!.totalLeasePercent,
    lease_period_months: live!.leasePeriodMonths,
    lease_start_date: live!.leaseStartDate,
    investor_return_pct: live!.investorReturnPct,
  };

  const horseData = (horsesData as any[]).find(
    (h) => h.slug === id || h.name === hlt.horse_name || h.name === live?.name
  );

  const sharesTotal = live != null ? Number(live.shares_total) : Number(hlt.shares_total || 0);
  const sharesSold = live != null ? Number(live.shares_sold) : Number(hlt.shares_sold || 0);
  const lotPriceNzd = resolveLotPriceNzd(live, hlt.price_per_share_nzd);
  const listingStatus = live?.listing_status || hlt.listing_status;
  const marketplaceVisible =
    live?.marketplace_visible != null && live.marketplace_visible !== ""
      ? live.marketplace_visible
      : hlt.marketplace_visible;
  const leaseholdStake =
    live?.totalLeasePercent ?? hlt.leasehold_stake_pct ?? null;
  const leasePeriodMonths =
    live?.leasePeriodMonths ?? hlt.lease_period_months ?? null;
  const leaseStartDate =
    live?.leaseStartDate || hlt.lease_start_date || "TBD";
  const investorReturnPct =
    live?.investorReturnPct ?? hlt.investor_return_pct ?? null;

  const status = getCampaignStatus({
    campaign_status: live?.campaign_status || hlt.campaign_status,
    listing_status: listingStatus,
    shares_total: sharesTotal,
    shares_sold: sharesSold,
    has_terms_sheet: hlt.has_terms_sheet,
    marketplace_visible: marketplaceVisible,
  });

  // Drafts stay off the public website
  if (!isOnWebsite(status)) {
    notFound();
  }

  const hltRecord = {
    id: live?.slug || hlt.horse_slug || hlt.id || id,
    status: listingStatus === "active" ? "published" : "draft",
    shares_total: sharesTotal,
    shares_sold: sharesSold,
    // No invented commercial default — null/unknown → 0 cents for JSON-LD only
    share_price_cents: lotPriceNzd != null ? Math.round(lotPriceNzd * 100) : 0,
    fractional_interest_per_share: 1.0,
    leasehold_stake_percentage: leaseholdStake ?? 100,
    lease_period_months: leasePeriodMonths ?? 36,
    lease_start_date: leaseStartDate,
    investor_return_percentage: investorReturnPct ?? 80,
    horse_microchip: hlt.horse_microchip,
    horse: {
      name: live?.name || hlt.horse_name || horseData?.name || "Racehorse",
      age: horseData?.foaling_date
        ? new Date().getFullYear() - new Date(horseData.foaling_date).getFullYear()
        : undefined,
      sex: (horseData?.sex || "").charAt(0).toUpperCase() + (horseData?.sex || "").slice(1),
      colour: horseData?.colour || "",
      sire_name: horseData?.sire_name || "",
      dam_name: horseData?.dam_name || "",
      image_url:
        hlt.image_path || horseData?.image_path || "/images/content/horses/placeholder.png",
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
            <GuestProfileGate horseName={horse?.name || "Racehorse"} horseSlug={hltRecord.id}>
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

              {/* Section B2: Gallery (auto-rendered from /public/images/content/horses/[slug]/) */}
              {(() => {
                const galleryImages = getGalleryImages(id, horse?.image_url);
                if (galleryImages.length === 0) return null;
                return (
                  <div className="grid grid-cols-3 gap-3">
                    {galleryImages.map((src, i) => (
                      <div
                        key={src}
                        className="relative aspect-[4/3] rounded-xl border border-white/[0.04] bg-white/[0.01] overflow-hidden group"
                      >
                        <Image
                          src={src}
                          alt={`${horse?.name || "Horse"} — photo ${i + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                          sizes="(max-width: 768px) 33vw, 20vw"
                        />
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Hero Pillars Grid */}
              <HeroPillarsGrid pillars={horseData?.hero_pillars} />

              {/* Section C: The Story */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/30">
                    The story
                  </p>
                  <CampaignStatusBadge status={status} />
                </div>
                <h1 className="text-[24px] font-light text-white tracking-tight leading-tight">
                  {horse?.name ? `${horse.name}.` : "Athlete Profile."}
                </h1>
                <div className="text-[14px] leading-[1.85] font-light text-white/70 space-y-4">
                  {horseData?.story || horse?.story ? (
                    (horseData?.story || horse?.story).split("\n\n").map((para: string, idx: number) => (
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
                  damSireName={horseData?.dam_sire_name}
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
                    bio: trainer.bio,
                  }}
                  horseSlug={hltRecord.id}
                  listingStatus={listingStatus}
                  hasTermsSheet={hlt.has_terms_sheet}
                  sharesTotal={hltRecord.shares_total}
                  sharesSold={hltRecord.shares_sold}
                  foalingDate={horseData?.foaling_date}
                  pedigreeData={(pedigreesData as any)[hltRecord.id] || null}
                  story={horseData?.story || horse?.story}
                  pedigreeBlurb={horseData?.pedigree_blurb}
                  trainerCommentary={horseData?.trainer_commentary}
                  raceLog={horseData?.race_log}
                  trainerBio={trainer.bio}
                />
              </section>
            </div>
            </GuestProfileGate>

            {/* RIGHT COLUMN — Action Layer */}
            <div className="space-y-8 lg:sticky lg:top-28">
              <RightColumnActionPanel
                horseName={horse?.name || "Racehorse"}
                horseSlug={hltRecord.id}
                initialListingStatus={listingStatus}
                initialCampaignStatus={live?.campaign_status || hlt.campaign_status}
                marketplaceVisible={marketplaceVisible}
                hasTermsSheet={hlt.has_terms_sheet}
                staticTerms={{
                  price_per_share_nzd: lotPriceNzd ?? 0,
                  totalLeasePercent: leaseholdStake ?? totalLeasePercent,
                  leasePeriodMonths: leasePeriodMonths ?? hltRecord.lease_period_months,
                  leaseStartDate: leaseStartDate,
                  investorReturnPct:
                    investorReturnPct ?? hltRecord.investor_return_percentage,
                  shares_total: hltRecord.shares_total,
                  shares_sold: hltRecord.shares_sold,
                  ownerRatePer1PctMonth:
                    (live as any)?.owner_rate_per_1pct_month ??
                    (hlt as any).owner_rate_per_1pct_month ??
                    null,
                  platformFeePct:
                    (live as any)?.platform_fee_pct ??
                    (hlt as any).platform_fee_pct ??
                    5,
                }}
              />
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
