import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import hltsData from "@/data/hlts.json";

// SSG: data comes from local JSON, no runtime API calls.
export const runtime = "nodejs";

export const metadata = {
  title: "Marketplace | Evolution Stables",
  description:
    "Discover and explore native digital-syndication opportunities within the Evolution ecosystem. Browse active offerings, ownership positions, and live data.",
};

interface Campaign {
  id: string;
  location: string;
  pedigree: string;
  price: string;
  availability: string;
  is_active: boolean;
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
      const sex = hlt.sex || (hlt as any).horse_sex || "";
      const colour = hlt.colour || (hlt as any).horse_colour || "";
      const sire = hlt.sire_name || (hlt as any).horse_sire_name || "";
      const dam = hlt.dam_name || (hlt as any).horse_dam_name || "";
      const pedigreeParts = [sex, colour, sire && dam ? `${sire} x ${dam}` : sire || dam].filter(Boolean);
      return {
        id: hlt.horse_slug || hlt.id,
        location,
        pedigree: hlt.pedigree || pedigreeParts.join(" / "),
        price: `$${(hlt.price_per_share_nzd || 1500).toLocaleString()} NZD`,
        availability: `${hlt.shares_total - hlt.shares_sold} / ${hlt.shares_total} Left`,
        is_active: hlt.listing_status === "active",
        horse: {
          name: hlt.horse_name || hlt.id,
          image_url: hlt.image_path || "/images/content/horses/placeholder.png",
          story: hlt.story || "",
        },
        stats: {
          wins: hlt.stats?.wins || "0",
          placed: hlt.stats?.placed || "0",
          nextUp: hlt.stats?.next_up || "TBD",
        },
      };
    });

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-foreground font-sans selection:bg-white/10 selection:text-white">
        {/* Hero Header Section */}
        <section className="pt-40 pb-16 px-12 md:px-16 lg:px-20 max-w-6xl mx-auto">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-6">
            Evolution Stables
          </p>
          <h1 className="text-[36px] md:text-[48px] font-light tracking-tight text-white mb-6 leading-[1.1]">
            Marketplace
          </h1>
          <p className="text-[18px] leading-[1.85] font-light text-white/65 max-w-2xl">
            Explore native digital syndications currently open for ownership. 
            Acquire a fraction of elite bloodstock, backed by legally binding leases, and track your stable's performance directly on-site.
          </p>
        </section>

        {/* Dynamic Listing Grid Component */}
        <ListingGrid initialCampaigns={campaigns} isSandbox={false} />
      </main>
      <Footer minimal={true} />
    </>
  );
}
