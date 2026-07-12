"use client";
import { useState } from "react";
import Image from "next/image";

interface DocumentStatus {
  status: string;
  gcs_url: string | null;
}

interface HltData {
  id: string;
  lease_period_months: number;
  lease_start_date: string;
  leasehold_stake_percentage: number;
  investor_return_percentage: number;
  documents?: {
    term_sheet?: DocumentStatus;
    pds?: DocumentStatus;
    sa?: DocumentStatus;
  };
  horse?: {
    name: string;
    story?: string;
    sire_name?: string;
    dam_name?: string;
    sex?: string;
    colour?: string;
    age?: number;
    breeding_url?: string | null;
    pedigree_data?: any;
  };
  trainer?: {
    name: string;
    stable_name: string;
    location: string;
    nztr_license_number?: string;
  };
}

interface DetailTabsSandboxProps {
  hlt: HltData;
  races: Array<{
    date: string;
    venue: string;
    race: string;
    trackCondition?: string;
    result: string;
    margin?: string;
  }>;
}

import { PedigreeTableSandbox } from "./PedigreeTableSandbox";

export function DetailTabsSandbox({ hlt, races }: DetailTabsSandboxProps) {
  const [activeTab, setActiveTab] = useState<"details" | "pedigree" | "trainer" | "race-record" | "documents">("details");

  const getDocUrl = (docType: "pds" | "sa" | "term_sheet") => {
    // GCS backend retired — documents now served via local paths or external links
    const docUrl = hlt.documents?.[docType]?.gcs_url;
    return docUrl || "#";
  };

  const hasDoc = (docType: "pds" | "sa" | "term_sheet") => {
    return !!hlt.documents?.[docType]?.gcs_url;
  };

  const isWexford = 
    hlt.trainer?.stable_name?.toLowerCase().includes("wexford") || 
    hlt.trainer?.name?.toLowerCase().includes("wexford");

  return (
    <div className="space-y-8">
      {/* Tab Selectors */}
      <div className="flex border-b border-white/[0.06] overflow-x-auto scrollbar-none">
        {(["details", "pedigree", "trainer", "race-record", "documents"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`py-4 px-6 text-xs uppercase tracking-widest font-light transition-all border-b-2 -mb-[2px] whitespace-nowrap ${
              activeTab === tab
                ? "border-[#d4a964] text-[#d4a964] font-medium"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="pt-2 min-h-[200px]">
        {/* Details Panel */}
        {activeTab === "details" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-md font-medium text-white">Expanded Pedigree & Story</h4>
            <p className="text-sm leading-[1.8] text-white/50 font-light">
              {hlt.horse?.name || "This thoroughbred"} represents a strategic leasehold campaign within the Evolution syndicate network. 
              Sired by <span className="text-white font-normal">{hlt.horse?.sire_name || "—"}</span> out of <span className="text-white font-normal">{hlt.horse?.dam_name || "—"}</span>, 
              her breeding carries proven speed and durability profiles suited for domestic New Zealand benchmark competition.
            </p>
            <p className="text-sm leading-[1.8] text-white/50 font-light">
              Trained under professional preparations, she has shown great adaptability to track variations and is being built toward late-season stakes qualifications. 
              Review the legal syndicate agreements to learn more about the fractional terms.
            </p>
          </div>
        )}

        {/* Pedigree Panel */}
        {activeTab === "pedigree" && (
          <PedigreeTableSandbox
            horseName={hlt.horse?.name || ""}
            sireName={hlt.horse?.sire_name || ""}
            damName={hlt.horse?.dam_name || ""}
            sex={hlt.horse?.sex || ""}
            colour={hlt.horse?.colour || ""}
            age={hlt.horse?.age}
            breedingUrl={hlt.horse?.breeding_url}
            pedigreeData={hlt.horse?.pedigree_data}
          />
        )}

        {/* Trainer Panel */}
        {activeTab === "trainer" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-md font-medium text-white mb-2">Trainer Profile</h4>
            {hlt.trainer ? (
              isWexford ? (
                <div className="grid grid-cols-1 md:grid-cols-[200px,1fr] gap-8 items-start font-light">
                  {/* Photo & Video Card */}
                  <div className="space-y-4">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-white/[0.08] bg-zinc-950">
                      <Image
                        src="/images/content/stables/trainer-wexford.png"
                        alt="Lance O'Sullivan & Andrew Scott"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <a
                      href="https://share.google/PHnBC9AaKVlo2llf2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03] transition duration-300"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/[0.08] bg-zinc-900">
                        <Image
                          src="/images/content/stables/trainer-wexford.png"
                          alt="Video thumbnail"
                          fill
                          className="object-cover opacity-60 group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <svg className="w-4 h-4 text-white/90 group-hover:scale-110 transition duration-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] uppercase tracking-widest text-[#d4a964] font-medium">Watch More</p>
                        <p className="text-[10px] text-white/80 font-normal truncate group-hover:text-white transition">500th Win celebration ↗</p>
                      </div>
                    </a>
                  </div>

                  {/* Story & Stats */}
                  <div className="space-y-6">
                    <div>
                      <h5 className="text-sm font-medium text-white mb-2">Lance O&apos;Sullivan ONZM &amp; Andrew Scott</h5>
                      <p className="text-xs uppercase tracking-wider text-white/30 font-medium mb-3">Wexford Stables · Matamata, NZ</p>
                      
                      <div className="space-y-3 text-sm leading-[1.8] text-white/50">
                        <p>
                          Congratulations to Wexford Stables&apos; Lance O&apos;Sullivan and Andrew Scott, who secured their <span className="text-white font-normal">500th win in partnership</span> recently at Te Rapa Racing 🙌.
                        </p>
                        <p>
                          The training pair have worked in partnership on two separate occasions, during the 2006/07 &amp; 2007/08 seasons, with the pair returning to partnership during the 2013/14 season.
                        </p>
                        <p>
                          They have won <span className="text-white font-normal">54 Group and Listed races</span> together and are in top form, sitting <span className="text-white font-normal">2nd on the trainers&apos; premiership table</span> with an incredible strike rate of <span className="text-white font-normal">4.76</span> and 46 wins.
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 border-t border-white/[0.04] pt-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-white/30 mb-0.5">Premiership</p>
                        <p className="text-base text-[#d4a964] font-medium">2nd</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-white/30 mb-0.5">Strike Rate</p>
                        <p className="text-base text-white font-medium">4.76</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-white/30 mb-0.5">Group Wins</p>
                        <p className="text-base text-white font-medium">54</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 font-light">
                  <p className="text-sm leading-[1.8] text-white/50">
                    <span className="text-white font-normal">{hlt.trainer.name}</span> manages Wexford Stables out of Matamata, NZ. 
                    Renowned for training top-tier middle-distance stayers, Wexford Stables utilizes world-class preparation environments, equine swimming resources, and patience-first horse education structures.
                  </p>
                  {hlt.trainer.nztr_license_number && (
                    <p className="text-xs text-white/30">
                      NZTR License Number: <span className="font-mono text-white/50">{hlt.trainer.nztr_license_number}</span>
                    </p>
                  )}
                </div>
              )
            ) : (
              <p className="text-sm text-white/40 font-light">No trainer profile assigned yet. Preparation notes will be posted upon stable entry.</p>
            )}
          </div>
        )}

        {/* Race Record Panel */}
        {activeTab === "race-record" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-md font-medium text-white">Race Timeline & Starts</h4>
            {races.length === 0 ? (
              <p className="text-sm text-white/40 font-light">No official races recorded yet. She is in early training setups.</p>
            ) : (
              <div className="space-y-4">
                {races.map((race, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center border-b border-white/[0.04] pb-3 text-sm font-light"
                  >
                    <div className="space-y-1">
                      <p className="text-white/80">{race.venue} · <span className="text-white/45 text-xs">{race.date}</span></p>
                      <p className="text-xs text-white/45">{race.race} {race.trackCondition ? `(${race.trackCondition})` : ""}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      race.result.toLowerCase() === "1st" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                        : "bg-white/[0.04] text-white/60"
                    }`}>
                      {race.result} {race.margin ? `(${race.margin})` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents Panel */}
        {activeTab === "documents" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-md font-medium text-white">Legal Disclosures & Downloads</h4>
            <p className="text-xs text-white/40 leading-relaxed font-light">
              Ownership is bound by regulated legal documentation. We strongly recommend downloading and reviewing the HLT parameters prior to committing stakes.
            </p>

            <div className="space-y-3 pt-2">
              {/* Term Sheet */}
              <div className="flex justify-between items-center border border-white/[0.06] bg-white/[0.01] rounded-xl p-4">
                <div>
                  <p className="text-xs font-medium text-white/95">HLT Term Sheet</p>
                  <p className="text-[10px] text-white/35 mt-0.5">PDF · Summary of Lease Parameters</p>
                </div>
                {hasDoc("term_sheet") ? (
                  <a
                    href={getDocUrl("term_sheet")}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-medium uppercase tracking-widest text-[#d4a964] hover:underline"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-[10px] text-white/30 italic">Upload Pending</span>
                )}
              </div>

              {/* Product Disclosure Statement */}
              <div className="flex justify-between items-center border border-white/[0.06] bg-white/[0.01] rounded-xl p-4">
                <div>
                  <p className="text-xs font-medium text-white/95">Product Disclosure Statement (PDS)</p>
                  <p className="text-[10px] text-white/35 mt-0.5">PDF · Financial Disclosures</p>
                </div>
                {hasDoc("pds") ? (
                  <a
                    href={getDocUrl("pds")}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-medium uppercase tracking-widest text-[#d4a964] hover:underline"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-[10px] text-white/30 italic">Upload Pending</span>
                )}
              </div>

              {/* Syndicate Agreement */}
              <div className="flex justify-between items-center border border-white/[0.06] bg-white/[0.01] rounded-xl p-4">
                <div>
                  <p className="text-xs font-medium text-white/95">Syndicate Agreement</p>
                  <p className="text-[10px] text-white/35 mt-0.5">PDF · Operational Syndicate Structure</p>
                </div>
                {hasDoc("sa") ? (
                  <a
                    href={getDocUrl("sa")}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-medium uppercase tracking-widest text-[#d4a964] hover:underline"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-[10px] text-white/30 italic">Upload Pending</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
