import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { getHlts } from "@/lib/api";
import { ListingGrid } from "@/components/marketplace/ListingGrid";

export const dynamic = "force-dynamic";

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
  // Define 4 premium campaigns using the Asymmetric Row specifications
  const MOCK_CAMPAIGNS: Campaign[] = [
    {
      id: "prudentia",
      location: "MATAMATA · WEXFORD STABLES",
      pedigree: "Mare / Bay / Proisir (AUS) x Little Bit Irish (NZ)",
      price: "$1,500 NZD",
      availability: "77 / 100 Left",
      is_active: true,
      horse: {
        name: "Prudentia",
        image_url: "/images/content/stables/prudentia-action.png",
        story: "An exciting filly that has already returned returns to investors. Much more to come from her this winter.",
      },
      stats: {
        wins: "2",
        placed: "4",
        nextUp: "23 June",
      },
    },
    {
      id: "hottathanafantasy",
      location: "MATAMATA · WEXFORD STABLES",
      pedigree: "Filly / Bay / Contributer x Whiffle",
      price: "$1,500 NZD",
      availability: "100 / 100 Left",
      is_active: false,
      horse: {
        name: "Hottathanafantasy",
        image_url: "https://images.squarespace-cdn.com/content/v1/68b3a55795fa0517264bfda3/ecff499a-445a-4cf0-a746-29e763e5ec4c/5caf253b-5ed3-485a-a8ba-4e14cf8ecb73.JPG?format=750w",
        story: "An elite international pedigree showing immense maturity in pre-training. A sharp sprinter in the making.",
      },
      stats: {
        wins: "0",
        placed: "0",
        nextUp: "TBD",
      },
    },
    {
      id: "first-gear",
      location: "PALMERSTON NORTH · COPPER BELT LODGE",
      pedigree: "Gelding / Bay / Derryn x A'Guin Ace",
      price: "$1,500 NZD",
      availability: "100 / 100 Left",
      is_active: false,
      horse: {
        name: "First Gear",
        image_url: "https://storage.googleapis.com/tokinvest-ds-bucket/offering/0f8455e5-6ae4-4524-9ced-43115c3d966b.png",
        story: "An impressive pedigree showing great progress in early education. Currently in pre-training under Stephen Gray.",
      },
      stats: {
        wins: "0",
        placed: "0",
        nextUp: "TBD",
      },
    },
    {
      id: "i-stole-a-manolo",
      location: "MATAMATA · WEXFORD STABLES",
      pedigree: "Filly / Bay / Satono Aladdin x Canuhandleajandal",
      price: "$1,500 NZD",
      availability: "100 / 100 Left",
      is_active: false,
      horse: {
        name: "I Stole A Manolo",
        image_url: "https://images.squarespace-cdn.com/content/v1/68b3a55795fa0517264bfda3/24dba76b-c802-4d2a-9257-9b73eb5c28f7/IMG_7126.jpg?format=750w",
        story: "A stylish grey filly with a pedigree suggesting middle-distance strength. Currently spelling after early breaking-in.",
      },
      stats: {
        wins: "0",
        placed: "0",
        nextUp: "Trial (Sep)",
      },
    },
  ];

  let campaigns: Campaign[] = [];
  const isBypass = process.env.NEXT_PUBLIC_BYPASS_STRIPE === "true" || process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";

  if (isBypass) {
    campaigns = MOCK_CAMPAIGNS;
  } else {
    try {
      const data = await getHlts({ resolve: true });
      const active = (data || []).filter(
        (c: any) => c.status === "published" || c.status === "publish_ready" || c.status === "reviewed"
      );
      if (active && active.length > 0) {
        // Map dynamic records to Asymmetric Row format
        campaigns = active.map((c: any) => {
          const mockMatch = MOCK_CAMPAIGNS.find((m) => m.id === c.id);
          return {
            id: c.id,
            location: mockMatch?.location || (c.trainer ? `${c.trainer.location.toUpperCase()} · ${c.trainer.stable_name.toUpperCase()}` : "MATAMATA · WEXFORD STABLES"),
            pedigree: mockMatch?.pedigree || `${c.horse?.sex || "Horse"} / ${c.horse?.colour || "Bay"} / ${c.horse?.sire_name || "Sire"} x ${c.horse?.dam_name || "Dam"}`,
            price: mockMatch?.price || `$${((c.share_price_cents || 150000) / 100).toLocaleString()} NZD`,
            availability: mockMatch?.availability || `${c.shares_total - c.shares_sold} / ${c.shares_total} Left`,
            is_active: c.status === "published" || c.status === "publish_ready",
            horse: {
              name: c.horse?.name || "Thoroughbred",
              image_url: c.horse?.image_url || mockMatch?.horse.image_url || "https://storage.googleapis.com/tokinvest-ds-bucket/offering/2a02e2f0-ead0-4abf-abca-0b2c84eb1107.JPG",
              story: c.horse?.story || mockMatch?.horse.story || "",
            },
            stats: {
              wins: mockMatch?.stats?.wins || "0",
              placed: mockMatch?.stats?.placed || "0",
              nextUp: mockMatch?.stats?.nextUp || "TBD"
            }
          };
        });
      } else {
        campaigns = MOCK_CAMPAIGNS;
      }
    } catch (err: any) {
      // Backend unreachable in local dev (Vercel OIDC → GCP STS only works on Vercel).
      // This is an expected soft failure — fall back to MOCK_CAMPAIGNS.
      console.warn("Marketplace: backend unavailable, using mock data.", err?.message);
      campaigns = MOCK_CAMPAIGNS;
    }
  }

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
