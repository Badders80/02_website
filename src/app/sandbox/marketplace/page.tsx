import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ListingGridSandbox } from "@/components/marketplace/ListingGridSandbox";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketplace (Sandbox)",
  description:
    "Discover and explore native digital-syndication opportunities within the Evolution ecosystem. Browse active offerings, ownership positions, and live data.",
};

import { CampaignStatus } from "@/lib/campaign-status";

interface Campaign {
  id: string;
  location: string;
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

export default async function MarketplaceSandboxPage() {
  const campaigns: Campaign[] = [
    {
      id: "prudentia",
      location: "MATAMATA · WEXFORD STABLES",
      pedigree: "Mare / Bay / Proisir (AUS) x Little Bit Irish (NZ)",
      price: "$1,500 NZD",
      availability: "77 / 100 Left",
      is_active: true,
      status: "listed",
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
      status: "coming_soon",
      horse: {
        name: "Hottathanafantasy",
        image_url: "/images/content/horses/Hottathan-BG.png",
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
      status: "completed",
      horse: {
        name: "First Gear",
        image_url: "/images/content/horses/FirstGear-BG.png",
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
      status: "coming_soon_details",
      horse: {
        name: "I Stole A Manolo",
        image_url: "/images/content/horses/IStole-BG.png",
        story: "A stylish grey filly with a pedigree suggesting middle-distance strength. Currently spelling after early breaking-in.",
      },
      stats: {
        wins: "0",
        placed: "0",
        nextUp: "Trial (Sep)",
      },
    },
  ];

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

        {/* Interactive Sandbox Grid Component */}
        <ListingGridSandbox initialCampaigns={campaigns} />
      </main>
      <Footer minimal={true} />
    </>
  );
}
