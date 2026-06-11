/**
 * API Client for Evolution Stables Backend
 * 
 * Backend URLs:
 * - SSOT API: https://australia-southeast1-evolution-engine.cloudfunctions.net/ssot
 * - Assets API: https://australia-southeast1-evolution-engine.cloudfunctions.net/assets
 * - KYC API: https://australia-southeast1-evolution-engine.cloudfunctions.net/kyc
 * 
 * All API calls include a Firebase ID token in the Authorization header.
 * The token is obtained from anonymous sign-in (public browsing) or the
 * current authenticated user.
 * 
 * When targeting Cloud Functions (production), calls are routed through
 * the Next.js API proxy (/api/proxy/...) which adds GCP identity tokens
 * via Workload Identity Federation.
 */

import { getAuthToken } from "./auth-token";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
const IS_CLOUD_FUNCTION = API_BASE.includes("cloudfunctions.net");

async function apiCall(endpoint: string, options?: RequestInit) {
  // Get auth token (anonymous sign-in if no user)
  const token = await getAuthToken();

  // Route through Next.js proxy for Cloud Functions (adds GCP identity token)
  const url = IS_CLOUD_FUNCTION
    ? `/api/proxy${endpoint}`
    : `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-firebase-token": token } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: `API error: ${res.status}` }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}

// ─── SSOT API ──────────────────────────────────────────────────────────────────

export async function getHorses() {
  return apiCall("/ssot/horses");
}

export async function getHorseByMicrochip(microchip: string) {
  return apiCall(`/ssot/horses/${microchip}`);
}

export async function createHorse(data: HorseCreatePayload) {
  return apiCall("/ssot/horses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function extractFromLoveracing(url: string) {
  return apiCall("/ssot/extract", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function getOwners() {
  return apiCall("/ssot/owners");
}

export async function createOwner(data: any) {
  return apiCall("/ssot/owners", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getTrainers() {
  return apiCall("/ssot/trainers");
}

export async function createTrainer(data: any) {
  return apiCall("/ssot/trainers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getHlts(params?: { status?: string; horse_microchip?: string; resolve?: boolean }) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.horse_microchip) query.set("horse_microchip", params.horse_microchip);
  if (params?.resolve) query.set("resolve", "true");
  
  const queryString = query.toString();
  return apiCall(`/ssot/hlts${queryString ? `?${queryString}` : ""}`);
}

export async function getHltById(id: string, resolve = false) {
  return apiCall(`/ssot/hlts/${id}${resolve ? "?resolve=true" : ""}`);
}

export async function createHlt(data: any) {
  return apiCall("/ssot/hlts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getHoldings(userId: string) {
  return apiCall(`/ssot/holdings?user_id=${userId}`);
}

export async function getContent(params?: { horse_microchip?: string; content_type?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.horse_microchip) query.set("horse_microchip", params.horse_microchip);
  if (params?.content_type) query.set("content_type", params.content_type);
  if (params?.status) query.set("status", params.status);
  
  const queryString = query.toString();
  return apiCall(`/ssot/content${queryString ? `?${queryString}` : ""}`);
}


// ─── Assets API ────────────────────────────────────────────────────────────────

export async function uploadAsset(formData: FormData) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/assets/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: `Upload error: ${res.status}` }));
    throw new Error(error.error || `Upload error: ${res.status}`);
  }

  return res.json();
}

export async function retrieveAssets(entityType?: string, entityId?: string) {
  const params = new URLSearchParams();
  if (entityType) params.set("entity_type", entityType);
  if (entityId) params.set("entity_id", entityId);
  return apiCall(`/assets/retrieve?${params.toString()}`);
}

// ─── KYC API ──────────────────────────────────────────────────────────────────

export async function createKYCSession(userId: string, email?: string) {
  const token = await getAuthToken();
  const res = await fetch("/api/kyc/create-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ user_id: userId, email }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: `KYC error: ${res.status}` }));
    throw new Error(error.error || `KYC error: ${res.status}`);
  }

  return res.json();
}

export async function deleteAsset(assetId: string) {
  return apiCall(`/assets/delete?asset_id=${assetId}`, {
    method: "DELETE",
  });
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
    name_slug: string;
    source_url: string;
  };
}
