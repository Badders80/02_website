"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

interface ListingGridProps {
  initialCampaigns: Campaign[];
  isSandbox?: boolean;
}

export function ListingGrid({ initialCampaigns, isSandbox = false }: ListingGridProps) {
  const [filter, setFilter] = useState<"all" | "active" | "subscribed">("all");

  const filteredCampaigns = initialCampaigns.filter((camp) => {
    if (filter === "active") return camp.is_active;
    if (filter === "subscribed") return !camp.is_active;
    return true;
  });

  const getDetailPath = (id: string) => {
    return isSandbox ? `/sandbox/marketplace/${id}` : `/marketplace/${id}`;
  };

  const showFeatured = filter !== "subscribed" && filteredCampaigns.some((c) => c.is_active);
  const featuredCampaign = showFeatured ? filteredCampaigns.find((c) => c.is_active) : null;

  return (
    <div className="space-y-12">
      {/* Low-profile filter navigation (Apple Arcade style) */}
      <div className="flex justify-start border-b border-white/[0.04] pb-4 gap-8 max-w-6xl mx-auto px-12 md:px-16 lg:px-20 select-none">
        {(["all", "active", "subscribed"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-all duration-300 relative py-1 cursor-pointer ${
              filter === tab
                ? "text-[#d4a964]"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {tab === "all" ? "All Offerings" : tab === "active" ? "Open Stakes" : "Fully Subscribed"}
            {filter === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#d4a964] animate-fade-in" />
            )}
          </button>
        ))}
      </div>

      {/* Campaign List Stack */}
      <section className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto pb-32 space-y-6">
        {filteredCampaigns.map((camp) => {
          const isFeatured = featuredCampaign && camp.id === featuredCampaign.id;

          if (isFeatured) {
            // 1. Large Featured Split Card (Sleeker and shallower height)
            return (
              <article
                key={camp.id}
                className="group flex flex-col md:flex-row gap-8 md:gap-12 items-stretch bg-white/[0.01] backdrop-blur-md border border-white/[0.04] hover:border-white/[0.08] rounded-3xl p-6 md:p-8 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:bg-white/[0.02] hover:shadow-[0_0_50px_rgba(212,169,100,0.02),0_20px_40px_rgba(0,0,0,0.5)]"
              >
                {/* Media Column (Always on the Right for desktop) */}
                <Link
                  href={getDetailPath(camp.id)}
                  className="block w-full md:w-[60%] flex-shrink-0 md:order-last"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-950">
                    <Image
                      src={camp.horse.image_url}
                      alt={camp.horse.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      className="object-cover opacity-90 transition-transform duration-[2400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-hover:opacity-100"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 pointer-events-none" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                      <span className="text-[8px] uppercase tracking-widest font-medium text-white/80">
                        Open Stakes
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Text Column (Always on the Left for desktop) */}
                <div className="flex flex-col justify-end w-full md:w-[40%] py-2 pr-0 md:pr-6 md:order-first">
                  {/* Content Group (Title + Story + Stats) */}
                  <div className="space-y-4 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <div>
                      <h3 className="text-[32px] md:text-[36px] font-light tracking-tight text-white leading-none transition-colors duration-300">
                        {camp.horse.name}
                      </h3>
                    </div>

                    <p className="text-[14px] leading-[1.85] font-light text-zinc-400">
                      {camp.horse.story}
                    </p>

                    {/* Hover Stats Section */}
                    <div className="grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-4 opacity-0 max-h-0 overflow-hidden pointer-events-none transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:max-h-20 group-hover:pointer-events-auto">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-0.5">wins</p>
                        <p className="text-[15px] font-medium text-white">{camp.stats.wins}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-0.5">placed</p>
                        <p className="text-[15px] font-medium text-white">{camp.stats.placed}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#d4a964] mb-0.5">next up</p>
                        <p className="text-[13px] font-light text-zinc-300">{camp.stats.nextUp}</p>
                      </div>
                    </div>
                  </div>

                  {/* Explore Offering (Apple-style interactive link) */}
                  <div className="pt-6">
                    <Link
                      href={getDetailPath(camp.id)}
                      className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-[#d4a964] group-hover:text-white transition-colors duration-300"
                    >
                      <span>Explore Offering</span>
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          } else {
            // 2. Smaller Subscribed Horizontal Card
            return (
              <article
                key={camp.id}
                className="group flex flex-col md:flex-row gap-6 md:gap-8 items-stretch bg-white/[0.005] backdrop-blur-md border border-white/[0.03] hover:border-white/[0.06] rounded-3xl p-5 md:p-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:bg-white/[0.015] hover:shadow-[0_0_30px_rgba(255,255,255,0.01),0_15px_30px_rgba(0,0,0,0.4)]"
              >
                {/* Media Column (Always on the Right for desktop) */}
                <Link
                  href={getDetailPath(camp.id)}
                  className="block w-full md:w-[40%] flex-shrink-0 md:order-last"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/[0.03] bg-zinc-950">
                    <Image
                      src={camp.horse.image_url}
                      alt={camp.horse.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover opacity-90 transition-transform duration-[2400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 pointer-events-none" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                      <span className="text-[8px] uppercase tracking-widest font-medium text-white/80">
                        Subscribed
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Text Column (Always on the Left for desktop) */}
                <div className="flex flex-col justify-end w-full md:w-[60%] py-2 pr-0 md:pr-6 md:order-first">
                  {/* Content Group (Title + Story - No stats reveal needed since they are subscribed/TBD) */}
                  <div className="space-y-3 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <div>
                      <h3 className="text-[26px] font-light tracking-tight text-white/90 leading-none transition-colors duration-300 group-hover:text-white">
                        {camp.horse.name}
                      </h3>
                    </div>

                    <p className="text-[13px] leading-[1.8] font-light text-zinc-400">
                      {camp.horse.story}
                    </p>
                  </div>

                  {/* Explore Offering */}
                  <div className="pt-6">
                    <Link
                      href={getDetailPath(camp.id)}
                      className="inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase text-[#d4a964] group-hover:text-white transition-colors duration-300"
                    >
                      <span>Explore Offering</span>
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          }
        })}
      </section>
    </div>
  );
}
