"use client";

import { useState } from "react";

interface Race {
  date: string;
  venue: string;
  race: string;
  trackCondition?: string;
  result: string;
  margin?: string;
}

interface DetailTabsProps {
  horseName: string;
  sireName: string;
  damName: string;
  sex: string;
  colour: string;
  age?: number;
  wins: string;
  placed: string;
  loveracingId?: string;
  breedingUrl?: string | null;
  performanceProfileUrl?: string | null;
  trainer: {
    name: string;
    stable_name: string;
    contact_name?: string;
    location: string;
    nztr_license_number?: string;
  };
  horseSlug: string;
}

// Hardcoded historical races for Prudentia since she has them in the prototype.
const PRUDENTIA_RACES: Race[] = [
  { date: "15 Mar 2025", venue: "Tauranga", race: "1400m", trackCondition: "Heavy", result: "1st" },
  { date: "05 Feb 2025", venue: "Te Rapa", race: "1400m", trackCondition: "Good", result: "2nd" },
  { date: "18 Jan 2025", venue: "Matamata", race: "1300m", trackCondition: "Soft", result: "3rd" },
  { date: "12 Dec 2024", venue: "Te Aroha", race: "1250m", trackCondition: "Good", result: "5th" },
  { date: "08 Nov 2024", venue: "Rotorua", race: "1400m", trackCondition: "Slow", result: "7th" },
];

export function DetailTabs({
  horseName,
  sireName,
  damName,
  sex,
  colour,
  age,
  wins,
  placed,
  loveracingId,
  breedingUrl,
  performanceProfileUrl,
  trainer,
  horseSlug,
}: DetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "trainer" | "race-record" | "documents">("details");

  const races = horseSlug === "prudentia" ? PRUDENTIA_RACES : [];

  return (
    <div className="space-y-8">
      {/* Tab Nav */}
      <div className="flex border-b border-white/[0.06] overflow-x-auto scrollbar-none">
        {(["details", "trainer", "race-record", "documents"] as const).map((tab) => (
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
      <div className="pt-2 min-h-[220px]">
        {/* Details Panel */}
        {activeTab === "details" && (
          <div className="space-y-6 animate-fade-in font-light">
            <h4 className="text-md font-medium text-white">Expanded Pedigree</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-sm leading-[1.8] text-white/60">
                  {horseName} represents a strategic leasehold campaign within the Evolution syndicate network. 
                  Sired by <span className="text-white font-normal">{sireName || "—"}</span> out of <span className="text-white font-normal">{damName || "—"}</span>, 
                  her breeding carries proven speed and durability profiles suited for domestic New Zealand benchmark competition.
                </p>
                <p className="text-sm leading-[1.8] text-white/60">
                  Trained under professional preparations, she has shown great adaptability to track variations and is being built toward late-season stakes qualifications.
                </p>
              </div>
              <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6 space-y-4">
                <h5 className="text-xs uppercase tracking-wider text-white/45">Pedigree Specifications</h5>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-white/[0.04] pb-2">
                    <span className="text-white/40">Sire</span>
                    <span className="text-white font-medium">{sireName || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.04] pb-2">
                    <span className="text-white/40">Dam</span>
                    <span className="text-white font-medium">{damName || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.04] pb-2">
                    <span className="text-white/40">Colour / Sex</span>
                    <span className="text-white capitalize">{colour} / {sex}</span>
                  </div>
                  {age && (
                    <div className="flex justify-between border-b border-white/[0.04] pb-2">
                      <span className="text-white/40">Age</span>
                      <span className="text-white">{age} Years</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trainer Panel */}
        {activeTab === "trainer" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-md font-medium text-white">Trainer Profile</h4>
            <div className="space-y-4 font-light text-sm leading-[1.8] text-white/60">
              <p>
                <span className="text-white font-normal">{trainer.stable_name || trainer.name || "—"}</span> out of {trainer.location || "—"}. 
                Renowned for training top-tier middle-distance stayers, Wexford Stables utilizes world-class preparation environments, equine swimming resources, and patience-first horse education structures.
              </p>
              {trainer.contact_name && (
                <p className="text-xs text-white/40">
                  Contact: <span className="text-white/60">{trainer.contact_name}</span>
                </p>
              )}
              {trainer.nztr_license_number && (
                <p className="text-xs text-white/30">
                  NZTR License Number: <span className="font-mono text-white/50">{trainer.nztr_license_number}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Race Record Panel */}
        {activeTab === "race-record" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
              <div>
                <h4 className="text-md font-medium text-white">Race Timeline & Starts</h4>
                <p className="text-xs text-white/40 mt-1">Summary: {wins || "0"} Win{Number(wins) !== 1 ? "s" : ""} · {placed || "0"} Place{Number(placed) !== 1 ? "s" : ""}</p>
              </div>
              {(breedingUrl || performanceProfileUrl) && (
                <div className="flex gap-4">
                  {breedingUrl && (
                    <a
                      href={breedingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs uppercase tracking-widest font-mono text-[#d4a964] hover:underline"
                    >
                      Breeding Record ↗
                    </a>
                  )}
                  {performanceProfileUrl && (
                    <a
                      href={performanceProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs uppercase tracking-widest font-mono text-[#d4a964] hover:underline"
                    >
                      Full NZTR Record ↗
                    </a>
                  )}
                </div>
              )}
            </div>

            {races.length === 0 ? (
              <p className="text-sm text-white/40 font-light py-4">No recent starts recorded. Horse is currently in pre-training preparation.</p>
            ) : (
              <div className="space-y-4 pt-2">
                {races.map((race, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center border-b border-white/[0.04] pb-3 text-sm font-light"
                  >
                    <div className="space-y-1">
                      <p className="text-white/80">{race.venue} · <span className="text-white/45 text-xs">{race.date}</span></p>
                      <p className="text-xs text-white/45">{race.race} {race.trackCondition ? `(${race.trackCondition})` : ""}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      race.result.toLowerCase() === "1st" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-white/[0.04] text-white/60"
                    }`}>
                      {race.result}
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
            <h4 className="text-md font-medium text-white">Legal Disclosures & Documents</h4>
            <p className="text-xs text-white/40 leading-relaxed font-light">
              Ownership is bound by regulated legal documentation. We strongly recommend downloading and reviewing the HLT parameters prior to committing stakes.
            </p>

            <div className="space-y-3 pt-2">
              {/* Product Disclosure Statement */}
              <div className="flex justify-between items-center border border-white/[0.06] bg-white/[0.01] rounded-xl p-4">
                <div>
                  <p className="text-xs font-medium text-white/95">Product Disclosure Statement (PDS)</p>
                  <p className="text-[10px] text-white/35 mt-0.5">PDF · Financial Disclosures</p>
                </div>
                <a
                  href={`/documents/${horseSlug}/pds.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-medium uppercase tracking-widest text-[#d4a964] hover:underline"
                >
                  Download
                </a>
              </div>

              {/* Syndicate Agreement */}
              <div className="flex justify-between items-center border border-white/[0.06] bg-white/[0.01] rounded-xl p-4">
                <div>
                  <p className="text-xs font-medium text-white/95">Syndicate Agreement</p>
                  <p className="text-[10px] text-white/35 mt-0.5">PDF · Operational Syndicate Structure</p>
                </div>
                <a
                  href={`/documents/${horseSlug}/syndicate-agreement.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-medium uppercase tracking-widest text-[#d4a964] hover:underline"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
