import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ListingGridSandbox } from "@/components/marketplace/ListingGridSandbox";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketplace (Sandbox) | Evolution Stables",
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

export default async function MarketplaceSandboxPage() {
  const campaigns: Campaign[] = [
    {
      id: "prudentia",
      location: "MATAMATA · WEXFORD STABLES",
      pedigree: "Mare / Bay / Proisir (AUS) x Little Bit Irish (NZ)",
      price: "$1,500 NZD",
      availability: "77 / 100 Left",
      is_active: true,
      horse: {
        name: "Prudentia",
        image_url: "https://storage.googleapis.com/tokinvest-ds-bucket/offering/2a02e2f0-ead0-4abf-abca-0b2c84eb1107.JPG",
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
