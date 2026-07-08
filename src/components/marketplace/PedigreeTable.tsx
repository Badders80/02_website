"use client";

import { useState } from "react";

interface PedigreeEntry {
  mare?: string;
  sire?: string;
  dam?: string;
}

interface PedigreeData {
  dam_line?: PedigreeEntry[];
  sire_line?: PedigreeEntry[];
  basic?: { sire: string; dam: string };
}

interface PedigreeTableProps {
  horseName: string;
  sireName: string;
  damName: string;
  sex: string;
  colour: string;
  age?: number;
  breedingUrl?: string | null;
  pedigreeData?: PedigreeData | null;
}

export function PedigreeTable({
  horseName,
  sireName,
  damName,
  sex,
  colour,
  age,
  breedingUrl,
  pedigreeData,
}: PedigreeTableProps) {
  const [view, setView] = useState<"table" | "dam-line" | "sire-line">("table");

  const hasFullPedigree = pedigreeData && (pedigreeData.dam_line?.length || pedigreeData.sire_line?.length);
  const damLine = pedigreeData?.dam_line || [];
  const sireLine = pedigreeData?.sire_line || [];

  // Build 3-generation pedigree table structure
  // Standard format: horse → sire x dam, sire's sire x sire's dam, dam's sire x dam's dam
  const gen1Sire = sireName;
  const gen1Dam = damName;
  const gen2SireSire = sireLine[0]?.sire || "—";
  const gen2SireDam = sireLine[0]?.dam || "—";
  const gen2DamSire = damLine[0]?.sire || "—";
  const gen2DamDam = damLine[0]?.mare || "—";
  const gen3S1S = sireLine[1]?.sire || "—";
  const gen3S1D = sireLine[1]?.dam || "—";
  const gen3S2S = sireLine[1]?.sire || "—";
  const gen3S2D = sireLine[1]?.dam || "—";
  const gen3D1S = damLine[1]?.sire || "—";
  const gen3D1D = damLine[1]?.mare || "—";
  const gen3D2S = damLine[1]?.sire || "—";
  const gen3D2D = damLine[1]?.mare || "—";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View toggle */}
      {hasFullPedigree && (
        <div className="flex gap-2">
          {(["table", "dam-line", "sire-line"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`text-[10px] uppercase tracking-widest font-light px-3 py-1.5 rounded-full border transition-all ${
                view === v
                  ? "border-[#d4a964]/30 text-[#d4a964] bg-[#d4a964]/5"
                  : "border-white/[0.06] text-white/40 hover:text-white/60"
              }`}
            >
              {v.replace("-", " ")}
            </button>
          ))}
        </div>
      )}

      {/* Basic specs card — always shown */}
      <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6 space-y-4 max-w-md">
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
        {breedingUrl && (
          <a
            href={breedingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#d4a964] hover:underline"
          >
            Full Breeding Record ↗
          </a>
        )}
      </div>

      {/* 3-Generation Table View */}
      {view === "table" && hasFullPedigree && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6 overflow-x-auto">
          <h5 className="text-xs uppercase tracking-wider text-white/45 mb-4">3-Generation Pedigree</h5>
          <table className="w-full text-[11px] font-light">
            <tbody>
              {/* Generation 1 */}
              <tr className="border-b border-white/[0.04]">
                <td className="py-3 pr-4 text-white/40 w-20">1st Dam</td>
                <td className="py-3 text-white font-medium">{gen1Dam}</td>
                <td className="py-3 text-white/40 text-right w-16">by</td>
                <td className="py-3 pl-4 text-white/70">{gen2DamSire}</td>
              </tr>
              {/* Generation 2 — Dam side */}
              <tr className="border-b border-white/[0.04]">
                <td className="py-3 pr-4 text-white/30">2nd Dam</td>
                <td className="py-3 text-white/70">{gen2DamDam}</td>
                <td className="py-3 text-white/30 text-right">by</td>
                <td className="py-3 pl-4 text-white/50">{gen3D1S}</td>
              </tr>
              {/* Generation 2 — Sire side */}
              <tr className="border-b border-white/[0.04]">
                <td className="py-3 pr-4 text-white/30">Sire's Dam</td>
                <td className="py-3 text-white/70">{gen2SireDam}</td>
                <td className="py-3 text-white/30 text-right">by</td>
                <td className="py-3 pl-4 text-white/50">{gen3S1S}</td>
              </tr>
              {/* Sire */}
              <tr className="border-b border-white/[0.04]">
                <td className="py-3 pr-4 text-white/40">Sire</td>
                <td className="py-3 text-white font-medium">{gen1Sire}</td>
                <td className="py-3 text-white/40 text-right">by</td>
                <td className="py-3 pl-4 text-white/70">{gen2SireSire}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Dam Line View */}
      {view === "dam-line" && hasFullPedigree && damLine.length > 0 && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
          <h5 className="text-xs uppercase tracking-wider text-white/45 mb-4">Dam Line</h5>
          <div className="space-y-1">
            {damLine.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 text-xs font-light py-2 ${
                  i < damLine.length - 1 ? "border-b border-white/[0.03]" : ""
                }`}
              >
                <span className="text-white/30 w-6 text-right">{i + 1}.</span>
                <span className="text-white/70 flex-1">{entry.mare}</span>
                <span className="text-white/30 text-[10px]">by</span>
                <span className="text-white/50 flex-1">{entry.sire}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sire Line View */}
      {view === "sire-line" && hasFullPedigree && sireLine.length > 0 && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
          <h5 className="text-xs uppercase tracking-wider text-white/45 mb-4">Sire Line</h5>
          <div className="space-y-1">
            {sireLine.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 text-xs font-light py-2 ${
                  i < sireLine.length - 1 ? "border-b border-white/[0.03]" : ""
                }`}
              >
                <span className="text-white/30 w-6 text-right">{i + 1}.</span>
                <span className="text-white/70 flex-1">{entry.sire}</span>
                <span className="text-white/30 text-[10px]">from</span>
                <span className="text-white/50 flex-1">{entry.dam}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No full pedigree — show basic info only */}
      {view === "table" && !hasFullPedigree && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
          <p className="text-xs text-white/30 font-light leading-relaxed">
            Full multi-generational pedigree will be available when this horse is registered with the NZTR Stud Book.
          </p>
        </div>
      )}
    </div>
  );
}