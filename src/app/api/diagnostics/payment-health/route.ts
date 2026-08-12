import { NextResponse } from "next/server";
import { isPurchasesEnabled } from "@/lib/purchase-eligibility";
import {
  getLiveInventory,
  readInventoryBySlug,
  readInventoryList,
} from "@/lib/google-sheets";
import { supabase } from "@/lib/supabase";
import { getCampaignStatus, canPurchase } from "@/lib/campaign-status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Ops health for the payment pipeline.
 * Never returns secret values — only configured/ok flags and non-sensitive commercial snapshot.
 *
 * Optional gate: set PAYMENT_HEALTH_SECRET and pass `?secret=` or header `x-payment-health-secret`.
 * If the env secret is unset, endpoint stays open (boolean-only payload).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const expected = process.env.PAYMENT_HEALTH_SECRET;
  if (expected) {
    const provided =
      url.searchParams.get("secret") ||
      request.headers.get("x-payment-health-secret") ||
      "";
    if (provided !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const env = {
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_CHECKOUT_WEBHOOK_SECRET: !!(
      process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET
    ),
    STRIPE_KYC_WEBHOOK_SECRET: !!(
      process.env.STRIPE_KYC_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET
    ),
    GOOGLE_SERVICE_ACCOUNT_KEY: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    GOOGLE_SPREADSHEET_ID: !!process.env.GOOGLE_SPREADSHEET_ID,
    FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
    SMTP: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    PURCHASES_ENABLED_RAW: process.env.PURCHASES_ENABLED ?? null,
    SUPABASE: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    DUAL_WRITE_ENABLED: process.env.DUAL_WRITE_ENABLED === 'true',
  };

  const purchases_enabled = isPurchasesEnabled();

  let sheets: Record<string, unknown> = { ok: false };
  let supabaseHealth: Record<string, unknown> = { ok: false };
  let manolo: Record<string, unknown> | null = null;

  try {
    const list = await readInventoryList();
    const row = await readInventoryBySlug("i-stole-a-manolo");
    const live = await getLiveInventory("i-stole-a-manolo");

    const status = row
      ? getCampaignStatus({
          campaign_status: row.campaign_status,
          listing_status: row.listing_status,
          shares_total: row.shares_total,
          shares_sold: row.shares_sold,
          marketplace_visible: row.marketplace_visible,
        })
      : null;

    manolo = row
      ? {
          found: true,
          campaign_status: row.campaign_status,
          resolved_status: status,
          listing_status: row.listing_status,
          marketplace_visible: row.marketplace_visible,
          shares_total: row.shares_total,
          shares_sold: row.shares_sold,
          shares_available: live?.shares_available ?? null,
          owner_rate_per_1pct_month: row.owner_rate_per_1pct_month,
          platform_fee_pct: row.platform_fee_pct,
          price_per_share_nzd: row.price_per_share_nzd,
          lease_period_months: row.lease_period_months,
          investor_return_pct: row.investor_return_pct,
          can_purchase_lifecycle: status ? canPurchase(status) : false,
          kill_switch_blocks_money: !purchases_enabled,
        }
      : { found: false };

    sheets = {
      ok: list.length > 0,
      inventory_rows: list.length,
      inventory_tab_default: "hlts",
    };

    // Supabase health check alongside Sheets.
    if (process.env.DUAL_WRITE_ENABLED === 'true') {
      try {
        const { data, error } = await supabase().from('inventory').select('id').limit(1);
        supabaseHealth = {
          ok: !error,
          error: error?.message || null,
          reachable: Array.isArray(data),
        };
      } catch (supaErr: any) {
        supabaseHealth = {
          ok: false,
          error: supaErr?.message || 'supabase check failed',
          reachable: false,
        };
      }
    }
  } catch (err: any) {
    sheets = {
      ok: false,
      error: err?.message || "sheets read failed",
    };
  }

  const blockers: string[] = [];
  if (!env.STRIPE_SECRET_KEY) blockers.push("STRIPE_SECRET_KEY missing");
  if (!env.STRIPE_CHECKOUT_WEBHOOK_SECRET) blockers.push("checkout webhook secret missing");
  if (!env.STRIPE_KYC_WEBHOOK_SECRET) blockers.push("kyc webhook secret missing");
  if (!env.GOOGLE_SERVICE_ACCOUNT_KEY) blockers.push("GOOGLE_SERVICE_ACCOUNT_KEY missing");
  if (!sheets.ok) blockers.push("sheets inventory unreadable");
  if (!manolo || !(manolo as any).found) blockers.push("i-stole-a-manolo not in inventory");
  if (manolo && (manolo as any).found) {
    if (!(manolo as any).can_purchase_lifecycle) {
      blockers.push("manolo not listed (campaign_status must be listed for buy UI)");
    }
    if (!Number((manolo as any).price_per_share_nzd) || Number((manolo as any).price_per_share_nzd) <= 0) {
      blockers.push("manolo lot price invalid");
    }
    if (Number((manolo as any).shares_available) < 1) {
      blockers.push("manolo no stock");
    }
  }
  if (purchases_enabled) {
    // informational — not a blocker for health, but flag open money
  }

  const ready_for_controlled_open =
    blockers.filter((b) => !b.includes("not listed")).length === 0 &&
    !!manolo &&
    (manolo as any).can_purchase_lifecycle === true &&
    !purchases_enabled;

  return NextResponse.json({
    ok: blockers.length === 0 || (blockers.length === 1 && blockers[0].includes("not listed")),
    purchases_enabled,
    money_open: purchases_enabled,
    env: {
      ...env,
      PAYMENT_RECOVER_SECRET: !!process.env.PAYMENT_RECOVER_SECRET,
    },
    sheets,
    supabase: supabaseHealth,
    manolo,
    webhook: {
      checkout_url: "https://www.evolutionstables.nz/api/checkout/webhook",
      events: ["checkout.session.completed"],
      secret_configured: !!process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET,
      recover_path: "/api/checkout/recover",
      note: "Zero Vercel logs for webhook = Stripe never delivered. Configure LIVE endpoint in Dashboard, then resend or use recover.",
    },
    blockers,
    ready_for_controlled_open,
    next: purchases_enabled
      ? "Money is OPEN — monitor holdings + inventory after any purchase"
      : "Kill-switch OFF. Stage manolo as listed, verify this endpoint, then set PURCHASES_ENABLED=true only for controlled E2E",
  });
}
