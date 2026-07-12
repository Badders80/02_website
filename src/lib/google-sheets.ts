import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { lotTotalNzd } from "./pricing";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || "1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg";
/** Runtime ops inventory tab. Default `hlts` (not the sync template name "Inventory"). Override via GOOGLE_SHEETS_INVENTORY_TAB. */
const INVENTORY_TAB = process.env.GOOGLE_SHEETS_INVENTORY_TAB || "hlts";
// Tab titles must match the live spreadsheet exactly (case-sensitive).
const HOLDINGS_TAB = process.env.GOOGLE_SHEETS_HOLDINGS_TAB || "holdings";
const LEADS_TAB = process.env.GOOGLE_SHEETS_LEADS_TAB || "leads";
const COMMUNICATIONS_TAB = process.env.GOOGLE_SHEETS_COMMUNICATIONS_TAB || "communications";

/** Default platform fee (%) when sheet cell empty — commercial SOP (list = owner × 1.05). */
const DEFAULT_PLATFORM_FEE_PCT = 5;

// In-memory cache for inventory reads (60s TTL)
const inventoryCache: Record<string, { data: any; expiry: number }> = {};
const CACHE_TTL = 60_000; // 60 seconds

// Retry wrapper for transient failures
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (attempt < maxAttempts - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

function getAuth() {
  // Production: service account
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (keyJson) {
    const creds = JSON.parse(keyJson);
    return new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }

  // Dev fallback: OAuth2 token.json
  const tokenPath = path.join(process.cwd(), "scripts", "token.json");
  if (fs.existsSync(tokenPath)) {
    const creds = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
    const oauth2Client = new google.auth.OAuth2(
      creds.client_id,
      creds.client_secret,
      creds.token_uri
    );
    oauth2Client.setCredentials({
      refresh_token: creds.refresh_token,
      access_token: creds.token,
    });
    return oauth2Client;
  }

  throw new Error("Google Sheets auth not configured — set GOOGLE_SERVICE_ACCOUNT_KEY env var or provide scripts/token.json");
}

function getSheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

function columnToLetter(column: number): string {
  let temp = column;
  let letter = "";
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

/** Parse a sheet cell as a finite number, or null if blank/invalid. Does not invent zeros for commercial fields. */
function parseOptionalNumber(raw: unknown): number | null {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Lot list price from owner rate via `./pricing` (no import cycle: pricing is pure math).
 *   list_rate = owner × (1 + fee/100); lot_pct = stake/lots; lot = list_rate × lot_pct × months
 * Returns null when inputs incomplete or invalid (does not invent prices).
 */
function deriveLotPriceFromOwnerRate(
  ownerRatePer1pctMonth: number,
  platformFeePct: number,
  leaseholdStakePct: number,
  sharesTotal: number,
  leasePeriodMonths: number
): number | null {
  if (
    !(ownerRatePer1pctMonth > 0) ||
    !(sharesTotal > 0) ||
    !(leasePeriodMonths > 0) ||
    !(leaseholdStakePct > 0)
  ) {
    return null;
  }
  try {
    const lot = lotTotalNzd({
      ownerRatePer1PctMonth: ownerRatePer1pctMonth,
      platformFeePct,
      stakePct: leaseholdStakePct,
      lots: sharesTotal,
      months: leasePeriodMonths,
    });
    return Number.isFinite(lot) ? lot : null;
  } catch {
    return null;
  }
}

// --- Types ---

export interface InventoryRow {
  slug: string;
  name: string;
  listing_status: string;
  /** Explicit sheet price, or derived from owner rate; null if neither available (no fake defaults). */
  price_per_share_nzd: number | null;
  shares_total: number;
  shares_sold: number;
  leasehold_stake_pct: number | null;
  lease_period_months: number | null;
  lease_start_date: string;
  /** Null when sheet cell empty — do not invent e.g. 80. Callers must handle. */
  investor_return_pct: number | null;
  /** Raw sheet campaign_status (pass-through; derivation lives in campaign-status module). */
  campaign_status: string;
  /** Owner $/1%/month. Aliases: owner_rate, rate_per_1pct_month. */
  owner_rate_per_1pct_month: number | null;
  /** Platform fee % on list rate. Defaults to 5 when missing/empty. */
  platform_fee_pct: number;
  marketplace_visible: string;
  trainer_name: string;
  trainer_stable: string;
  trainer_location: string;
  wins: number;
  placed: number;
  next_up: string;
  loveracing_id?: number;
}

export interface HoldingRow {
  purchase_id: string;
  timestamp: string;
  user_email: string;
  horse_slug: string;
  shares_owned: number;
  purchase_price_total_nzd: number;
  signed_pds_url: string;
  signed_sa_url: string;
  kyc_status: string;
  utm_source: string;
  utm_campaign: string;
}

export interface LeadRow {
  timestamp: string;
  user_email: string;
  user_name: string;
  horse_slug: string;
  action_type: string;
  utm_source: string;
  utm_campaign: string;
  referrer_url: string;
  status: string;
}

export interface CommunicationRow {
  timestamp: string;
  recipient_email: string;
  subject: string;
  snippet: string;
  body_html: string;
  category: string;
}

// --- Inventory reads ---

/** Known header names for docs / ensureSheetExists; runtime mapping is header-flexible + case-insensitive. */
const INVENTORY_HEADERS = [
  "horse_slug", "horse_name", "listing_status", "campaign_status",
  "price_per_share_nzd", "owner_rate_per_1pct_month", "platform_fee_pct",
  "shares_total", "shares_sold", "leasehold_stake_pct", "lease_period_months",
  "lease_start_date", "investor_return_pct", "marketplace_visible",
  "trainer_name", "trainer_stable", "trainer_location",
  "wins", "placed", "next_up", "loveracing_id", "image_path", "story", "pedigree",
];

function mapInventoryRow(headers: string[], row: string[]): InventoryRow {
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => {
    obj[h] = row[i] ?? "";
  });

  const ownerRate = parseOptionalNumber(
    obj.owner_rate_per_1pct_month || obj.owner_rate || obj.rate_per_1pct_month
  );

  const platformFeeRaw = parseOptionalNumber(obj.platform_fee_pct);
  const platform_fee_pct =
    platformFeeRaw !== null ? platformFeeRaw : DEFAULT_PLATFORM_FEE_PCT;

  const leasehold_stake_pct = parseOptionalNumber(obj.leasehold_stake_pct);
  const lease_period_months = parseOptionalNumber(obj.lease_period_months);
  const shares_total = Number(obj.shares_total || 0) || 0;
  const shares_sold = Number(obj.shares_sold || 0) || 0;

  // Prefer explicit lot price; else derive from owner rate (no invented commercial prices).
  const explicitPrice = parseOptionalNumber(obj.price_per_share_nzd);
  let price_per_share_nzd: number | null = explicitPrice;
  if (price_per_share_nzd === null && ownerRate !== null) {
    price_per_share_nzd = deriveLotPriceFromOwnerRate(
      ownerRate,
      platform_fee_pct,
      leasehold_stake_pct ?? 0,
      shares_total,
      lease_period_months ?? 0
    );
  }

  return {
    slug: obj.slug || obj.horse_slug || "",
    name: obj.name || obj.horse_name || "",
    listing_status: obj.listing_status || "draft",
    campaign_status: (obj.campaign_status || "").trim(),
    price_per_share_nzd,
    shares_total,
    shares_sold,
    leasehold_stake_pct,
    lease_period_months,
    lease_start_date: obj.lease_start_date || "",
    investor_return_pct: parseOptionalNumber(obj.investor_return_pct),
    owner_rate_per_1pct_month: ownerRate,
    platform_fee_pct,
    marketplace_visible: (obj.marketplace_visible || "").trim(),
    trainer_name: obj.trainer_name || "",
    trainer_stable: obj.trainer_stable || "",
    trainer_location: obj.trainer_location || "",
    wins: Number(obj.wins || 0) || 0,
    placed: Number(obj.placed || 0) || 0,
    next_up: obj.next_up || "",
    loveracing_id: obj.loveracing_id ? Number(obj.loveracing_id) : undefined,
  };
}

/** Read all rows from the runtime ops inventory tab (`hlts` by default). */
export async function readInventory(): Promise<InventoryRow[]> {
  try {
    return await withRetry(async () => {
      const sheets = getSheets();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${INVENTORY_TAB}!A:AZ`,
      });
      const rows = response.data.values;
      if (!rows || rows.length <= 1) return [];

      const headers = rows[0].map((h: string) => h.toLowerCase().trim());
      return rows.slice(1).map((row: string[]) => mapInventoryRow(headers, row));
    });
  } catch (err: any) {
    console.error("[Google Sheets] Failed to read inventory:", err.message);
    return [];
  }
}

/** Alias for marketplace listing — same as readInventory (all rows). */
export async function readInventoryList(): Promise<InventoryRow[]> {
  return readInventory();
}

export async function readInventoryBySlug(slug: string): Promise<InventoryRow | null> {
  // Check cache first
  const cached = inventoryCache[slug];
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  try {
    const all = await readInventory();
    const row = all.find(r => r.slug === slug);
    if (row) {
      inventoryCache[slug] = { data: row, expiry: Date.now() + CACHE_TTL };
    }
    return row || null;
  } catch (err: any) {
    console.error(`[Google Sheets] Failed to get live inventory for ${slug}:`, err.message);
    return null;
  }
}

/**
 * Live ops snapshot for one horse (checkout, inventory API, purchase UI).
 * Commercial fields are null when unknown — no fake 80% return / invented prices.
 * campaign_status is raw sheet value; status derivation stays in campaign-status module.
 */
export async function getLiveInventory(horseSlug: string) {
  const row = await readInventoryBySlug(horseSlug);
  if (!row) return null;
  return {
    slug: row.slug,
    name: row.name,
    shares_sold: row.shares_sold,
    shares_total: row.shares_total,
    shares_available: Math.max(0, row.shares_total - row.shares_sold),
    listing_status: row.listing_status,
    campaign_status: row.campaign_status || null,
    price_per_share_nzd: row.price_per_share_nzd,
    owner_rate_per_1pct_month: row.owner_rate_per_1pct_month,
    platform_fee_pct: row.platform_fee_pct,
    marketplace_visible: row.marketplace_visible,
    totalLeasePercent: row.leasehold_stake_pct,
    leasePeriodMonths: row.lease_period_months,
    leaseStartDate: row.lease_start_date || "",
    investorReturnPct: row.investor_return_pct,
  };
}

// --- Inventory writes ---

export async function updateInventorySharesSold(slug: string, newSharesSold: number): Promise<void> {
  try {
    await withRetry(async () => {
      const sheets = getSheets();
      // Read current data to find the row for this slug
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${INVENTORY_TAB}!A:AZ`,
      });
      const rows = response.data.values;
      if (!rows || rows.length <= 1) throw new Error("No inventory data");

      const headers = rows[0].map((h: string) => h.toLowerCase().trim());
      const slugIndex = headers.indexOf("slug") !== -1 ? headers.indexOf("slug") : headers.indexOf("horse_slug");
      const soldIndex = headers.indexOf("shares_sold");

      if (slugIndex === -1 || soldIndex === -1) {
        throw new Error("Required columns not found in inventory sheet");
      }

      // Find the row (1-indexed for Sheets API, +1 for header)
      const rowIndex = rows.slice(1).findIndex((row: string[]) => row[slugIndex] === slug);
      if (rowIndex === -1) {
        throw new Error(`Horse slug "${slug}" not found in inventory`);
      }

      const sheetRow = rowIndex + 2; // 1-indexed + header row
      const soldColumn = columnToLetter(soldIndex); // Convert 0-indexed to letter

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${INVENTORY_TAB}!${soldColumn}${sheetRow}`,
        valueInputOption: "RAW",
        requestBody: { values: [[newSharesSold]] },
      });

      // Invalidate cache
      delete inventoryCache[slug];
    });
  } catch (err: any) {
    console.error(`[Google Sheets] Failed to update shares_sold for ${slug}:`, err.message);
    throw err;
  }
}

// --- Holdings ---

const HOLDINGS_HEADERS = [
  "purchase_id", "timestamp", "user_email", "horse_slug", "shares_owned",
  "purchase_price_total_nzd", "signed_pds_url", "signed_sa_url",
  "kyc_status", "utm_source", "utm_campaign",
];

export async function appendHolding(row: HoldingRow): Promise<void> {
  try {
    await withRetry(async () => {
      const sheets = getSheets();
      await ensureSheetExists(sheets, HOLDINGS_TAB, HOLDINGS_HEADERS);
      const values = [[
        row.purchase_id, row.timestamp, row.user_email, row.horse_slug,
        row.shares_owned, row.purchase_price_total_nzd,
        row.signed_pds_url, row.signed_sa_url, row.kyc_status,
        row.utm_source, row.utm_campaign,
      ]];
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${HOLDINGS_TAB}!A:K`,
        valueInputOption: "RAW",
        requestBody: { values },
      });
    });
  } catch (err: any) {
    console.error("[Google Sheets] Failed to append holding:", err.message);
    throw err;
  }
}

export async function checkHoldingExists(purchaseId: string): Promise<boolean> {
  try {
    return await withRetry(async () => {
      const sheets = getSheets();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${HOLDINGS_TAB}!A:K`,
      });
      const rows = response.data.values;
      if (!rows || rows.length <= 1) return false;

      const headers = rows[0].map((h: string) => h.toLowerCase().trim());
      const purchaseIdIndex = headers.indexOf("purchase_id");
      if (purchaseIdIndex === -1) return false;

      return rows.slice(1).some((row: string[]) => row[purchaseIdIndex] === purchaseId);
    });
  } catch (err: any) {
    console.error(`[Google Sheets] Failed to check holding existence for ${purchaseId}:`, err.message);
    return false; // Fail safe — if we can't check, don't block processing (may create duplicate, but better than losing payment data)
  }
}

export async function readHoldingsByEmail(email: string): Promise<HoldingRow[]> {
  try {
    return await withRetry(async () => {
      const sheets = getSheets();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${HOLDINGS_TAB}!A:K`,
      });
      const rows = response.data.values;
      if (!rows || rows.length <= 1) return [];

      const headers = rows[0].map((h: string) => h.toLowerCase().trim());
      const emailIndex = headers.indexOf("user_email");

      return rows.slice(1)
        .filter((row: string[]) => row[emailIndex]?.toLowerCase() === email.toLowerCase())
        .map((row: string[]) => ({
          purchase_id: row[headers.indexOf("purchase_id")] || "",
          timestamp: row[headers.indexOf("timestamp")] || "",
          user_email: row[emailIndex] || "",
          horse_slug: row[headers.indexOf("horse_slug")] || "",
          shares_owned: Number(row[headers.indexOf("shares_owned")] || 0),
          purchase_price_total_nzd: Number(row[headers.indexOf("purchase_price_total_nzd")] || 0),
          signed_pds_url: row[headers.indexOf("signed_pds_url")] || "",
          signed_sa_url: row[headers.indexOf("signed_sa_url")] || "",
          kyc_status: row[headers.indexOf("kyc_status")] || "",
          utm_source: row[headers.indexOf("utm_source")] || "",
          utm_campaign: row[headers.indexOf("utm_campaign")] || "",
        }));
    });
  } catch (err: any) {
    console.error(`[Google Sheets] Failed to fetch holdings for ${email}:`, err.message);
    return [];
  }
}

// --- Leads ---

const LEADS_HEADERS = [
  "timestamp", "user_email", "user_name", "horse_slug", "action_type",
  "utm_source", "utm_campaign", "referrer_url", "status",
];

export async function appendLead(row: LeadRow): Promise<void> {
  try {
    await withRetry(async () => {
      const sheets = getSheets();
      await ensureSheetExists(sheets, LEADS_TAB, LEADS_HEADERS);
      const values = [[
        row.timestamp, row.user_email, row.user_name, row.horse_slug,
        row.action_type, row.utm_source, row.utm_campaign,
        row.referrer_url, row.status,
      ]];
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${LEADS_TAB}!A:I`,
        valueInputOption: "RAW",
        requestBody: { values },
      });
    });
  } catch (err: any) {
    console.error("[Google Sheets] Failed to append lead:", err.message);
    throw err;
  }
}

// --- Communications ---

const COMMUNICATIONS_HEADERS = [
  "timestamp", "recipient_email", "subject", "snippet", "body_html", "category",
];

export async function appendCommunication(row: CommunicationRow): Promise<void> {
  try {
    await withRetry(async () => {
      const sheets = getSheets();
      await ensureSheetExists(sheets, COMMUNICATIONS_TAB, COMMUNICATIONS_HEADERS);
      const values = [[
        row.timestamp, row.recipient_email, row.subject,
        row.snippet, row.body_html, row.category,
      ]];
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${COMMUNICATIONS_TAB}!A:F`,
        valueInputOption: "RAW",
        requestBody: { values },
      });
    });
  } catch (err: any) {
    console.error("[Google Sheets] Failed to append communication:", err.message);
    throw err;
  }
}

export async function readCommunicationsByEmail(email: string): Promise<CommunicationRow[]> {
  try {
    return await withRetry(async () => {
      const sheets = getSheets();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${COMMUNICATIONS_TAB}!A:F`,
      });
      const rows = response.data.values;
      if (!rows || rows.length <= 1) return [];

      const headers = rows[0].map((h: string) => h.toLowerCase().trim());
      const emailIndex = headers.indexOf("recipient_email");

      return rows.slice(1)
        .filter((row: string[]) => row[emailIndex]?.toLowerCase() === email.toLowerCase())
        .map((row: string[]) => ({
          timestamp: row[headers.indexOf("timestamp")] || "",
          recipient_email: row[emailIndex] || "",
          subject: row[headers.indexOf("subject")] || "",
          snippet: row[headers.indexOf("snippet")] || "",
          body_html: row[headers.indexOf("body_html")] || "",
          category: row[headers.indexOf("category")] || "",
        }));
    });
  } catch (err: any) {
    console.error(`[Google Sheets] Failed to fetch communications for ${email}:`, err.message);
    return [];
  }
}

// --- Helper ---

async function ensureSheetExists(sheets: any, title: string, headers: string[]): Promise<void> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheetExists = meta.data.sheets?.some((s: any) => s.properties?.title === title);

  if (!sheetExists) {
    console.log(`[Google Sheets] Sheet "${title}" not found. Creating...`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title } } }],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${title}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
    console.log(`[Google Sheets] Created "${title}" tab with headers.`);
  }
}