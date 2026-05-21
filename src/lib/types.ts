// TypeScript types for Evolution Stables API

export interface Horse {
  microchip: string;
  name: string;
  sex: "colt" | "filly" | "gelding" | "mare" | "stallion";
  foaling_date: string;
  colour: string;
  sire: string;
  dam: string;
  breeder: string;
  owner_id: string;
  status: "active" | "retired" | "deceased";
  created_at: string;
  updated_at: string;
}

export interface Owner {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  kyc_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface HLT {
  id: string;
  horse_microchip: string;
  name: string;
  status: "draft" | "pending" | "published" | "closed";
  term_sheet_url?: string;
  pds_url?: string;
  syndicate_agreement_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  horse_id: string;
  asset_type: "image" | "document" | "video";
  gcs_url: string;
  public_url: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface KYCSession {
  session_id: string;
  session_url: string;
  user_id: string;
  status: "pending" | "completed" | "failed";
}
