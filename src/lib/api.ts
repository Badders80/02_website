/**
 * LEGACY / DORMANT — GCP Cloud Functions retired (billing delinquent).
 *
 * This module used to call the Evolution Stables GCP Cloud Functions backend
 * (cloudfunctions.net endpoints) via the /api/proxy route and Vercel OIDC/WIF.
 * The GCP backend is permanently gone.
 *
 * The exported function signatures remain only so that dormant admin pages
 * (which still have commented-out references to this module) do not break at
 * import time. Active routes no longer import this file.
 *
 * Do not add new calls here. All live data now comes from local JSON in src/data/.
 */

export async function getHorses() {
  throw new Error("GCP backend retired");
}

export async function getHorseByMicrochip(_microchip: string) {
  throw new Error("GCP backend retired");
}

export async function createHorse(_data: HorseCreatePayload) {
  throw new Error("GCP backend retired");
}

export async function extractFromLoveracing(_url: string) {
  throw new Error("GCP backend retired");
}

export async function getOwners() {
  throw new Error("GCP backend retired");
}

export async function createOwner(_data: any) {
  throw new Error("GCP backend retired");
}

export async function getTrainers() {
  throw new Error("GCP backend retired");
}

export async function createTrainer(_data: any) {
  throw new Error("GCP backend retired");
}

export async function getHlts(_params?: { status?: string; horse_microchip?: string; resolve?: boolean }) {
  throw new Error("GCP backend retired");
}

export async function getHltById(_id: string, _resolve = false) {
  throw new Error("GCP backend retired");
}

export async function createHlt(_data: any) {
  throw new Error("GCP backend retired");
}

export async function getHoldings(_userId: string) {
  throw new Error("GCP backend retired");
}

export async function getContent(_params?: { horse_microchip?: string; content_type?: string; status?: string }) {
  throw new Error("GCP backend retired");
}

export async function uploadAsset(_formData: FormData) {
  throw new Error("GCP backend retired");
}

export async function retrieveAssets(_entityType?: string, _entityId?: string) {
  throw new Error("GCP backend retired");
}

export async function createKYCSession(_userId: string, _email?: string) {
  throw new Error("GCP backend retired");
}

export async function deleteAsset(_assetId: string) {
  throw new Error("GCP backend retired");
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface HorseCreatePayload {
  microchip: string;
  name: string;
  foaling_date: string;
  sex: string;
  colour?: string;
  sire_name?: string;
  dam_name?: string;
  family_number?: string;
  breeder?: string;
  left_shoulder_brand?: string;
  right_shoulder_brand?: string;
  trainer_id?: string;
  status?: "active" | "retired" | "deceased";
  loveracing_ref?: {
    loveracing_id: number;
    slug: string;
    source_url: string;
  };
}
