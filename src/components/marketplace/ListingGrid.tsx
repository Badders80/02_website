"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CampaignStatus, STATUS_INFO } from "@/lib/campaign-status";

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

interface ListingGridProps {
  initialCampaigns: Campaign[];
}

export function ListingGrid({ initialCampaigns }: ListingGridProps) {
  const [filter, setFilter] = useState<"all" | "available" | "coming_soon">("all");

  const filteredCampaigns = initialCampaigns.filter((camp) => {
    if (filter === "available") return camp.status === "listed";
    if (filter === "coming_soon")
      return camp.status === "coming_soon" || camp.status === "coming_soon_details";
    return true;
  });

  const getDetailPath = (id: string) => {
    return `/marketplace/${id}`;
  };

  const showFeatured =
    filter !== "coming_soon" && filteredCampaigns.some((c) => c.status === "listed");
  const featuredCampaign = showFeatured
    ? filteredCampaigns.find((c) => c.status === "listed")
    : null;

  return (
    <div className="space-y-12">
      {/* Filter tabs */}
      <div className="flex justify-start border-b border-white/[0.04] pb-4 gap-8 max-w-6xl mx-auto px-12 md:px-16 lg:px-20 select-none">
        {([
          { key: "all", label: "All Horses" },
          { key: "available", label: "Available" },
          { key: "coming_soon", label: "Coming Soon" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-all duration-300 relative py-1 cursor-pointer ${
              filter === tab.key
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {tab.label}
            {filter === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-white animate-fade-in" />
            )}
          </button>
        ))}
      </div>

      {/* Campaign List */}
      <section className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto pb-32 space-y-6">
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-20 text-white/30 text-sm font-light">
            No horses in this category.
          </div>
        )}
        {filteredCampaigns.map((camp) => {
          const isFeatured = featuredCampaign && camp.id === featuredCampaign.id;
          const statusInfo = STATUS_INFO[camp.status];

          // Shared badge component — top-right overlay on the image
          const StatusBadge = () => (
            <div className={`absolute top-4 right-4 z-10 flex items-center gap-1.5 backdrop-blur-md border rounded-full px-3 py-1 select-none ${statusInfo.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
              <span className="text-[8px] uppercase tracking-widest font-medium">
                {statusInfo.label}
              </span>
            </div>
          );

          if (isFeatured) {
            // Large featured card
            return (
              <article
                key={camp.id}
                className="group flex flex-col md:flex-row gap-8 md:gap-12 items-stretch bg-white/[0.01] backdrop-blur-md border border-white/[0.04] hover:border-white/[0.08] rounded-3xl p-6 md:p-8 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:bg-white/[0.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              >
                {/* Media Column */}
                <Link
                  href={getDetailPath(camp.id)}
                  className="block w-full md:w-[60%] flex-shrink-0 md:order-last"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
                    <Image
                      src={camp.horse.image_url}
                      alt={camp.horse.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      className={`object-contain ${camp.imageScale} opacity-90 transition-transform duration-[2400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-hover:opacity-100`}
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    <StatusBadge />
                  </div>
                </Link>

                {/* Text Column */}
                <div className="flex flex-col justify-end w-full md:w-[40%] py-2 pr-0 md:pr-6 md:order-first">
                  <div className="space-y-4 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <div>
                      <h3 className="text-[32px] md:text-[36px] font-light tracking-tight text-white leading-none transition-colors duration-300">
                        {camp.horse.name}
                      </h3>
                    </div>

                    <p className="text-[14px] leading-[1.85] font-light text-zinc-400">
                      {camp.horse.story}
                    </p>

                    {/* Hover stats — only for available horses */}
                    {camp.status === "listed" && (
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
                          <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-0.5">next up</p>
                          <p className="text-[13px] font-light text-zinc-300">{camp.stats.nextUp}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6">
                    <Link
                      href={getDetailPath(camp.id)}
                      className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-white/60 group-hover:text-white transition-colors duration-300"
                    >
                      <span>Explore Offering</span>
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          } else {
            // Standard card
            return (
              <article
                key={camp.id}
                className="group flex flex-col md:flex-row gap-6 md:gap-8 items-stretch bg-white/[0.005] backdrop-blur-md border border-white/[0.03] hover:border-white/[0.06] rounded-3xl p-5 md:p-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:bg-white/[0.015] hover:shadow-[0_0_30px_rgba(255,255,255,0.01),0_15px_30px_rgba(0,0,0,0.4)]"
              >
                {/* Media Column */}
                <Link
                  href={getDetailPath(camp.id)}
                  className="block w-full md:w-[40%] flex-shrink-0 md:order-last"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
                    <Image
                      src={camp.horse.image_url}
                      alt={camp.horse.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className={`object-contain ${camp.imageScale} opacity-90 transition-transform duration-[2400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-hover:opacity-100`}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    <StatusBadge />
                  </div>
                </Link>

                {/* Text Column */}
                <div className="flex flex-col justify-end w-full md:w-[60%] py-2 pr-0 md:pr-6 md:order-first">
                  <div className="space-y-3 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <div>
                      <h3 className="text-[26px] font-light tracking-tight text-white/90 leading-none transition-colors duration-300 group-hover:text-white">
                        {camp.horse.name}
                      </h3>
                    </div>

                    <p className="text-[13px] leading-[1.8] font-light text-zinc-400">
                      {camp.horse.story}
                    </p>

                    {/* Location removed — less is more on cards */}
                  </div>

                  <div className="pt-6">
                    <Link
                      href={getDetailPath(camp.id)}
                      className="inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase text-white/60 group-hover:text-white transition-colors duration-300"
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