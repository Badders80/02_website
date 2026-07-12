"use client";

import { useState } from "react";
import { buildPedigreeTree } from "@/lib/pedigree-tree";
import type { PedigreeCrossLine } from "@/lib/pedigree-tree";

interface PedigreeEntry {
  mare?: string;
  sire?: string;
  dam?: string;
}

interface PedigreeData {
  dam_line?: PedigreeEntry[];
  sire_line?: PedigreeEntry[];
  cross_line?: PedigreeCrossLine;
}

interface PedigreeTableProps {
  horseName: string;
  sireName: string;
  damName: string;
  sex: string;
  colour: string;
  age?: number;
  foalingDate?: string;
  breedingUrl?: string | null;
  pedigreeData?: PedigreeData | null;
}

type NodeTier = "subject" | "parent" | "grand" | "great";

function formatFoalingDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

function parseHorseName(fullName: string): { name: string; country: string; year: string } {
  if (!fullName || fullName === "—") return { name: "—", country: "", year: "" };

  let cleanName = fullName.replace(/\s*\(by\s+[^)]+\)/i, "");

  const match = cleanName.match(/^(.+?)\s*\(([A-Z]{2,4})\)(?:\s+(\d{4})(?:\s+[a-zA-Z]+)?)?$/i);
  if (match) {
    return { name: match[1].trim(), country: match[2], year: match[3] || "" };
  }

  const match2 = cleanName.match(/^(.+?)\s+(\d{4})(?:\s+[a-zA-Z]+)?$/i);
  if (match2) {
    return { name: match2[1].trim(), country: "", year: match2[2] };
  }

  return { name: cleanName.trim(), country: "", year: "" };
}

const TIER_WIDTH: Record<NodeTier, string> = {
  subject: "w-[152px]",
  parent: "w-[142px]",
  grand: "w-[132px]",
  great: "w-[122px]",
};

/**
 * Fixed-width opaque pill. Name wraps (2 lines) — never truncates mid-word as a single ellipsis.
 * Stems live outside this surface (in NodeCell flex gutters).
 */
function PedigreeNode({
  fullName,
  tier,
  legend,
  sublabel,
}: {
  fullName: string;
  tier: NodeTier;
  legend?: string;
  sublabel?: string;
}) {
  const parsed = parseHorseName(fullName);
  const isEmpty = parsed.name === "—";
  const meta =
    parsed.country && parsed.year
      ? `${parsed.country} ${parsed.year}`
      : parsed.country || parsed.year;

  return (
    <div className={`relative z-10 flex shrink-0 flex-col items-center ${TIER_WIDTH[tier]}`}>
      <div
        className={`box-border flex w-full flex-col items-center justify-center rounded-[20px] border px-3 py-2 text-center transition-[border-color] duration-200 ${
          tier === "subject"
            ? "min-h-[48px] border-[#c5a059]/40 bg-[#14110c] shadow-[0_0_18px_rgba(197,160,89,0.08)]"
            : isEmpty
              ? "min-h-[40px] border-white/[0.04] bg-[#0c0c0c] opacity-40"
              : tier === "parent"
                ? "min-h-[46px] border-white/12 bg-[#111] hover:border-white/35"
                : tier === "grand"
                  ? "min-h-[44px] border-white/10 bg-[#111] hover:border-white/30"
                  : "min-h-[40px] border-white/[0.08] bg-[#0e0e0e] opacity-80 hover:border-white/25 hover:opacity-95"
        }`}
      >
        <span
          className={`block w-full whitespace-normal break-words leading-snug line-clamp-2 ${
            tier === "subject"
              ? "text-[13px] font-medium text-white"
              : tier === "parent"
                ? "text-[11px] font-medium text-white/90"
                : tier === "grand"
                  ? "text-[10px] font-normal text-white/80"
                  : "text-[9.5px] font-light text-white/70"
          }`}
          title={parsed.name}
        >
          {parsed.name}
        </span>
        {meta && (
          <span
            className={`mt-0.5 block font-light tracking-wide text-white/45 ${
              tier === "great" ? "text-[8px]" : "text-[9px]"
            }`}
          >
            {meta}
          </span>
        )}
      </div>
      {legend && !isEmpty && (
        <span className="mt-1.5 text-[9px] uppercase tracking-[0.08em] text-white/30 font-light">
          {legend}
        </span>
      )}
      {sublabel && (
        <span className="mt-1.5 text-[10px] font-light capitalize text-white/40 whitespace-nowrap">
          {sublabel}
        </span>
      )}
    </div>
  );
}

/**
 * Grid cell: optional edge stems (flex gutters) + fixed pill.
 * Stems never cross the pill face — they only fill space between cell edge and pill.
 */
function NodeCell({
  fullName,
  tier,
  legend,
  sublabel,
  stemIn = false,
  stemOut = false,
  goldStemIn = false,
  goldStemOut = false,
  className = "",
}: {
  fullName: string;
  tier: NodeTier;
  legend?: string;
  sublabel?: string;
  stemIn?: boolean;
  stemOut?: boolean;
  goldStemIn?: boolean;
  goldStemOut?: boolean;
  className?: string;
}) {
  const stemInCls = goldStemIn ? "bg-[#c5a059]/30" : "bg-white/15";
  const stemOutCls = goldStemOut ? "bg-[#c5a059]/30" : "bg-white/15";

  return (
    <div className={`z-10 flex min-w-0 w-full items-center ${className}`}>
      {stemIn ? (
        <div className={`h-px min-w-[6px] flex-1 ${stemInCls}`} aria-hidden />
      ) : (
        <div className="min-w-0 flex-1" />
      )}
      <PedigreeNode fullName={fullName} tier={tier} legend={legend} sublabel={sublabel} />
      {stemOut ? (
        <div className={`h-px min-w-[6px] flex-1 ${stemOutCls}`} aria-hidden />
      ) : (
        <div className="min-w-0 flex-1" />
      )}
    </div>
  );
}

/** Top half of a binary fork (border-share) — spacing column only. */
function ForkTop({
  className = "",
  gold = false,
}: {
  className?: string;
  gold?: boolean;
}) {
  const border = gold ? "border-[#c5a059]/30" : "border-white/15";
  return (
    <div
      className={`box-border h-1/2 w-full self-end border-l border-t ${border} ${className}`}
      aria-hidden
    />
  );
}

/** Bottom half of a binary fork (border-share) — spacing column only. */
function ForkBottom({
  className = "",
  gold = false,
}: {
  className?: string;
  gold?: boolean;
}) {
  const border = gold ? "border-[#c5a059]/30" : "border-white/15";
  return (
    <div
      className={`box-border h-1/2 w-full self-start border-l border-b ${border} ${className}`}
      aria-hidden
    />
  );
}

export function PedigreeTable({
  horseName,
  sireName,
  damName,
  sex,
  colour,
  age,
  foalingDate,
  breedingUrl,
  pedigreeData,
}: PedigreeTableProps) {
  const formattedFoalingDate = formatFoalingDate(foalingDate);
  const [view, setView] = useState<"tree" | "dam-line" | "sire-line">("tree");

  const damLine = (pedigreeData?.dam_line || []).slice(0, 8);
  const sireLine = (pedigreeData?.sire_line || []).slice(0, 8);
  const hasFullPedigree = damLine.length > 0 || sireLine.length > 0;

  const tree = buildPedigreeTree(
    sireName,
    damName,
    horseName,
    sireLine,
    damLine,
    pedigreeData?.cross_line,
  );

  const horseLabel = `${colour} ${sex}${age ? `, ${age}yo` : ""}`;
  const damLineUrl = breedingUrl ? `${breedingUrl}#bm-dam` : undefined;
  const sireLineUrl = breedingUrl ? `${breedingUrl}#bm-sire` : undefined;

  return (
    <div className="space-y-6">
      {hasFullPedigree && (
        <div className="flex gap-2">
          {(["tree", "dam-line", "sire-line"] as const).map((v) => (
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
              {v === "tree" ? "Pedigree" : v.replace("-", " ")}
            </button>
          ))}
        </div>
      )}

      {view === "tree" && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-5 md:p-8 overflow-x-auto">
          {/*
            4-gen editorial grid:
            - horse tracks fixed, pills centered (not stretched)
            - fork tracks only draw lines (border-share)
            - edge stems live in node gutters — never under pill fill
          */}
          <div
            className="grid min-w-fit justify-items-stretch py-10 items-stretch
              grid-cols-[160px_40px_150px_32px_140px_28px_128px]
              grid-rows-[repeat(8,58px)]"
          >
            <NodeCell
              fullName={tree.horse}
              tier="subject"
              sublabel={horseLabel}
              stemOut
              goldStemOut
              className="col-start-1 row-start-1 row-span-8"
            />

            {/* Gen 1 fork — gold accent root branch */}
            <ForkTop gold className="col-start-2 row-start-1 row-span-4" />
            <ForkBottom gold className="col-start-2 row-start-5 row-span-4" />

            <NodeCell
              fullName={tree.sire}
              tier="parent"
              legend="Sire"
              stemIn
              stemOut
              goldStemIn
              className="col-start-3 row-start-1 row-span-4"
            />
            <NodeCell
              fullName={tree.dam}
              tier="parent"
              legend="Dam"
              stemIn
              stemOut
              goldStemIn
              className="col-start-3 row-start-5 row-span-4"
            />

            <ForkTop className="col-start-4 row-start-1 row-span-2" />
            <ForkBottom className="col-start-4 row-start-3 row-span-2" />
            <ForkTop className="col-start-4 row-start-5 row-span-2" />
            <ForkBottom className="col-start-4 row-start-7 row-span-2" />

            <NodeCell fullName={tree.sireSire} tier="grand" stemIn stemOut className="col-start-5 row-start-1 row-span-2" />
            <NodeCell fullName={tree.sireDam} tier="grand" stemIn stemOut className="col-start-5 row-start-3 row-span-2" />
            <NodeCell fullName={tree.damSire} tier="grand" stemIn stemOut className="col-start-5 row-start-5 row-span-2" />
            <NodeCell fullName={tree.damDam} tier="grand" stemIn stemOut className="col-start-5 row-start-7 row-span-2" />

            <ForkTop className="col-start-6 row-start-1" />
            <ForkBottom className="col-start-6 row-start-2" />
            <ForkTop className="col-start-6 row-start-3" />
            <ForkBottom className="col-start-6 row-start-4" />
            <ForkTop className="col-start-6 row-start-5" />
            <ForkBottom className="col-start-6 row-start-6" />
            <ForkTop className="col-start-6 row-start-7" />
            <ForkBottom className="col-start-6 row-start-8" />

            <NodeCell fullName={tree.sireSireSire} tier="great" stemIn className="col-start-7 row-start-1" />
            <NodeCell fullName={tree.sireSireDam} tier="great" stemIn className="col-start-7 row-start-2" />
            <NodeCell fullName={tree.sireDamSire} tier="great" stemIn className="col-start-7 row-start-3" />
            <NodeCell fullName={tree.sireDamDam} tier="great" stemIn className="col-start-7 row-start-4" />
            <NodeCell fullName={tree.damSireSire} tier="great" stemIn className="col-start-7 row-start-5" />
            <NodeCell fullName={tree.damSireDam} tier="great" stemIn className="col-start-7 row-start-6" />
            <NodeCell fullName={tree.damDamSire} tier="great" stemIn className="col-start-7 row-start-7" />
            <NodeCell fullName={tree.damDamDam} tier="great" stemIn className="col-start-7 row-start-8" />
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.04] flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-light">
            <span className="text-white/40">
              Sex: <span className="text-white/80 capitalize">{sex || "—"}</span>
            </span>
            <span className="text-white/40">
              Colour: <span className="text-white/80 capitalize">{colour || "—"}</span>
            </span>
            {age && (
              <span className="text-white/40">
                Age: <span className="text-white/80">{age} Years</span>
              </span>
            )}
            {formattedFoalingDate && (
              <span className="text-white/40">
                Foaled: <span className="text-white/80">{formattedFoalingDate}</span>
              </span>
            )}
            {breedingUrl && (
              <a
                href={breedingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d4a964] hover:underline ml-auto"
              >
                Full Breeding Record ↗
              </a>
            )}
          </div>
        </div>
      )}

      {view === "dam-line" && hasFullPedigree && damLine.length > 0 && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xs uppercase tracking-wider text-white/45">Dam Line</h5>
            {damLineUrl && (
              <a
                href={damLineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#d4a964] hover:underline uppercase tracking-widest"
              >
                Full Dam Line ↗
              </a>
            )}
          </div>
          <div className="space-y-0">
            {damLine.map((entry, i) => {
              const parsedMare = parseHorseName(entry.mare || "");
              const parsedSire = parseHorseName(entry.sire || "");
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-xs font-light py-2.5 ${
                    i < damLine.length - 1 ? "border-b border-white/[0.03]" : ""
                  }`}
                >
                  <span className="text-white/30 w-6 text-right">{i + 1}.</span>
                  <span className="text-white/70 flex-1 truncate">{parsedMare.name}</span>
                  <span className="text-white/30 text-[10px]">by</span>
                  <span className="text-white/50 flex-1 truncate">{parsedSire.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "sire-line" && hasFullPedigree && sireLine.length > 0 && (
        <div className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xs uppercase tracking-wider text-white/45">Sire Line</h5>
            {sireLineUrl && (
              <a
                href={sireLineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#d4a964] hover:underline uppercase tracking-widest"
              >
                Full Sire Line ↗
              </a>
            )}
          </div>
          <div className="space-y-0">
            {sireLine.map((entry, i) => {
              const parsedSire = parseHorseName(entry.sire || "");
              const parsedDam = parseHorseName(entry.dam || "");
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-xs font-light py-2.5 ${
                    i < sireLine.length - 1 ? "border-b border-white/[0.03]" : ""
                  }`}
                >
                  <span className="text-white/30 w-6 text-right">{i + 1}.</span>
                  <span className="text-white/70 flex-1 truncate">{parsedSire.name}</span>
                  <span className="text-white/30 text-[10px]">from</span>
                  <span className="text-white/50 flex-1 truncate">{parsedDam.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
