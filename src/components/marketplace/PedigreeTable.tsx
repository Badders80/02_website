"use client";

import { useState } from "react";
import { buildPedigreeTree, getLinebreedingDuplicates } from "@/lib/pedigree-tree";
import type { PedigreeCrossLine, PedigreeNodeData } from "@/lib/pedigree-tree";

interface PedigreeData {
  dam_line?: { name?: string; country?: string; year?: string; partner?: { name?: string; country?: string; year?: string } }[];
  sire_line?: { name?: string; country?: string; year?: string; partner?: { name?: string; country?: string; year?: string } }[];
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

/**
 * A single pedigree name cell.
 * Rectangular modern card layout (no rounded beach balls).
 */
function PedigreeNode({
  data,
  tier,
  isLinebredDuplicate,
  isHighlighted,
  onHover,
}: {
  data: PedigreeNodeData;
  tier: NodeTier;
  isLinebredDuplicate?: boolean;
  isHighlighted?: boolean;
  onHover?: (name: string | null) => void;
}) {
  const isEmpty = !data.name || data.name === "—";
  const normName = data.name ? data.name.toLowerCase().trim() : "";

  // Base tier styles — clean rectangular cards
  const tierStyles: Record<NodeTier, string> = {
    subject: "min-h-[64px] border-emerald-500/40 bg-zinc-900/90 shadow-[0_0_24px_rgba(0,229,153,0.08)] px-3.5",
    parent: "min-h-[56px] border-zinc-800 bg-zinc-900/70 hover:border-zinc-700",
    grand: "min-h-[48px] border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700",
    great: "min-h-[42px] border-zinc-800/60 bg-zinc-900/30 hover:border-zinc-700",
  };

  const nameTextStyles: Record<NodeTier, string> = {
    subject: "text-[13px] font-semibold text-heading tracking-tight",
    parent: "text-[11.5px] font-medium text-foreground",
    grand: "text-[10.5px] font-normal text-zinc-300",
    great: "text-[9.5px] font-normal text-zinc-400",
  };

  return (
    <div className="flex h-full min-w-0 flex-col items-center justify-center w-full">
      <div
        onMouseEnter={() => !isEmpty && onHover?.(normName)}
        onMouseLeave={() => onHover?.(null)}
        className={[
          "relative box-border flex w-full flex-col justify-between rounded-lg border px-2.5 py-1.5 transition-all duration-200",
          isEmpty && tier !== "subject" ? "opacity-30 border-dashed border-zinc-800" : "",
          tierStyles[tier],
          isHighlighted
            ? "border-emerald-500/80 bg-emerald-500/15 ring-1 ring-emerald-500/50 shadow-[0_0_16px_rgba(0,229,153,0.18)]"
            : isLinebredDuplicate
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "",
        ].join(" ")}
      >
        {/* Top bar: Role badge (SIRE / DAM) & Country code */}
        <div className="flex items-center justify-between w-full gap-1 mb-0.5">
          {data.role === "sire" && (
            <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Sire
            </span>
          )}
          {data.role === "dam" && (
            <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Dam
            </span>
          )}
          {data.role === "subject" && (
            <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              Horse
            </span>
          )}
          
          <div className="flex items-center gap-1 ml-auto">
            {data.country && (
              <span className="text-[8.5px] font-mono text-zinc-400 font-medium">
                [{data.country}]
              </span>
            )}
            {data.year && (
              <span className="text-[8.5px] font-mono text-zinc-500">
                {data.year}
              </span>
            )}
          </div>
        </div>

        {/* Horse Name */}
        <span
          className={["block w-full truncate leading-tight text-left", nameTextStyles[tier]].join(" ")}
          title={data.name}
        >
          {data.name}
        </span>
      </div>
    </div>
  );
}

/**
 * Clean SVG tree connector between generation columns.
 */
function TreeConnector({ splits = 2 }: { splits?: number }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center" aria-hidden>
      <svg className="w-full h-full text-zinc-800 stroke-current" preserveAspectRatio="none">
        {splits === 2 && (
          <>
            {/* Left center horizontal arm */}
            <line x1="0" y1="50%" x2="50%" y2="50%" strokeWidth="1" />
            {/* Vertical stem */}
            <line x1="50%" y1="25%" x2="50%" y2="75%" strokeWidth="1" />
            {/* Right top horizontal arm */}
            <line x1="50%" y1="25%" x2="100%" y2="25%" strokeWidth="1" />
            {/* Right bottom horizontal arm */}
            <line x1="50%" y1="75%" x2="100%" y2="75%" strokeWidth="1" />
          </>
        )}
      </svg>
    </div>
  );
}

/**
 * 4-Generation Pedigree Bracket Matrix.
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
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const linebredDuplicates = getLinebreedingDuplicates(tree);

  const isHighlighted = (name?: string) => {
    if (!name || !hoveredName) return false;
    return name.toLowerCase().trim() === hoveredName;
  };

  const isDuplicate = (name?: string) => {
    if (!name || name === "—") return false;
    return linebredDuplicates.has(name.toLowerCase().trim());
  };

  return (
    <div className="border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl rounded-xl p-4 md:p-6 space-y-4">
      {/* Mobile scroll hint */}
      <div className="md:hidden flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-1.5">
        <span>Pedigree Matrix</span>
        <span className="text-emerald-400 font-mono text-[10px]">Scroll right →</span>
      </div>

      {linebredDuplicates.size > 0 && (
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>
            Linebreeding detected: <strong className="text-emerald-300 font-medium">{linebredDuplicates.size} repeated ancestor{linebredDuplicates.size > 1 ? "s" : ""}</strong> in 4 generations. Hover over names to highlight matching lines.
          </span>
        </div>
      )}

      {/* Grid container */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="min-w-[760px] py-2">
          {/* Header row labels */}
          <div
            className="grid text-[10px] uppercase tracking-wider font-mono text-zinc-500 mb-2 px-1 text-center"
            style={{
              gridTemplateColumns: "160px 32px 150px 32px 150px 32px 150px",
            }}
          >
            <span>Subject</span>
            <span />
            <span>Parents</span>
            <span />
            <span>Grandparents</span>
            <span />
            <span>Great-Grandparents</span>
          </div>

          <div
            className="grid"
            style={{
              gridTemplateColumns: "160px 32px 150px 32px 150px 32px 150px",
              gridTemplateRows: "repeat(8, minmax(50px, 1fr))",
              rowGap: "6px",
            }}
          >
            {/* Gen 0: Subject — spans all 8 rows */}
            <div className="col-start-1 row-start-1 row-span-8 flex items-center pr-1">
              <PedigreeNode
                data={tree.horse}
                tier="subject"
                onHover={setHoveredName}
              />
            </div>

            {/* Connector 1: Subject → Parents */}
            <div className="col-start-2 row-start-1 row-span-8">
              <TreeConnector splits={2} />
            </div>

            {/* Gen 1: Parents */}
            <div className="col-start-3 row-start-1 row-span-4 flex items-center px-1">
              <PedigreeNode
                data={tree.sire}
                tier="parent"
                isLinebredDuplicate={isDuplicate(tree.sire.name)}
                isHighlighted={isHighlighted(tree.sire.name)}
                onHover={setHoveredName}
              />
            </div>
            <div className="col-start-3 row-start-5 row-span-4 flex items-center px-1">
              <PedigreeNode
                data={tree.dam}
                tier="parent"
                isLinebredDuplicate={isDuplicate(tree.dam.name)}
                isHighlighted={isHighlighted(tree.dam.name)}
                onHover={setHoveredName}
              />
            </div>

            {/* Connector 2: Parents → Grandparents */}
            <div className="col-start-4 row-start-1 row-span-4">
              <TreeConnector splits={2} />
            </div>
            <div className="col-start-4 row-start-5 row-span-4">
              <TreeConnector splits={2} />
            </div>

            {/* Gen 2: Grandparents */}
            <div className="col-start-5 row-start-1 row-span-2 flex items-center px-1">
              <PedigreeNode
                data={tree.sireSire}
                tier="grand"
                isLinebredDuplicate={isDuplicate(tree.sireSire.name)}
                isHighlighted={isHighlighted(tree.sireSire.name)}
                onHover={setHoveredName}
              />
            </div>
            <div className="col-start-5 row-start-3 row-span-2 flex items-center px-1">
              <PedigreeNode
                data={tree.sireDam}
                tier="grand"
                isLinebredDuplicate={isDuplicate(tree.sireDam.name)}
                isHighlighted={isHighlighted(tree.sireDam.name)}
                onHover={setHoveredName}
              />
            </div>
            <div className="col-start-5 row-start-5 row-span-2 flex items-center px-1">
              <PedigreeNode
                data={tree.damSire}
                tier="grand"
                isLinebredDuplicate={isDuplicate(tree.damSire.name)}
                isHighlighted={isHighlighted(tree.damSire.name)}
                onHover={setHoveredName}
              />
            </div>
            <div className="col-start-5 row-start-7 row-span-2 flex items-center px-1">
              <PedigreeNode
                data={tree.damDam}
                tier="grand"
                isLinebredDuplicate={isDuplicate(tree.damDam.name)}
                isHighlighted={isHighlighted(tree.damDam.name)}
                onHover={setHoveredName}
              />
            </div>

            {/* Connector 3: Grandparents → Great-Grandparents */}
            <div className="col-start-6 row-start-1 row-span-2">
              <TreeConnector splits={2} />
            </div>
            <div className="col-start-6 row-start-3 row-span-2">
              <TreeConnector splits={2} />
            </div>
            <div className="col-start-6 row-start-5 row-span-2">
              <TreeConnector splits={2} />
            </div>
            <div className="col-start-6 row-start-7 row-span-2">
              <TreeConnector splits={2} />
            </div>

            {/* Gen 3: Great-Grandparents */}
            <div className="col-start-7 row-start-1 flex items-center pl-1">
              <PedigreeNode
                data={tree.sireSireSire}
                tier="great"
                isLinebredDuplicate={isDuplicate(tree.sireSireSire.name)}
                isHighlighted={isHighlighted(tree.sireSireSire.name)}
                onHover={setHoveredName}
              />
            </div>
            <div className="col-start-7 row-start-2 flex items-center pl-1">
              <PedigreeNode
                data={tree.sireSireDam}
                tier="great"
                isLinebredDuplicate={isDuplicate(tree.sireSireDam.name)}
                isHighlighted={isHighlighted(tree.sireSireDam.name)}
                onHover={setHoveredName}
              />
            </div>
            <div className="col-start-7 row-start-3 flex items-center pl-1">
              <PedigreeNode
                data={tree.sireDamSire}
                tier="great"
                isLinebredDuplicate={isDuplicate(tree.sireDamSire.name)}
                isHighlighted={isHighlighted(tree.sireDamSire.name)}
                onHover={setHoveredName}
              />
            </div>
            <div className="col-start-7 row-start-4 flex items-center pl-1">
              <PedigreeNode
                data={tree.sireDamDam}
                tier="great"
                isLinebredDuplicate={isDuplicate(tree.sireDamDam.name)}
                isHighlighted={isHighlighted(tree.sireDamDam.name)}
                onHover={setHoveredName}
              />
            </div>
            <div className="col-start-7 row-start-5 flex items-center pl-1">
              <PedigreeNode
                data={tree.damSireSire}
                tier="great"
                isLinebredDuplicate={isDuplicate(tree.damSireSire.name)}
                isHighlighted={isHighlighted(tree.damSireSire.name)}
                onHover={setHoveredName}
              />
            </div>
            <div className="col-start-7 row-start-6 flex items-center pl-1">
              <PedigreeNode
                data={tree.damSireDam}
                tier="great"
                isLinebredDuplicate={isDuplicate(tree.damSireDam.name)}
                isHighlighted={isHighlighted(tree.damSireDam.name)}
                onHover={setHoveredName}
              />
            </div>
            <div className="col-start-7 row-start-7 flex items-center pl-1">
              <PedigreeNode
                data={tree.damDamSire}
                tier="great"
                isLinebredDuplicate={isDuplicate(tree.damDamSire.name)}
                isHighlighted={isHighlighted(tree.damDamSire.name)}
                onHover={setHoveredName}
              />
            </div>
            <div className="col-start-7 row-start-8 flex items-center pl-1">
              <PedigreeNode
                data={tree.damDamDam}
                tier="great"
                isLinebredDuplicate={isDuplicate(tree.damDamDam.name)}
                isHighlighted={isHighlighted(tree.damDamDam.name)}
                onHover={setHoveredName}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer metadata bar */}
      <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-light">
        <span className="text-zinc-400">
          Sex: <span className="text-zinc-200 capitalize font-medium">{sex || "—"}</span>
        </span>
        <span className="text-zinc-400">
          Colour: <span className="text-zinc-200 capitalize font-medium">{colour || "—"}</span>
        </span>
        {age && (
          <span className="text-zinc-400">
            Age: <span className="text-zinc-200 font-medium">{age} Years</span>
          </span>
        )}
        {formattedFoalingDate && (
          <span className="text-zinc-400">
            Foaled: <span className="text-zinc-200 font-medium">{formattedFoalingDate}</span>
          </span>
        )}
        {breedingUrl && (
          <a
            href={breedingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 hover:underline ml-auto font-mono text-[10.5px] uppercase tracking-wider"
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
    <div className="space-y-5">
      {/* Top Bar: Broodmare Sire Card & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {damSireName ? (
          <div className="inline-flex items-center gap-2.5 text-xs text-zinc-200 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3.5 py-2">
            <span className="text-emerald-400 font-semibold uppercase text-[9.5px] tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              Broodmare Sire
            </span>
            <span className="text-foreground font-medium text-sm">{damSireName}</span>
          </div>
        ) : <div />}

        {hasFullPedigree && (
          <div className="flex gap-1.5 bg-zinc-900/60 p-1 border border-zinc-800 rounded-lg">
            {(["tree", "dam-line", "sire-line"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`text-[10px] uppercase tracking-widest font-mono px-3 py-1.5 rounded-md transition-all ${
                  view === v
                    ? "border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-medium"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                {v === "tree" ? "Pedigree Matrix" : v.replace("-", " ")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Pedigree Tree View */}
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

      {/* Dam Line View */}
      {view === "dam-line" && hasFullPedigree && damLine.length > 0 && (
        <div className="border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
            <h5 className="text-xs uppercase tracking-wider font-mono text-zinc-400">Dam Line (Tail Female Timeline)</h5>
            {damLineUrl && (
              <a
                href={damLineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-emerald-400 hover:underline uppercase tracking-widest font-mono"
              >
                Full Dam Line ↗
              </a>
            )}
          </div>
          <div className="space-y-1">
            {damLine.map((entry, i) => {
              const mareName = entry.name || "—";
              const sireName = entry.partner?.name || "—";
              const meta = [entry.country, entry.year].filter(Boolean).join(" ").trim() || undefined;
              const sireMeta = [entry.partner?.country, entry.partner?.year].filter(Boolean).join(" ").trim() || undefined;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-xs font-light py-2.5 px-3 rounded-lg hover:bg-zinc-900/50 transition-colors ${
                    i < damLine.length - 1 ? "border-b border-zinc-800/40" : ""
                  }`}
                >
                  <span className="text-zinc-500 font-mono w-6 text-right font-medium">{String(i + 1).padStart(2, "0")}.</span>
                  <span className="text-rose-300 font-medium truncate">{mareName}</span>
                  {meta && <span className="text-zinc-400 text-[10px] font-mono whitespace-nowrap">[{meta}]</span>}
                  <span className="text-zinc-500 text-[10px] italic">by</span>
                  <span className="text-emerald-300 font-medium truncate">{sireName}</span>
                  {sireMeta && <span className="text-zinc-400 text-[10px] font-mono whitespace-nowrap">[{sireMeta}]</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sire Line View */}
      {view === "sire-line" && hasFullPedigree && sireLine.length > 0 && (
        <div className="border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
            <h5 className="text-xs uppercase tracking-wider font-mono text-zinc-400">Sire Line (Paternal Stallion Line)</h5>
            {sireLineUrl && (
              <a
                href={sireLineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-emerald-400 hover:underline uppercase tracking-widest font-mono"
              >
                Full Sire Line ↗
              </a>
            )}
          </div>
          <div className="space-y-1">
            {sireLine.map((entry, i) => {
              const sireName = entry.name || "—";
              const damName = entry.partner?.name || "—";
              const meta = [entry.country, entry.year].filter(Boolean).join(" ").trim() || undefined;
              const damMeta = [entry.partner?.country, entry.partner?.year].filter(Boolean).join(" ").trim() || undefined;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-xs font-light py-2.5 px-3 rounded-lg hover:bg-zinc-900/50 transition-colors ${
                    i < sireLine.length - 1 ? "border-b border-zinc-800/40" : ""
                  }`}
                >
                  <span className="text-zinc-500 font-mono w-6 text-right font-medium">{String(i + 1).padStart(2, "0")}.</span>
                  <span className="text-emerald-300 font-medium truncate">{sireName}</span>
                  {meta && <span className="text-zinc-400 text-[10px] font-mono whitespace-nowrap">[{meta}]</span>}
                  <span className="text-zinc-500 text-[10px] italic">from</span>
                  <span className="text-rose-300 font-medium truncate">{damName}</span>
                  {damMeta && <span className="text-zinc-400 text-[10px] font-mono whitespace-nowrap">[{damMeta}]</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
