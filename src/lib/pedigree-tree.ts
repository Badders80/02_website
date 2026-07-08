interface PedigreeEntry {
  mare?: string;
  sire?: string;
  dam?: string;
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
    sireSire: sireLine[1]?.sire || "—",
    sireDam: sireLine[0]?.dam || "—",
    damSire: damLine[0]?.sire || "—",
    damDam: damLine[1]?.mare || "—",
    sireSireSire: sireLine[2]?.sire || "—",
    sireSireDam: sireLine[1]?.dam || "—",
    sireDamSire: crossLine?.sire_dam_sire || "—",
    sireDamDam: crossLine?.sire_dam_dam || "—",
    damSireSire: crossLine?.dam_sire_sire || "—",
    damSireDam: crossLine?.dam_sire_dam || "—",
    damDamSire: damLine[1]?.sire || "—",
    damDamDam: damLine[2]?.mare || "—",
  };
}