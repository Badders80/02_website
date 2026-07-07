import { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { getCampaignStatus, CampaignStatus } from "@/lib/campaign-status";
import hltsData from "@/data/hlts.json";

// SSG: data comes from local JSON, no runtime API calls.
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Marketplace | Evolution Stables",
  description:
    "Discover and explore native digital-syndication opportunities within the Evolution ecosystem. Browse active offerings, ownership positions, and live data.",
  alternates: {
    canonical: "/marketplace",
  },
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: "https://evolutionstables.nz/marketplace",
    siteName: "Evolution Stables",
    title: "Marketplace | Evolution Stables",
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
    title: "Marketplace | Evolution Stables",
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

export default async function MarketplacePage() {
  // Read from local JSON (synced from Google Sheets via replay script)
  const campaigns: Campaign[] = (hltsData as any[])
    .filter((hlt) => hlt.marketplace_visible === true || hlt.marketplace_visible === "TRUE")
    .map((hlt) => {
      const location = `${(hlt.trainer_location || "Matamata NZ").toUpperCase().replace(/,?\s*NZ$/, "")} · ${(hlt.trainer_stable || "Wexford Stables").toUpperCase()}`;
      const trainerContact = hlt.trainer_contact_name || "";
      const sex = hlt.sex || (hlt as any).horse_sex || "";
      const colour = hlt.colour || (hlt as any).horse_colour || "";
      const sire = hlt.sire_name || (hlt as any).horse_sire_name || "";
      const dam = hlt.dam_name || (hlt as any).horse_dam_name || "";
      const pedigreeParts = [sex, colour, sire && dam ? `${sire} x ${dam}` : sire || dam].filter(Boolean);
      return {
        id: hlt.horse_slug || hlt.id,
        location,
        trainerContact,
        pedigree: hlt.pedigree || pedigreeParts.join(" / "),
        price: `$${Number(hlt.price_per_share_nzd || 1500).toLocaleString()} NZD`,
        availability: `${Math.round((Number(hlt.shares_sold) / Number(hlt.shares_total)) * 100)}% subscribed`,
        is_active: hlt.listing_status === "active",
        status: getCampaignStatus(hlt),
        horse: {
          name: hlt.horse_name || hlt.id,
          image_url: hlt.image_path || "/images/content/horses/placeholder.png",
          story: hlt.story || "",
        },
        stats: {
          wins: hlt.wins || hlt.stats?.wins || "0",
          placed: hlt.placed || hlt.stats?.placed || "0",
          nextUp: hlt.next_up || hlt.stats?.next_up || "TBD",
        },
      };
    });

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-foreground font-sans selection:bg-white/10 selection:text-white">
        {/* Hero Header Section */}
        <section className="pt-40 pb-16 px-12 md:px-16 lg:px-20 max-w-6xl mx-auto">
          <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/30 mb-6">
            Evolution Stables
          </p>
          <h1 className="text-[36px] md:text-[48px] font-light tracking-tight text-white mb-6 leading-[1.1]">
            Ownership, evolved.
          </h1>
          <p className="text-[18px] leading-[1.85] font-light text-white/50 max-w-2xl">
            The moments. The access. The stable. Acquire a stake in elite thoroughbreds, backed by legally binding leases, and track your stable&apos;s performance directly on-site.
          </p>
        </section>

        {/* Philosophy — founder voice */}
        <section className="px-12 md:px-16 lg:px-20 max-w-4xl mx-auto pb-20">
          <p className="text-[14px] leading-[1.85] font-light text-white/40 max-w-2xl">
            Racing ownership has been a closed shop for centuries. Evolution makes it regulated, transparent, and accessible — from a single share to a significant stake. The technology serves the tradition; it does not replace it.
          </p>
        </section>

        {/* Dynamic Listing Grid Component */}
        <ListingGrid initialCampaigns={campaigns} isSandbox={false} />
      </main>
      <Footer minimal={true} />
    </>
  );
}
