import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { getHlts } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketplace | Evolution Stables",
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
  };
  trainer?: {
    name: string;
    stable_name: string;
    location: string;
  };
}

export default async function MarketplacePage() {
  let campaigns: Campaign[] = [];
  let errorMsg = "";

  try {
    // Fetch published or publish-ready HLTs, resolving references (horse, trainer, owner)
    const data = await getHlts({ resolve: true });
    campaigns = (data || []).filter(
      (c: any) => c.status === "published" || c.status === "publish_ready"
    );
  } catch (err: any) {
    console.error("Failed to fetch campaigns for marketplace:", err.message);
    errorMsg = "Unable to load active campaigns at the moment. Please try again shortly.";
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-foreground font-sans">
        {/* Hero / Header */}
        <section className="pt-32 pb-16 px-6 sm:px-10 lg:px-12 max-w-6xl mx-auto">
          <p className="text-[11px] font-medium tracking-[0.28em] uppercase text-white/30 mb-8">
            Evolution Stables
          </p>
          <h1 className="text-[36px] md:text-[56px] font-light tracking-tight text-white mb-6 leading-tight">
            Active Campaigns
          </h1>
          <p className="text-[16px] leading-[1.85] font-light text-white/50 max-w-2xl">
            Explore native digital syndications currently open for ownership. 
            Acquire a fraction of elite bloodstock, backed by legally binding leases, and track your stable's performance directly on-site.
          </p>
        </section>

        {/* Listings Grid */}
        <section className="px-6 sm:px-10 lg:px-12 max-w-6xl mx-auto pb-32">
          {errorMsg ? (
            <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 text-center">
              <p className="text-sm font-light text-red-400">{errorMsg}</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
              <p className="text-lg font-light text-white/60 mb-2">No active campaigns</p>
              <p className="text-sm font-light text-white/30 max-w-md mx-auto">
                All campaigns are currently fully syndicated or in pre-training. Sign up to receive notifications when new campaigns launch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {campaigns.map((camp) => {
                const horse = camp.horse;
                const trainer = camp.trainer;
                const sharesAvailable = camp.shares_total - camp.shares_sold;
                const percentPerShare = camp.fractional_interest_per_share || (100.0 / camp.shares_total);
                const sharePriceNzd = camp.share_price_cents / 100;
                
                return (
                  <article
                    key={camp.id}
                    className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04]"
                  >
                    {/* Image Header */}
                    <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden border-b border-white/[0.06]">
                      {horse?.image_url ? (
                        <Image
                          src={horse.image_url}
                          alt={horse.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-white/20 text-xs font-light">
                          Photo incoming
                        </div>
                      )}
                      
                      {/* Status Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {sharesAvailable > 0 ? (
                          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-400">
                            Accepting Owners
                          </span>
                        ) : (
                          <span className="rounded-full bg-white/10 border border-white/5 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white/50">
                            Sold Out
                          </span>
                        )}
                        <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-light uppercase tracking-wider text-white/70">
                          {percentPerShare}% Stake units
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-8 space-y-6">
                      <div>
                        <h3 className="text-[21px] font-medium tracking-tight text-white mb-2">
                          {horse?.name || "Unknown Horse"}
                        </h3>
                        <p className="text-[13px] font-light text-white/40">
                          {horse?.age ? `${horse.age}-Year-Old` : "Age unknown"} · {horse?.sex || "Unknown sex"} · {horse?.sire_name || "Unknown sire"} / {horse?.dam_name || "Unknown dam"}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 border-y border-white/[0.06] py-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Unit Price</p>
                          <p className="text-[15px] font-medium text-[#d4a964]">${sharePriceNzd.toLocaleString()} NZD</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Available</p>
                          <p className="text-[15px] font-medium text-white">{sharesAvailable} / {camp.shares_total}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Trainer</p>
                          <p className="text-[15px] font-medium text-white truncate max-w-[120px]" title={trainer?.name}>
                            {trainer?.name || "Unassigned"}
                          </p>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] font-light text-white/40">
                          {trainer?.stable_name || trainer?.location || "Matamata, NZ"}
                        </span>
                        <Link
                          href={`/marketplace/${camp.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-light tracking-[0.15em] uppercase text-white/70 hover:text-white transition-colors"
                        >
                          View Campaign
                          <svg className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
