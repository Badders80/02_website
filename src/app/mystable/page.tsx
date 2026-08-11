"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { KycBanner } from "@/components/KycBanner";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import Image from "next/image";
import Link from "next/link";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, isAuthInitialized } from "@/lib/firebase";
import hltsData from "@/data/hlts.json";
import horsesData from "@/data/horses.json";

type DashboardTab = "overview" | "inbox" | "documents";

interface HoldingRecord {
  id: string;
  hlt_id: string;
  horse_microchip: string;
  shares_owned: number;
  /** % of campaign lots (shares_owned / shares_total * 100) */
  percentage_owned: number;
  purchase_price_cents: number;
  status: string;
  created_at: string;
}

function buildCampaignMap(): Record<string, Campaign> {
  const hltMap: Record<string, Campaign> = {};
  (hltsData as any[]).forEach((hlt: any) => {
    const key = hlt.horse_slug || hlt.id;
    const horse = (horsesData as any[]).find((h: any) => h.slug === key);
    hltMap[key] = {
      id: key,
      shares_total: Number(hlt.shares_total) || 0,
      share_price_cents: Number(hlt.price_per_share_nzd || 0) * 100,
      horse_microchip: hlt.horse_microchip,
      horse: {
        name: hlt.horse_name || horse?.name || "Racehorse",
        sex: horse?.sex || "",
        colour: horse?.colour || "",
        sire_name: horse?.sire_name || "",
        dam_name: horse?.dam_name || "",
        image_url: hlt.image_path || horse?.image_path || "",
      },
      trainer: {
        name: hlt.trainer_name || "",
        stable_name: hlt.trainer_stable || "",
        location: hlt.trainer_location || "",
      },
    };
  });
  return hltMap;
}

/** Map Sheets holdings → overview cards. Prefer actual purchase total NZD from sheet. */
function liveToHoldingRecords(
  live: LiveHolding[],
  hltMap: Record<string, Campaign>
): HoldingRecord[] {
  return live.map((h) => {
    const slug = h.horse_slug;
    const camp = hltMap[slug];
    const sharesTotal = camp?.shares_total || 0;
    const sharesOwned = Number(h.shares_owned) || 0;
    const paidNzd = Number(h.purchase_price_total_nzd);
    const priceCents =
      Number.isFinite(paidNzd) && paidNzd > 0
        ? Math.round(paidNzd * 100)
        : Math.round((camp?.share_price_cents || 0) * sharesOwned);
    const pct =
      sharesTotal > 0
        ? Math.round((sharesOwned / sharesTotal) * 10000) / 100
        : 0;
    return {
      id: h.purchase_id || `${slug}-${h.timestamp}`,
      hlt_id: slug,
      horse_microchip: camp?.horse_microchip || "",
      shares_owned: sharesOwned,
      percentage_owned: pct,
      purchase_price_cents: priceCents,
      status: "paid",
      created_at: h.timestamp || new Date().toISOString(),
    };
  });
}

interface Campaign {
  id: string;
  shares_total: number;
  share_price_cents: number;
  horse_microchip: string;
  horse?: {
    name: string;
    age?: number;
    sex: string;
    colour?: string;
    sire_name?: string;
    dam_name?: string;
    image_url?: string;
  };
  trainer?: {
    name: string;
    stable_name: string;
    location: string;
  };
}

interface ContentUpdate {
  id: string;
  content_type: string;
  horse_microchip: string;
  title: string;
  content_date: string;
  full_text: string;
  status: string;
  horse_name?: string;
}

interface LiveHolding {
  purchase_id: string;
  timestamp: string;
  user_email: string;
  horse_slug: string;
  shares_owned: number;
  purchase_price_total_nzd: number;
  signed_pds_url: string;
  signed_sa_url: string;
  kyc_status: string;
}

interface Communication {
  timestamp: string;
  recipient_email: string;
  subject: string;
  snippet: string;
  body_html: string;
  category: string;
}

const MOCK_HOLDING: HoldingRecord = {
  id: "mock-holding-1",
  hlt_id: "hlt-prudentia",
  horse_microchip: "985125000126462",
  shares_owned: 1,
  percentage_owned: 1.0,
  purchase_price_cents: 150000,
  status: "paid",
  created_at: new Date().toISOString(),
};

const MOCK_UPDATE: ContentUpdate = {
  id: "mock-update-1",
  content_type: "text",
  horse_microchip: "985125000126462",
  title: "Morning gallop on the sand",
  content_date: "2026-06-08",
  full_text: "Prudentia worked nicely over 1000m on the sand track this morning, pacing the last 400m in 24.2 seconds. Mark Walker reported she was relaxed and hit the line with plenty in reserve.",
  status: "published",
  horse_name: "Prudentia"
};

export default function MyStablePage() {
  const { user, loading: authLoading, kycStatus } = useAuth();

  const [holdings, setHoldings] = useState<HoldingRecord[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, Campaign>>({});
  const [updates, setUpdates] = useState<ContentUpdate[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // C7: Tab state
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Live holdings from Google Sheets (SSOT) — drives Overview + Documents
  const [liveHoldings, setLiveHoldings] = useState<LiveHolding[]>([]);
  const [liveHoldingsLoading, setLiveHoldingsLoading] = useState(false);
  const [liveHoldingsError, setLiveHoldingsError] = useState(false);

  // Communications from Google Sheets
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [communicationsLoading, setCommunicationsLoading] = useState(false);
  const [communicationsError, setCommunicationsError] = useState(false);
  const [expandedComm, setExpandedComm] = useState<string | null>(null);

  const applyLiveHoldings = useCallback(
    (rows: LiveHolding[], hltMap?: Record<string, Campaign>) => {
      const map = hltMap || buildCampaignMap();
      setLiveHoldings(rows);
      setHoldings(liveToHoldingRecords(rows, map));
    },
    []
  );

  const fetchLiveHoldings = useCallback(async () => {
    if (!user) return;
    setLiveHoldingsLoading(true);
    setLiveHoldingsError(false);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/holdings", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.holdings)) {
        applyLiveHoldings(data.holdings);
        setErrorMsg("");
      } else {
        setLiveHoldingsError(true);
        setErrorMsg(
          data?.code === "SHEETS_QUOTA"
            ? "Live holdings temporarily unavailable (data rate limit). Retry in a minute."
            : data?.error || "Could not load live holdings."
        );
      }
    } catch {
      setLiveHoldingsError(true);
      setErrorMsg("Could not load live holdings.");
    } finally {
      setLiveHoldingsLoading(false);
      setLoadingData(false);
    }
  }, [user, applyLiveHoldings]);

  const fetchCommunications = useCallback(async () => {
    if (!user) return;
    setCommunicationsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/communications", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setCommunications(data.communications || []);
      } else {
        setCommunicationsError(true);
      }
    } catch {
      setCommunicationsError(true);
    } finally {
      setCommunicationsLoading(false);
    }
  }, [user]);

  // Lazy-load inbox when tab opens
  useEffect(() => {
    if (!user) return;
    if (
      activeTab === "inbox" &&
      communications.length === 0 &&
      !communicationsError &&
      !communicationsLoading
    ) {
      fetchCommunications();
    }
  }, [
    activeTab,
    user,
    communications.length,
    communicationsError,
    communicationsLoading,
    fetchCommunications,
  ]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      if (!isAuthInitialized()) {
        throw new Error(
          "Firebase authentication is not configured. Please contact support."
        );
      }
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("[Google Sign-In] Error:", err);
      alert(err.message || "Google sign-in failed. Please try email sign-in.");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    const successParam =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("success") === "true";

    if (successParam) {
      setPurchaseSuccess(true);
      window.history.replaceState({}, "", "/mystable");
    }

    if (!user) {
      const previewCampaign: Campaign = {
        id: "hlt-prudentia",
        shares_total: 100,
        share_price_cents: 150000,
        horse_microchip: "985125000126462",
        horse: {
          name: "Prudentia",
          age: 4,
          sex: "Mare",
          colour: "Bay",
          sire_name: "Proisir (AUS)",
          dam_name: "Little Bit Irish (NZ)",
          image_url: "/images/content/stables/prudentia-action.png",
        },
        trainer: {
          name: "Lance O'Sullivan & Andrew Scott",
          stable_name: "Wexford Stables",
          location: "Matamata, NZ",
        },
      };
      setHoldings([MOCK_HOLDING]);
      setCampaigns({ "hlt-prudentia": previewCampaign });
      setUpdates([MOCK_UPDATE]);
      setLoadingData(false);
      setLiveHoldingsLoading(false);
      return;
    }

    // Logged-in: one stable load per user session change (avoid Strict Mode cancel storms)
    let stale = false;
    const loadDashboardData = async () => {
      setLoadingData(true);
      setLiveHoldingsLoading(true);
      setErrorMsg("");
      setLiveHoldingsError(false);
      try {
        const hltMap = buildCampaignMap();
        setCampaigns(hltMap);
        setUpdates([]);

        const token = await user.getIdToken();
        const res = await fetch("/api/holdings", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (stale) return;

        if (res.ok && Array.isArray(data.holdings)) {
          applyLiveHoldings(data.holdings, hltMap);
          if (successParam && data.holdings.length === 0) {
            // Webhook lag — single delayed retry
            window.setTimeout(() => {
              if (!stale) void fetchLiveHoldings();
            }, 2500);
          }
        } else {
          setLiveHoldingsError(true);
          setHoldings([]);
          setLiveHoldings([]);
          setErrorMsg(
            data?.code === "SHEETS_QUOTA"
              ? "Live holdings temporarily unavailable (data rate limit). Wait ~1 min and refresh."
              : data?.error ||
                  "Could not load live holdings. Refresh or try again shortly."
          );
        }
      } catch (err: any) {
        console.error("Dashboard loading error:", err);
        if (!stale) {
          setErrorMsg("Failed to load dashboard data.");
          setLiveHoldingsError(true);
        }
      } finally {
        // Always clear spinners for this run; stale runs must not leave UI stuck
        setLiveHoldingsLoading(false);
        setLoadingData(false);
      }
    };

    void loadDashboardData();
    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-load when auth identity changes
  }, [user?.uid, authLoading]);

  // Aggregate stats
  const totalInvestmentCents = holdings.reduce((sum, h) => sum + h.purchase_price_cents, 0);
  const totalInvestmentNzd = totalInvestmentCents / 100;

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-canvas text-foreground font-sans selection:bg-white/10 selection:text-pure-white relative">
        {/* Glassmorphic Gated Overlay */}
        {!user && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-canvas/45 backdrop-blur-[6px] px-6 py-20">
            <div className="rounded-3xl border border-border bg-[#0A0A0F]/65 backdrop-blur-2xl p-8 max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.85)] animate-fade-in pointer-events-auto">
              <div className="w-14 h-14 rounded-full bg-[#d4a964]/10 border border-[#d4a964]/20 flex items-center justify-center mx-auto text-2xl">
                🔑
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-light text-heading tracking-tight">Unlock Your Stable</h3>
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  Log in to manage active holdings, track real-time equine valuations, and listen to morning preparations at Wexford Stables.
                </p>
              </div>
              
              <div className="space-y-4 pt-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 rounded-full bg-white text-gray-900 font-medium py-3.5 px-4 transition-all duration-200 hover:bg-white/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {googleLoading ? "Signing in..." : "Continue with Google"}
                </button>
                
                <Link
                  href="/auth/login?redirect=/mystable"
                  className="block w-full text-center border border-white/10 text-pure-white hover:bg-white/5 transition-all py-3.5 rounded-full text-[11px] font-medium uppercase tracking-widest active:scale-[0.98]"
                >
                  Sign In with Email
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className={!user ? "blur-[12px] pointer-events-none select-none opacity-45 transition-all duration-700" : "transition-all duration-700"}>
          {/* Header */}
          <section className="pt-40 pb-16 px-12 md:px-16 lg:px-20 max-w-6xl mx-auto">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Evolution Stables
            </p>
            <h1 className="text-[36px] md:text-[48px] font-light tracking-tight text-heading mb-6 leading-[1.1]">
              MyStable
            </h1>
            <p className="text-[18px] leading-[1.85] font-light text-pure-white/65 max-w-2xl">
              Welcome, <span className="text-pure-white font-normal">{user?.email || "Guest"}</span>. This is your personal dashboard for managing active racehorse ownership, viewing pedigree charts, and tracking morning preparations.
            </p>
          </section>

          {/* Onboarding Flow Tracker (replaces KycBanner — includes KYC step) */}
          <OnboardingFlow hasHoldings={holdings.length > 0} />

          {purchaseSuccess && (
            <div className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto mb-8">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-200/90 space-y-2">
                <p className="font-medium text-emerald-300">
                  ✅ Payment received
                </p>
                <p className="font-light text-emerald-200/70">
                  Your holding is loaded from live inventory. If it is not listed
                  yet, wait a few seconds and refresh — fulfilment runs after
                  Stripe confirms payment.
                </p>
                <button
                  type="button"
                  onClick={() => void fetchLiveHoldings()}
                  className="text-[11px] uppercase tracking-wider text-accent hover:text-pure-white transition"
                >
                  Refresh holdings
                </button>
              </div>
            </div>
          )}

          {/* C7: Tab Navigation */}
          <div className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto mb-8">
            <div className="flex gap-1 border-b border-border">
              {([
                { key: "overview", label: "Overview" },
                { key: "inbox", label: "Investor Inbox" },
                { key: "documents", label: "Documents" },
              ] as { key: DashboardTab; label: string }[]).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-[12px] font-medium uppercase tracking-widest border-b-2 transition-all ${
                    activeTab === tab.key
                      ? "border-[#d4a964] text-pure-white"
                      : "border-transparent text-muted-foreground hover:text-frost"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

        {/* C7: Investor Inbox Tab */}
        {activeTab === "inbox" && (
          <section className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto pb-24">
            <div className="space-y-6">
              <div>
                <h2 className="text-[20px] font-light text-heading mb-1">Investor Inbox</h2>
                <p className="text-xs font-light text-muted-foreground">Communications from Evolution Stables — welcome messages, syndicate notices, and monthly updates</p>
              </div>

              {communicationsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d4a964]" />
                </div>
              ) : communicationsError ? (
                <div className="rounded-xl border border-border p-8 text-center text-xs font-light text-muted-foreground">
                  Unable to load communications. Please check back later.
                </div>
              ) : communications.length === 0 ? (
                <div className="rounded-xl border border-border p-8 text-center text-xs font-light text-muted-foreground">
                  No communications yet. You will receive a welcome message here after your first acquisition.
                </div>
              ) : (
                <div className="space-y-8 relative border-l border-border pl-6 ml-3">
                  {communications.map((comm, idx) => {
                    const key = `${comm.timestamp}-${idx}`;
                    const isExpanded = expandedComm === key;
                    return (
                      <div key={key} className="relative space-y-3">
                        <span className="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-[#d4a964] ring-4 ring-black" />
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-medium uppercase tracking-wider text-accent">
                                {comm.category || "notice"}
                              </span>
                              <span className="text-xs font-light text-muted-foreground">
                                {new Date(comm.timestamp).toLocaleDateString("en-NZ", { year: "numeric", month: "short", day: "numeric" })}
                              </span>
                            </div>
                            <h4 className="text-md font-medium text-heading mt-1">{comm.subject}</h4>
                            {!isExpanded && comm.snippet && (
                              <p className="text-xs font-light text-muted-foreground mt-1">{comm.snippet}</p>
                            )}
                          </div>
                        </div>
                        {comm.body_html && (
                          <button
                            type="button"
                            onClick={() => setExpandedComm(isExpanded ? null : key)}
                            className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-frost transition"
                          >
                            {isExpanded ? "Collapse" : "Read more"}
                          </button>
                        )}
                        {isExpanded && comm.body_html && (
                          <div
                            className="rounded-xl border border-border bg-surface-base p-4 text-xs font-light text-frost leading-relaxed max-w-xl prose prose-invert"
                            dangerouslySetInnerHTML={{ __html: comm.body_html }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* C7: Documents Tab */}
        {activeTab === "documents" && (
          <section className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto pb-24">
            <div className="space-y-6">
              <div>
                <h2 className="text-[20px] font-light text-heading mb-1">Documents</h2>
                <p className="text-xs font-light text-muted-foreground">Your signed agreements and disclosure documents</p>
              </div>

              {liveHoldingsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d4a964]" />
                </div>
              ) : liveHoldingsError ? (
                <div className="rounded-xl border border-border p-8 text-center space-y-4">
                  <p className="text-xs font-light text-muted-foreground">Unable to load live holdings data. Data may be delayed.</p>
                  <button
                    type="button"
                    onClick={() => void fetchLiveHoldings()}
                    className="text-[11px] uppercase tracking-wider text-accent hover:text-pure-white transition"
                  >
                    Retry
                  </button>
                </div>
              ) : liveHoldings.length === 0 ? (
                <div className="rounded-xl border border-border p-8 text-center text-xs font-light text-muted-foreground">
                  No holdings found. Your documents will appear here after your first acquisition.
                </div>
              ) : (
                <div className="space-y-4">
                  {liveHoldings.map((h) => {
                    const hlt = (hltsData as any[]).find((x) => (x.horse_slug || x.id) === h.horse_slug);
                    const horseName = hlt?.horse_name || h.horse_slug;
                    const hasDocs = h.signed_pds_url || h.signed_sa_url;
                    return (
                      <div
                        key={h.purchase_id}
                        className="rounded-xl border border-border bg-surface-base p-6 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-md font-medium text-heading">{horseName}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {h.shares_owned} shares · ${(h.purchase_price_total_nzd || 0).toLocaleString()} NZD
                            </p>
                          </div>
                          {!hasDocs && (
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-white/10 rounded-full px-3 py-1">
                              Documents processing
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Product Disclosure Statement</p>
                            {h.signed_pds_url ? (
                              <a
                                href={h.signed_pds_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-accent hover:underline"
                              >
                                View PDS ↗
                              </a>
                            ) : (
                              <p className="text-xs text-muted-foreground">Pending</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Syndicate Agreement</p>
                            {h.signed_sa_url ? (
                              <a
                                href={h.signed_sa_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-accent hover:underline"
                              >
                                View SA ↗
                              </a>
                            ) : (
                              <p className="text-xs text-muted-foreground">Pending</p>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] font-light text-muted-foreground leading-relaxed pt-2 border-t border-border">
                          Acquired {new Date(h.timestamp).toLocaleDateString("en-NZ", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Dashboard Grid — Overview tab only */}
        {activeTab === "overview" && (
        <section className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto pb-24">
          {errorMsg && (
            <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 mb-8 text-center text-sm font-light text-red-400">
              {errorMsg}
            </div>
          )}

          {loadingData || liveHoldingsLoading ? (
            <div className="text-center py-20 text-muted-foreground text-sm font-light">Loading holdings and update timelines...</div>
          ) : holdings.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface-base p-16 text-center space-y-6">
              <p className="text-lg font-light text-frost">No active ownership stakes found</p>
              <p className="text-sm font-light text-muted-foreground max-w-md mx-auto leading-relaxed">
                {liveHoldingsError
                  ? "We could not reach live holdings. Try refresh, or check back shortly."
                  : "You haven\u2019t acquired any racehorse units yet. Head over to our marketplace to browse open syndicates and start your ownership journey."}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {liveHoldingsError && (
                  <button
                    type="button"
                    onClick={() => void fetchLiveHoldings()}
                    className="inline-block rounded-full border border-white/15 text-pure-white px-8 py-3 text-[11px] font-medium uppercase tracking-widest hover:bg-white/5 transition-colors"
                  >
                    Retry
                  </button>
                )}
                <Link
                  href="/marketplace"
                  className="inline-block rounded-full bg-white text-black px-8 py-3 text-[11px] font-medium uppercase tracking-widest hover:bg-white/90 transition-colors"
                >
                  Go to Marketplace
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              {/* Left & Middle Column: My Horses & Updates Feed */}
              <div className="lg:col-span-2 space-y-12">
                {/* Active Horses List */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-[20px] font-light text-heading mb-1">My Horses</h2>
                    <p className="text-xs font-light text-muted-foreground">Active bloodstock ownership in campaign</p>
                  </div>

                  <div className="space-y-4">
                    {holdings.map((holding) => {
                      const hlt = campaigns[holding.hlt_id];
                      const horse = hlt?.horse;
                      const trainer = hlt?.trainer;
                      
                      return (
                        <div
                          key={holding.id}
                          className="group relative rounded-xl border border-border bg-surface-base p-6 hover:bg-surface-base transition-all duration-300"
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                            <div className="flex gap-4 items-center">
                              <div className="w-12 h-12 rounded-xl bg-surface-base border border-border overflow-hidden relative flex-shrink-0">
                                {horse?.image_url ? (
                                  <Image
                                    src={horse.image_url}
                                    alt={horse.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-muted-foreground text-[9px] font-light">
                                    N/A
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-md font-medium text-heading group-hover:text-accent transition-colors">
                                  {horse?.name || "Racehorse"}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {horse?.sex || "N/A"} · Trainer: {trainer?.name || "Unassigned"}
                                </p>
                              </div>
                            </div>
                            <div className="flex sm:text-right flex-row sm:flex-col justify-between sm:justify-start gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Lots</p>
                                <p className="text-sm font-semibold text-pure-white">
                                  {holding.shares_owned}
                                  <span className="text-muted-foreground font-normal text-xs ml-1">
                                    ({holding.percentage_owned}% of campaign)
                                  </span>
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Acquisition</p>
                                <p className="text-sm font-semibold text-pure-white">
                                  $
                                  {(holding.purchase_price_cents / 100).toLocaleString(
                                    "en-NZ",
                                    { minimumFractionDigits: 0, maximumFractionDigits: 2 }
                                  )}{" "}
                                  NZD
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-border flex justify-between items-center">
                            <p className="text-[10px] text-muted-foreground">
                              Acquired{" "}
                              {new Date(holding.created_at).toLocaleDateString("en-NZ", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <Link
                              href={`/marketplace/${holding.hlt_id}`}
                              className="text-[11px] text-accent hover:text-pure-white transition"
                            >
                              View horse →
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Campaign Updates Storytelling Feed */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-[20px] font-light text-heading mb-1">Stable Logs & Feed</h2>
                    <p className="text-xs font-light text-muted-foreground">Behind-the-scenes logs, workout recordings, and trial reviews</p>
                  </div>

                  {updates.length === 0 ? (
                    <div className="rounded-xl border border-border p-8 text-center text-xs font-light text-muted-foreground">
                      No stable logs posted yet. Check back later for morning trackwork recordings.
                    </div>
                  ) : (
                    <div className="space-y-8 relative border-l border-border pl-6 ml-3">
                      {updates.map((update) => (
                        <div key={update.id} className="relative space-y-3">
                          {/* Timeline Dot */}
                          <span className="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-[#d4a964] ring-4 ring-black" />
                          
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[10px] font-medium uppercase tracking-wider text-accent">
                                {update.horse_name}
                              </span>
                              <h4 className="text-md font-medium text-heading mt-1">
                                {update.title}
                              </h4>
                            </div>
                            <span className="text-xs font-light text-muted-foreground whitespace-nowrap">
                              {update.content_date}
                            </span>
                          </div>

                          <div className="rounded-xl border border-border bg-surface-base p-4 text-xs font-light text-frost leading-relaxed max-w-xl">
                            {update.full_text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Financial Overview & Actions */}
              <div className="space-y-8">
                {/* Total Investment */}
                <div className="rounded-2xl border border-border bg-surface-base p-6 space-y-1">
                  <p className="text-[11px] font-light tracking-wider uppercase text-muted-foreground">Total Investment</p>
                  <p className="text-[28px] font-light text-pure-white">${totalInvestmentNzd.toLocaleString(undefined, {maximumFractionDigits: 0})} NZD</p>
                  <p className="text-xs text-muted-foreground font-light">Acquisition value across {holdings.length} {holdings.length === 1 ? "holding" : "holdings"}</p>
                </div>

                {/* Quick Links */}
                <div className="rounded-2xl border border-border bg-surface-base p-6 space-y-4">
                  <p className="text-[11px] font-light tracking-wider uppercase text-muted-foreground">Registry Actions</p>
                  <div className="space-y-3 text-xs font-light text-frost">
                    <Link href="/marketplace" className="block hover:text-pure-white transition">
                      Browse Open Campaigns →
                    </Link>
                    <Link href="/stables" className="block hover:text-pure-white transition">
                      View Trainer Stable Yards →
                    </Link>
                    <a href="/docs/sa" className="block hover:text-pure-white transition">
                      Standard Syndicate Agreements →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
        )}
        </div>
      </main>
      <Footer />
    </>
  );
}