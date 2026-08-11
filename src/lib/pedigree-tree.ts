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

export interface PedigreeTreeNodes {
  horse: string;
  sire: string;
  dam: string;
  sireSire: string;
  sireDam: string;
  damSire: string;
  damDam: string;
  sireSireSire: string;
  sireSireDam: string;
  sireDamSire: string;
  sireDamDam: string;
  damSireSire: string;
  damSireDam: string;
  damDamSire: string;
  damDamDam: string;
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
    horse: horseName,
    sire: sireName,
    dam: damName,
    sireSire: formatPedigreeName(sireLine[1]),
    sireDam: formatPartnerName(sireLine[0]),
    damSire: formatPartnerName(damLine[0]),
    damDam: formatPedigreeName(damLine[1]),
    sireSireSire: formatPedigreeName(sireLine[2]),
    sireSireDam: formatPartnerName(sireLine[1]),
    sireDamSire: crossLine?.sire_dam_sire || "—",
    sireDamDam: crossLine?.sire_dam_dam || "—",
    damSireSire: crossLine?.dam_sire_sire || "—",
    damSireDam: crossLine?.dam_sire_dam || "—",
    damDamSire: formatPartnerName(damLine[1]),
    damDamDam: formatPedigreeName(damLine[2]),
  };
}
