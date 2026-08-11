"use client";

import { useState } from "react";
import { buildPedigreeTree } from "@/lib/pedigree-tree";
import type { PedigreeCrossLine } from "@/lib/pedigree-tree";

interface PedigreeData {
  dam_line?: { mare?: string; sire?: string; dam?: string }[];
  sire_line?: { mare?: string; sire?: string; dam?: string }[];
  cross_line?: PedigreeCrossLine;
}

interface PedigreeTableProps {
  horseName: string;
  sireName: string;
  damName: string;
  damSireName?: string;
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

/** Tier label under the subject node. */
function TierLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none mt-2 whitespace-nowrap text-[10px] font-light uppercase tracking-[0.1em] text-muted-foreground">
      {children}
    </span>
  );
}

/**
 * A single pedigree name cell.
 * Uses brand tokens, no absolute stems/forks — clean lines are drawn by the chart grid.
 */
function PedigreeNode({
  fullName,
  tier,
  meta,
  legend,
  sublabel,
}: {
  fullName: string;
  tier: NodeTier;
  meta?: string;
  legend?: string;
  sublabel?: string;
}) {
  const parsed = parseHorseName(fullName);
  const isEmpty = parsed.name === "—";

  const tierStyles: Record<NodeTier, string> = {
    subject: "min-h-[60px] border-gold/40 bg-raised shadow-[0_0_24px_rgba(212,169,100,0.08)] px-4",
    parent: "min-h-[52px] border-white/[0.12] bg-raised hover:border-white/30",
    grand: "min-h-[48px] border-border bg-surface-base hover:border-white/25",
    great: "min-h-[44px] border-border bg-surface-base/80 opacity-80 hover:border-white/25 hover:opacity-95",
  };

  const textStyles: Record<NodeTier, string> = {
    subject: "text-[13px] font-medium text-heading",
    parent: "text-[11px] font-medium text-heading",
    grand: "text-[10px] font-normal text-foreground",
    great: "text-[9.5px] font-light text-foreground",
  };

  return (
    <div className="flex h-full min-w-0 flex-col items-center justify-center">
      <div
        className={[
          "relative box-border flex w-full flex-col items-center justify-center rounded-xl border px-2.5 py-2 text-center transition-[border-color,opacity] duration-200",
          isEmpty && tier !== "subject" ? "opacity-40" : "",
          tierStyles[tier],
        ].join(" ")}
      >
        <span
          className={["block w-full whitespace-normal break-words leading-snug line-clamp-2", textStyles[tier]].join(" ")}
          title={parsed.name}
        >
          {parsed.name}
        </span>
        {meta && (
          <span
            className={`mt-0.5 block font-light tracking-wide text-muted-foreground ${
              tier === "great" ? "text-[8px]" : "text-[9px]"
            }`}
          >
            {meta}
          </span>
        )}
      </div>
      {legend && !isEmpty && (
        <span className="pointer-events-none mt-1.5 whitespace-nowrap text-[9px] font-light uppercase tracking-[0.08em] text-muted-foreground">
          {legend}
        </span>
      )}
      {sublabel && (
        <span className="pointer-events-none mt-1.5 whitespace-nowrap text-[10px] font-light capitalize text-muted-foreground">
          {sublabel}
        </span>
      )}
    </div>
  );
}

/**
 * Clean 4-generation pedigree chart.
 * Uses a single responsive grid: subject | connector | parents | connector | grandparents | connector | great-grandparents.
 * Connector lines are drawn as pseudo-element borders instead of absolute divs.
 */
function PedigreeChart({
  tree,
  horseLabel,
  sex,
  colour,
  age,
  formattedFoalingDate,
  breedingUrl,
}: {
  tree: ReturnType<typeof buildPedigreeTree>;
  horseLabel: string;
  sex: string;
  colour: string;
  age?: number;
  formattedFoalingDate: string | null;
  breedingUrl: string | null | undefined;
}) {
  const nodes: { name: string; tier: NodeTier; legend?: string }[] = [
    { name: tree.sireSireSire, tier: "great" },
    { name: tree.sireSireDam, tier: "great" },
    { name: tree.sireDamSire, tier: "great" },
    { name: tree.sireDamDam, tier: "great" },
    { name: tree.damSireSire, tier: "great" },
    { name: tree.damSireDam, tier: "great" },
    { name: tree.damDamSire, tier: "great" },
    { name: tree.damDamDam, tier: "great" },
  ];

  const row = (idx: number) => `\[\&_>_*\]:nth-child(${idx + 1})`;

  return (
    <div className="border border-border bg-surface-base rounded-2xl p-5 md:p-8 overflow-x-auto">
      <div className="min-w-[720px]">
        <div
          className="grid"
          style={{
            gridTemplateColumns: "160px 44px 150px 44px 150px 44px 150px",
            gridTemplateRows: "repeat(8, minmax(52px, 1fr))",
          }}
        >
          {/* Subject — spans all 8 rows */}
          <div className="col-start-1 row-start-1 row-span-8 flex items-center pr-3">
            <PedigreeNode fullName={tree.horse} tier="subject" sublabel={horseLabel} />
          </div>

          {/* Connector: subject → parents */}
          <div
            className="col-start-2 row-start-1 row-span-8 relative"
            aria-hidden
          >
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
            <div className="absolute top-[12.5%] left-0 right-0 h-px bg-gold/30" />
            <div className="absolute top-[87.5%] left-0 right-0 h-px bg-gold/30" />
          </div>

          {/* Parents */}
          <div className="col-start-3 row-start-1 row-span-4 flex items-center px-3">
            <PedigreeNode fullName={tree.sire} tier="parent" legend="Sire" />
          </div>
          <div className="col-start-3 row-start-5 row-span-4 flex items-center px-3">
            <PedigreeNode fullName={tree.dam} tier="parent" legend="Dam" />
          </div>

          {/* Connector: parents → grandparents */}
          <div className="col-start-4 row-start-1 row-span-4 relative" aria-hidden>
            <div className="absolute inset-y-0 left-0 w-px bg-white/15" />
            <div className="absolute top-[25%] left-0 right-0 h-px bg-white/15" />
            <div className="absolute top-[75%] left-0 right-0 h-px bg-white/15" />
          </div>
          <div className="col-start-4 row-start-5 row-span-4 relative" aria-hidden>
            <div className="absolute inset-y-0 left-0 w-px bg-white/15" />
            <div className="absolute top-[25%] left-0 right-0 h-px bg-white/15" />
            <div className="absolute top-[75%] left-0 right-0 h-px bg-white/15" />
          </div>

          {/* Grandparents */}
          <div className="col-start-5 row-start-1 row-span-2 flex items-center px-3">
            <PedigreeNode fullName={tree.sireSire} tier="grand" />
          </div>
          <div className="col-start-5 row-start-3 row-span-2 flex items-center px-3">
            <PedigreeNode fullName={tree.sireDam} tier="grand" />
          </div>
          <div className="col-start-5 row-start-5 row-span-2 flex items-center px-3">
            <PedigreeNode fullName={tree.damSire} tier="grand" />
          </div>
          <div className="col-start-5 row-start-7 row-span-2 flex items-center px-3">
            <PedigreeNode fullName={tree.damDam} tier="grand" />
          </div>

          {/* Connector: grandparents → great-grandparents */}
          <div className="col-start-6 row-start-1 row-span-2 relative" aria-hidden>
            <div className="absolute inset-y-0 left-0 w-px bg-white/15" />
            <div className="absolute top-[25%] left-0 right-0 h-px bg-white/15" />
            <div className="absolute top-[75%] left-0 right-0 h-px bg-white/15" />
          </div>
          <div className="col-start-6 row-start-3 row-span-2 relative" aria-hidden>
            <div className="absolute inset-y-0 left-0 w-px bg-white/15" />
            <div className="absolute top-[25%] left-0 right-0 h-px bg-white/15" />
            <div className="absolute top-[75%] left-0 right-0 h-px bg-white/15" />
          </div>
          <div className="col-start-6 row-start-5 row-span-2 relative" aria-hidden>
            <div className="absolute inset-y-0 left-0 w-px bg-white/15" />
            <div className="absolute top-[25%] left-0 right-0 h-px bg-white/15" />
            <div className="absolute top-[75%] left-0 right-0 h-px bg-white/15" />
          </div>
          <div className="col-start-6 row-start-7 row-span-2 relative" aria-hidden>
            <div className="absolute inset-y-0 left-0 w-px bg-white/15" />
            <div className="absolute top-[25%] left-0 right-0 h-px bg-white/15" />
            <div className="absolute top-[75%] left-0 right-0 h-px bg-white/15" />
          </div>

          {/* Great-grandparents */}
          <div className="col-start-7 row-start-1 flex items-center pl-3">
            <PedigreeNode fullName={tree.sireSireSire} tier="great" />
          </div>
          <div className="col-start-7 row-start-2 flex items-center pl-3">
            <PedigreeNode fullName={tree.sireSireDam} tier="great" />
          </div>
          <div className="col-start-7 row-start-3 flex items-center pl-3">
            <PedigreeNode fullName={tree.sireDamSire} tier="great" />
          </div>
          <div className="col-start-7 row-start-4 flex items-center pl-3">
            <PedigreeNode fullName={tree.sireDamDam} tier="great" />
          </div>
          <div className="col-start-7 row-start-5 flex items-center pl-3">
            <PedigreeNode fullName={tree.damSireSire} tier="great" />
          </div>
          <div className="col-start-7 row-start-6 flex items-center pl-3">
            <PedigreeNode fullName={tree.damSireDam} tier="great" />
          </div>
          <div className="col-start-7 row-start-7 flex items-center pl-3">
            <PedigreeNode fullName={tree.damDamSire} tier="great" />
          </div>
          <div className="col-start-7 row-start-8 flex items-center pl-3">
            <PedigreeNode fullName={tree.damDamDam} tier="great" />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-light">
        <span className="text-muted-foreground">
          Sex: <span className="text-foreground capitalize">{sex || "—"}</span>
        </span>
        <span className="text-muted-foreground">
          Colour: <span className="text-foreground capitalize">{colour || "—"}</span>
        </span>
        {age && (
          <span className="text-muted-foreground">
            Age: <span className="text-foreground">{age} Years</span>
          </span>
        )}
        {formattedFoalingDate && (
          <span className="text-muted-foreground">
            Foaled: <span className="text-foreground">{formattedFoalingDate}</span>
          </span>
        )}
        {breedingUrl && (
          <a
            href={breedingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline ml-auto"
          >
            Full Breeding Record ↗
          </a>
        )}
      </div>
    </div>
  );
}

export function PedigreeTable({
  horseName,
  sireName,
  damName,
  damSireName,
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
    sireLine as unknown as Parameters<typeof buildPedigreeTree>[3],
    damLine as unknown as Parameters<typeof buildPedigreeTree>[4],
    pedigreeData?.cross_line,
  );

  const horseLabel = `${colour} ${sex}${age ? `, ${age}yo` : ""}`;
  const damLineUrl = breedingUrl ? `${breedingUrl}#bm-dam` : undefined;
  const sireLineUrl = breedingUrl ? `${breedingUrl}#bm-sire` : undefined;

  return (
    <div className="space-y-6">
      {damSireName && (
        <div className="inline-flex items-center gap-2 text-xs text-zinc-300 bg-surface-base/60 border border-zinc-800 rounded-lg px-3.5 py-2">
          <span className="text-amber-400 font-semibold uppercase text-[10px] tracking-wider">Broodmare Sire</span>
          <span className="text-heading font-medium">{damSireName}</span>
        </div>
      )}
      {hasFullPedigree && (
        <div className="flex gap-2">
          {(["tree", "dam-line", "sire-line"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`text-[10px] uppercase tracking-widest font-light px-3 py-1.5 rounded-full border transition-all ${
                view === v
                  ? "border-gold/30 text-accent bg-gold/5"
                  : "border-border text-muted-foreground hover:text-frost"
              }`}
            >
              {v === "tree" ? "Pedigree" : v.replace("-", " ")}
            </button>
          ))}
        </div>
      )}

      {view === "tree" && (
        <PedigreeChart
          tree={tree}
          horseLabel={horseLabel}
          sex={sex}
          colour={colour}
          age={age}
          formattedFoalingDate={formattedFoalingDate}
          breedingUrl={breedingUrl}
        />
      )}

      {view === "dam-line" && hasFullPedigree && damLine.length > 0 && (
        <div className="border border-border bg-surface-base rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xs uppercase tracking-wider text-muted-foreground">Dam Line</h5>
            {damLineUrl && (
              <a
                href={damLineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-accent hover:underline uppercase tracking-widest"
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
                  <span className="text-muted-foreground w-6 text-right">{i + 1}.</span>
                  <span className="text-foreground flex-1 truncate">{parsedMare.name}</span>
                  <span className="text-muted-foreground text-[10px]">by</span>
                  <span className="text-muted-foreground flex-1 truncate">{parsedSire.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "sire-line" && hasFullPedigree && sireLine.length > 0 && (
        <div className="border border-border bg-surface-base rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xs uppercase tracking-wider text-muted-foreground">Sire Line</h5>
            {sireLineUrl && (
              <a
                href={sireLineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-accent hover:underline uppercase tracking-widest"
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
                  <span className="text-muted-foreground w-6 text-right">{i + 1}.</span>
                  <span className="text-foreground flex-1 truncate">{parsedSire.name}</span>
                  <span className="text-muted-foreground text-[10px]">from</span>
                  <span className="text-muted-foreground flex-1 truncate">{parsedDam.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
