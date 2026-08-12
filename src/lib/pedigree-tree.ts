export interface PedigreeEntry {
  name: string;
  country?: string;
  year?: string;
  partner?: {
    name: string;
    country?: string;
    year?: string;
  };
}

export interface PedigreeCrossLine {
  sire_dam_sire?: string;
  sire_dam_dam?: string;
  dam_sire_sire?: string;
  dam_sire_dam?: string;
}

export interface PedigreeNodeData {
  name: string;
  country?: string;
  year?: string;
}

export interface PedigreeTreeNodes {
  horse: PedigreeNodeData;
  sire: PedigreeNodeData;
  dam: PedigreeNodeData;
  sireSire: PedigreeNodeData;
  sireDam: PedigreeNodeData;
  damSire: PedigreeNodeData;
  damDam: PedigreeNodeData;
  sireSireSire: PedigreeNodeData;
  sireSireDam: PedigreeNodeData;
  sireDamSire: PedigreeNodeData;
  sireDamDam: PedigreeNodeData;
  damSireSire: PedigreeNodeData;
  damSireDam: PedigreeNodeData;
  damDamSire: PedigreeNodeData;
  damDamDam: PedigreeNodeData;
}

function entryToNodeData(entry?: PedigreeEntry | null): PedigreeNodeData {
  return {
    name: entry?.name || "—",
    country: entry?.country,
    year: entry?.year,
  };
}

function partnerToNodeData(entry?: PedigreeEntry | null): PedigreeNodeData {
  return {
    name: entry?.partner?.name || "—",
    country: entry?.partner?.country,
    year: entry?.partner?.year,
  };
}

function nameToNodeData(name: string): PedigreeNodeData {
  return { name: name || "—" };
}

export function formatPedigreeName(entry?: PedigreeEntry | null): string {
  if (!entry || !entry.name) return "—";
  let full = entry.name;
  if (entry.country) full += ` (${entry.country})`;
  if (entry.year) full += ` ${entry.year}`;
  return full;
}

export function formatPartnerName(entry?: PedigreeEntry | null): string {
  if (!entry?.partner || !entry.partner.name) return "—";
  let full = entry.partner.name;
  if (entry.partner.country) full += ` (${entry.partner.country})`;
  if (entry.partner.year) full += ` ${entry.partner.year}`;
  return full;
}

export function buildPedigreeTree(
  sireName: string,
  damName: string,
  horseName: string,
  sireLine: PedigreeEntry[] = [],
  damLine: PedigreeEntry[] = [],
  crossLine?: PedigreeCrossLine | null,
): PedigreeTreeNodes {
  return {
    horse: nameToNodeData(horseName),
    sire: nameToNodeData(sireName),
    dam: nameToNodeData(damName),
    sireSire: entryToNodeData(sireLine[1]),
    sireDam: partnerToNodeData(sireLine[0]),
    damSire: partnerToNodeData(damLine[0]),
    damDam: entryToNodeData(damLine[1]),
    sireSireSire: entryToNodeData(sireLine[2]),
    sireSireDam: partnerToNodeData(sireLine[1]),
    sireDamSire: nameToNodeData(crossLine?.sire_dam_sire || "—"),
    sireDamDam: nameToNodeData(crossLine?.sire_dam_dam || "—"),
    damSireSire: nameToNodeData(crossLine?.dam_sire_sire || "—"),
    damSireDam: nameToNodeData(crossLine?.dam_sire_dam || "—"),
    damDamSire: partnerToNodeData(damLine[1]),
    damDamDam: entryToNodeData(damLine[2]),
  };
}
