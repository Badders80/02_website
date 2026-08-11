import { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import {
  getCampaignStatus,
  isOnWebsite,
  type CampaignStatus,
} from "@/lib/campaign-status";
import { readInventoryList } from "@/lib/google-sheets";
import hltsData from "@/data/hlts.json";

export const runtime = "nodejs";
/** Live Sheets ops — do not SSG stale commercial state. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Discover and explore native digital-syndication opportunities within the Evolution ecosystem. Browse active offerings, ownership positions, and live data.",
  alternates: {
    canonical: "/marketplace",
  },
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: "https://www.evolutionstables.nz/marketplace",
    siteName: "Evolution Stables",
    title: "Marketplace",
    description:
      "Discover and explore native digital-syndication opportunities within the Evolution ecosystem.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Evolution Stables",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketplace",
    description:
      "Discover and explore native digital-syndication opportunities within the Evolution ecosystem.",
    images: ["/opengraph-image"],
  },
};

interface Campaign {
  id: string;
  location: string;
  trainerContact?: string;
  pedigree: string;
  price: string;
  availability: string;
  is_active: boolean;
  status: CampaignStatus;
  imageScale: string;
  horse: {
    name: string;
    image_url: string;
    story: string;
  };
  stats: {
    wins: string;
    placed: string;
    nextUp: string;
  };
}

/** Unified row shape after live merge or static fallback. */
type MarketplaceSourceRow = {
  horse_slug?: string;
  id?: string;
  horse_name?: string;
  campaign_status?: string | null;
  listing_status?: string;
  shares_total?: number | string;
  shares_sold?: number | string;
  has_terms_sheet?: boolean;
  marketplace_visible?: boolean | string | null;
  price_per_share_nzd?: number | string | null;
  trainer_location?: string | null;
  trainer_stable?: string | null;
  trainer_contact_name?: string | null;
  pedigree?: string;
  image_path?: string;
  story?: string;
  wins?: string | number;
  placed?: string | number;
  next_up?: string;
  sex?: string;
  colour?: string;
  sire_name?: string;
  dam_name?: string;
  stats?: { wins?: string; placed?: string; next_up?: string };
};

function formatLotPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined || price === "") return "—";
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return "—";
  return `$${n.toLocaleString()} NZD`;
}

function staticBySlug(): Map<string, any> {
  const map = new Map<string, any>();
  for (const h of hltsData as any[]) {
    const key = h.horse_slug || h.id;
    if (key) map.set(key, h);
  }
  return map;
}

/**
 * Prefer live Sheets inventory; on empty/failure fall back to static hlts.json.
 * Live commercial fields win; static supplies content (image, story, terms flag).
 */
async function loadMarketplaceSource(): Promise<MarketplaceSourceRow[]> {
  try {
    const live = await readInventoryList();
    if (live.length > 0) {
      const staticMap = staticBySlug();
      return live
        .filter((row) => row.slug)
        .map((row) => {
          const s = staticMap.get(row.slug) || {};
          return {
            horse_slug: row.slug,
            id: s.id || row.slug,
            horse_name: row.name || s.horse_name,
            campaign_status: row.campaign_status || s.campaign_status || null,
            listing_status: row.listing_status || s.listing_status,
            shares_total: row.shares_total,
            shares_sold: row.shares_sold,
            has_terms_sheet: s.has_terms_sheet,
            marketplace_visible:
              row.marketplace_visible !== "" && row.marketplace_visible != null
                ? row.marketplace_visible
                : s.marketplace_visible,
            price_per_share_nzd: row.price_per_share_nzd,
            trainer_location: row.trainer_location || s.trainer_location,
            trainer_stable: row.trainer_stable || s.trainer_stable,
            trainer_contact_name: s.trainer_contact_name,
            pedigree: s.pedigree,
            image_path: s.image_path,
            story: s.story,
            wins: row.wins ?? s.wins,
            placed: row.placed ?? s.placed,
            next_up: row.next_up || s.next_up,
            sex: s.sex || s.horse_sex,
            colour: s.colour || s.horse_colour,
            sire_name: s.sire_name || s.horse_sire_name,
            dam_name: s.dam_name || s.horse_dam_name,
            stats: s.stats,
          } satisfies MarketplaceSourceRow;
        });
    }
    console.warn(
      "[marketplace] Live inventory empty or unavailable; falling back to static hlts.json"
    );
  } catch (err: any) {
    console.warn(
      "[marketplace] Live inventory failed; falling back to static hlts.json:",
      err?.message || err
    );
  }
  return hltsData as unknown as MarketplaceSourceRow[];
}

function mapToCampaign(hlt: MarketplaceSourceRow): Campaign {
  const slug = hlt.horse_slug || hlt.id || "";
  const status = getCampaignStatus({
    campaign_status: hlt.campaign_status,
    listing_status: hlt.listing_status,
    shares_total: hlt.shares_total,
    shares_sold: hlt.shares_sold,
    has_terms_sheet: hlt.has_terms_sheet,
    marketplace_visible: hlt.marketplace_visible,
  });

  const location = `${(hlt.trainer_location || "Matamata NZ")
    .toUpperCase()
    .replace(/,?\s*NZ$/, "")} · ${(hlt.trainer_stable || "Wexford Stables").toUpperCase()}`;
  const trainerContact = hlt.trainer_contact_name || "";
  const sex = hlt.sex || "";
  const colour = hlt.colour || "";
  const sire = hlt.sire_name || "";
  const dam = hlt.dam_name || "";
  const pedigreeParts = [
    sex,
    colour,
    sire && dam ? `${sire} x ${dam}` : sire || dam,
  ].filter(Boolean);

  const portraitSlugs = ["hottathanafantasy", "i-stole-a-manolo"];
  const smallSlugs = ["prudentia"];
  const imageScale = portraitSlugs.includes(slug)
    ? "scale-110"
    : smallSlugs.includes(slug)
      ? "scale-90"
      : "scale-100";

  const sharesTotal = Number(hlt.shares_total) || 0;
  const sharesSold = Number(hlt.shares_sold) || 0;
  const pct =
    sharesTotal > 0 ? Math.round((sharesSold / sharesTotal) * 100) : 0;

  return {
    id: slug,
    location,
    trainerContact,
    pedigree: hlt.pedigree || pedigreeParts.join(" / "),
    price: formatLotPrice(hlt.price_per_share_nzd),
    availability: `${pct}% subscribed`,
    is_active: status === "listed",
    status,
    imageScale,
    horse: {
      name: hlt.horse_name || slug,
      image_url: hlt.image_path || "/images/content/horses/placeholder.png",
      story: hlt.story || "",
    },
    stats: {
      wins: String(hlt.wins ?? hlt.stats?.wins ?? "0"),
      placed: String(hlt.placed ?? hlt.stats?.placed ?? "0"),
      nextUp: hlt.next_up || hlt.stats?.next_up || "TBD",
    },
  };
}

export default async function MarketplacePage() {
  const source = await loadMarketplaceSource();
  const campaigns: Campaign[] = source
    .map(mapToCampaign)
    .filter((c) => c.id && isOnWebsite(c.status));

  return (
    <>
      <NavBar />
      <main className="dot-grid min-h-screen bg-canvas text-foreground font-sans selection:bg-white/10 selection:text-white">
        {/* Hero Header Section */}
        <section className="pt-40 pb-16 px-12 md:px-16 lg:px-20 max-w-6xl mx-auto">
          <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-muted-foreground mb-6">
            Evolution Stables
          </p>
          <h1 className="text-[36px] md:text-[48px] font-light tracking-tight text-heading mb-6 leading-[1.1]">
            Ownership, evolved.
          </h1>
          <p className="text-[18px] leading-[1.85] font-light text-muted-foreground max-w-2xl">
            The moments. The access. The stable. Acquire a stake in elite thoroughbreds, backed by legally binding leases, and track your stable&apos;s performance directly on-site.
          </p>
        </section>

        {/* Dynamic Listing Grid Component */}
        <ListingGrid initialCampaigns={campaigns} />
      </main>
      <Footer minimal={true} />
    </>
  );
}
