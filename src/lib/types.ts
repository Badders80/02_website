// TypeScript types for Evolution Stables API

export interface HeroPillar {
  category: string;
  value: string;
}

export interface Race {
  date: string;
  venue: string;
  race: string;
  trackCondition?: string;
  result: string;
  margin?: string;
  distance_m?: number;
  race_class?: string;
  jockey?: string;
  prizemoney_nzd?: number;
  starting_price?: string;
}

export interface Horse {
  microchip: string;
  name: string;
  display_name?: string;
  slug?: string;
  sex: "colt" | "filly" | "gelding" | "mare" | "stallion" | string;
  foaling_date: string;
  colour: string;
  sire?: string;
  sire_name?: string;
  dam?: string;
  dam_name?: string;
  dam_sire_name?: string;
  breeder: string;
  owner_id?: string;
  trainer_id?: string;
  trainer_name?: string;
  trainer_stable?: string;
  trainer_location?: string;
  trainer_contact_name?: string;
  status: "active" | "retired" | "deceased" | string;
  story?: string;
  next_up?: string;
  image_path?: string;
  hero_pillars?: HeroPillar[];
  pedigree_blurb?: string;
  trainer_commentary?: string;
  race_log?: Race[];
  wins?: string | number;
  placed?: string | number;
  starts_count?: number;
  total_earnings_nzd?: number;
  breeding_url?: string;
  performance_profile_url?: string;
  identity_status?: string;
  created_at?: string;
  updated_at?: string;
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
