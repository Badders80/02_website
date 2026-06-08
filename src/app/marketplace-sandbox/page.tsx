import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { getHlts } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketplace (Sandbox) | Evolution Stables",
  description:
    "Discover and explore native digital-syndication opportunities within the Evolution ecosystem. Browse active offerings, ownership positions, and live data.",
};

interface Campaign {
  id: string;
  status: string;
  shares_total: number;
  shares_sold: number;
  share_price_cents: number;
  fractional_interest_per_share?: number;
  horse_microchip: string;
  horse?: {
    name: string;
    age?: number;
    sex: string;
    colour?: string;
    sire_name?: string;
    dam_name?: string;
    image_url?: string;
    story?: string;
  };
  trainer?: {
    name: string;
    stable_name: string;
    location: string;
  };
}

export default async function MarketplaceSandboxPage() {
  let activeCampaigns: Campaign[] = [];
  let comingSoonCampaigns: Campaign[] = [];
  let errorMsg = "";

  // Mock candidates from the sandbox files for local testing/dev bypass
  const MOCK_ACTIVE: Campaign = {
    id: "prudentia",
    status: "published",
    shares_total: 100,
    shares_sold: 23,
    share_price_cents: 150000,
    fractional_interest_per_share: 1.0,
    horse_microchip: "982000123456789",
    horse: {
      name: "Prudentia",
      age: 4,
      sex: "Mare",
      colour: "Bay",
      sire_name: "Proisir (AUS)",
      dam_name: "Little Bit Irish (NZ)",
      image_url: "/updates/prudentia_te_rapa_may30.jpg",
      story: "A four-year-old mare with a maiden victory and Rating 65 experience. Now in open competition under Lance O'Sullivan at Wexford Stables."
    },
    trainer: {
      name: "Lance O'Sullivan",
      stable_name: "Wexford Stables",
      location: "Matamata, NZ"
    }
  };

  const MOCK_COMING: Campaign[] = [
    {
      id: "hottathanafantasy",
      status: "reviewed",
      shares_total: 100,
      shares_sold: 0,
      share_price_cents: 150000,
      fractional_interest_per_share: 1.0,
      horse_microchip: "982000123456788",
      horse: {
        name: "Hottathanafantasy",
        age: 2,
        sex: "Filly",
        colour: "Bay",
        sire_name: "Contributer",
        dam_name: "Whiffle",
        image_url: "/images/marketplace/hottathanafantasy.jpg",
        story: "A promising two-year-old with an elite international pedigree. Currently in her first racing preparation at Wexford Stables under Lance O'Sullivan."
      },
      trainer: {
        name: "Lance O'Sullivan",
        stable_name: "Wexford Stables",
        location: "Matamata, NZ"
      }
    },
    {
      id: "first-gear",
      status: "reviewed",
      shares_total: 100,
      shares_sold: 0,
      share_price_cents: 150000,
      fractional_interest_per_share: 1.0,
      horse_microchip: "982000123456787",
      horse: {
        name: "First Gear",
        age: 4,
        sex: "Gelding",
        colour: "Bay",
        sire_name: "Derryn",
        dam_name: "A'Guin Ace",
        image_url: "/images/marketplace/first-gear.png",
        story: "Early race success with $20K+ in prizemoney and international buyer interest. Trained by Group 1-winning horseman Stephen Gray at Copper Belt Lodge."
      },
      trainer: {
        name: "Stephen Gray",
        stable_name: "Copper Belt Lodge",
        location: "Palmerston North, NZ"
      }
    },
    {
      id: "i-stole-a-manolo",
      status: "reviewed",
      shares_total: 100,
      shares_sold: 0,
      share_price_cents: 150000,
      fractional_interest_per_share: 1.0,
      horse_microchip: "982000123456786",
      horse: {
        name: "I Stole A Manolo",
        age: 2,
        sex: "Filly",
        colour: "Bay",
        sire_name: "Satono Aladdin",
        dam_name: "Canuhandleajandal",
        image_url: "/images/marketplace/i-stole-a-manolo.jpg", // fallback placeholder image handled in render
        story: "Daughter of Group 1 winner Satono Aladdin with real presence and correct action. In early racing education at Wexford Stables."
      },
      trainer: {
        name: "Lance O'Sullivan & Andrew Scott",
        stable_name: "Wexford Stables",
        location: "Matamata, NZ"
      }
    }
  ];

  const isBypass = process.env.NEXT_PUBLIC_BYPASS_STRIPE === "true" || process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";

  if (isBypass) {
    activeCampaigns = [MOCK_ACTIVE];
    comingSoonCampaigns = MOCK_COMING;
  } else {
    try {
      const data = await getHlts({ resolve: true });
      const rawCampaigns: Campaign[] = data || [];
      activeCampaigns = rawCampaigns.filter(
        (c) => c.status === "published" || c.status === "publish_ready"
      );
      comingSoonCampaigns = rawCampaigns.filter(
        (c) => c.status === "reviewed"
      );
    } catch (err: any) {
      console.error("Failed to fetch campaigns for sandbox marketplace:", err.message);
      errorMsg = "Unable to load active campaigns at the moment. Please try again shortly.";
      // Fall back to mocks in case backend cloud function isn't seeded/deployed yet
      activeCampaigns = [MOCK_ACTIVE];
      comingSoonCampaigns = MOCK_COMING;
    }
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-foreground font-sans selection:bg-white/10 selection:text-white">
        {/* Header (Generous Editorial Spacing) */}
        <section className="pt-40 pb-20 px-12 md:px-16 lg:px-20 max-w-6xl mx-auto">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-6">
            Evolution Stables
          </p>
          <h1 className="text-[36px] md:text-[48px] font-light tracking-tight text-white mb-6 leading-[1.1]">
            Active Campaigns
          </h1>
          <p className="text-[18px] leading-[1.85] font-light text-white/65 max-w-2xl">
            Explore native digital syndications currently open for ownership. 
            Acquire a fraction of elite bloodstock, backed by legally binding leases, and track your stable's performance directly on-site.
          </p>
        </section>

        {/* Listings Sections */}
        <section className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto pb-32 space-y-24">
          {errorMsg && (
            <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4 text-center">
              <p className="text-xs font-light text-red-400/80">{errorMsg}</p>
            </div>
          )}

          {/* Active Campaigns */}
          <div className="space-y-8">
            <div className="flex justify-between items-baseline border-b border-white/[0.06] pb-4">
              <h2 className="text-sm uppercase tracking-wider text-white/80 font-light">Offering</h2>
              <span className="text-[11px] font-light text-white/35">
                {activeCampaigns.length} Active Offering{activeCampaigns.length !== 1 ? 's' : ''}
              </span>
            </div>

            {activeCampaigns.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-12 text-center">
                <p className="text-md font-light text-white/50 mb-1">No active campaigns</p>
                <p className="text-xs font-light text-white/30">Check back shortly or register below to join upcoming syndicates.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {activeCampaigns.map((camp) => {
                  const horse = camp.horse;
                  const trainer = camp.trainer;
                  const sharesAvailable = camp.shares_total - camp.shares_sold;
                  const percentPerShare = camp.fractional_interest_per_share || (100.0 / camp.shares_total);
                  const sharePriceNzd = camp.share_price_cents / 100;
                  const reservedPercent = (camp.shares_sold / camp.shares_total) * 100;

                  return (
                    <article
                      key={camp.id}
                      className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04] flex flex-col justify-between"
                    >
                      {/* Image Header */}
                      <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden">
                        {horse?.image_url ? (
                          <Image
                            src={horse.image_url}
                            alt={horse.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-white/20 text-xs font-light">
                            Photo incoming
                          </div>
                        )}
                        
                        {/* Custom Badges (Monochrome luxury) */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[9px] font-medium uppercase tracking-wider text-emerald-400/90 border border-emerald-500/10">
                            NZTR Verified
                          </span>
                          <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[9px] font-medium uppercase tracking-wider text-[#d4a964] border border-[#d4a964]/10">
                            {sharesAvailable} Available
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-medium tracking-tight text-white group-hover:text-[#d4a964] transition-colors duration-300">
                              {horse?.name || "Unknown Horse"}
                            </h3>
                            <p className="text-[12px] font-light text-white/45 mt-1">
                              {horse?.sex || "Horse"} · {horse?.age ? `${horse.age}YO` : ""} · {horse?.sire_name} x {horse?.dam_name}
                            </p>
                          </div>
                          
                          <p className="text-[13px] leading-[1.6] font-light text-white/60 line-clamp-3">
                            {horse?.story}
                          </p>
                        </div>

                        {/* Trainer Row */}
                        {trainer && (
                          <div className="flex items-center gap-3 border-y border-white/[0.04] py-4">
                            <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[10px] text-white/70">
                              {trainer.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-white/90 truncate">{trainer.name}</p>
                              <p className="text-[10px] text-white/40 truncate">{trainer.stable_name} · {trainer.location}</p>
                            </div>
                          </div>
                        )}

                        {/* Stats & Core Terms */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-white/30 mb-0.5">Per Unit</p>
                            <p className="text-sm font-light text-white">${sharePriceNzd.toLocaleString()} NZD</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] uppercase tracking-wider text-white/30 mb-0.5">Fraction</p>
                            <p className="text-sm font-medium text-[#d4a964]">{percentPerShare}%</p>
                          </div>
                        </div>

                        {/* Reserved progress bar (Limited Gold) */}
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between text-[10px] font-light text-white/40">
                            <span>{camp.shares_sold} units reserved</span>
                            <span>{camp.shares_total} total</span>
                          </div>
                          <div className="h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#d4a964]/80 to-[#d4a964] transition-all duration-1000"
                              style={{ width: `${reservedPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* CTA Link */}
                        <div className="pt-6">
                          <Link
                            href={`/marketplace-sandbox/${camp.id}`}
                            className="w-full text-center py-3 rounded-full text-[10px] font-medium uppercase tracking-widest bg-white text-black hover:bg-white/95 transition-all duration-300 inline-block"
                          >
                            View Campaign
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coming Soon Campaigns */}
          <div className="space-y-8">
            <div className="flex justify-between items-baseline border-b border-white/[0.06] pb-4">
              <h2 className="text-sm uppercase tracking-wider text-white/80 font-light">Coming Soon</h2>
              <span className="text-[11px] font-light text-white/35">
                {comingSoonCampaigns.length} Preview Campaign{comingSoonCampaigns.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {comingSoonCampaigns.map((camp) => {
                const horse = camp.horse;
                const trainer = camp.trainer;

                return (
                  <article
                    key={camp.id}
                    className="group relative rounded-2xl border border-white/[0.04] bg-white/[0.01] overflow-hidden transition-all duration-500 hover:border-white/[0.08] hover:bg-white/[0.02] flex flex-col justify-between opacity-80 hover:opacity-100"
                  >
                    {/* Grayscale / Dark Image Header */}
                    <div className="relative aspect-[16/10] bg-zinc-950 overflow-hidden">
                      {horse?.image_url ? (
                        <Image
                          src={horse.image_url}
                          alt={horse.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover grayscale brightness-50 contrast-125 transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-[20%] group-hover:brightness-[0.7]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-white/10 text-xs font-light">
                          Photo incoming
                        </div>
                      )}
                      
                      {/* Coming soon label badge */}
                      <div className="absolute top-4 right-4">
                        <span className="rounded-full bg-[#d4a964]/10 border border-[#d4a964]/20 px-2.5 py-0.5 text-[8px] font-medium uppercase tracking-wider text-[#d4a964]">
                          Coming Soon
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-md font-medium tracking-tight text-white">
                            {horse?.name || "Thoroughbred"}
                          </h3>
                          <p className="text-[10px] font-light text-white/40 mt-0.5">
                            {horse?.sex} · {horse?.age}YO · {horse?.sire_name} x {horse?.dam_name}
                          </p>
                        </div>
                        <p className="text-xs leading-[1.6] font-light text-white/50 line-clamp-3">
                          {horse?.story}
                        </p>
                      </div>

                      {/* Info & Waitlist CTA */}
                      <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between">
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">
                          {trainer?.stable_name || "W Wexford Stables"}
                        </span>
                        <a
                          href="#"
                          className="inline-flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-widest text-[#d4a964] hover:opacity-85 transition-opacity"
                        >
                          Join Waitlist
                          <svg className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer minimal={true} />
    </>
  );
}
