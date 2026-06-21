"use client";
import { useState } from "react";

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

export function DetailTabsSandbox({ hlt, races }: DetailTabsSandboxProps) {
  const [activeTab, setActiveTab] = useState<"details" | "trainer" | "race-record" | "documents">("details");

  const getDocUrl = (docType: "pds" | "sa" | "term_sheet") => {
    const gcsUrl = hlt.documents?.[docType]?.gcs_url;
    if (!gcsUrl) return "#";
    if (gcsUrl.startsWith("gs://")) {
      return `https://storage.googleapis.com/${gcsUrl.substring(5)}`;
    }
    return gcsUrl;
  };

  const hasDoc = (docType: "pds" | "sa" | "term_sheet") => {
    return !!hlt.documents?.[docType]?.gcs_url;
  };

  return (
    <div className="space-y-8">
      {/* Tab Selectors */}
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

        {/* Trainer Panel */}
        {activeTab === "trainer" && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-md font-medium text-white">Trainer Profile</h4>
            {hlt.trainer ? (
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
