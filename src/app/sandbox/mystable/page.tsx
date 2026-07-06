"use client";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { KycBanner } from "@/components/KycBanner";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import holdingsData from "@/data/holdings.json";
import hltsData from "@/data/hlts.json";
import horsesData from "@/data/horses.json";

interface HoldingRecord {
  id: string;
  hlt_id: string;
  horse_microchip: string;
  shares_owned: number;
  percentage_owned: number;
  purchase_price_cents: number;
  status: string;
  created_at: string;
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

function MyStableDashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const isSuccessRedirect = searchParams.get("success") === "true";

  const [holdings, setHoldings] = useState<HoldingRecord[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, Campaign>>({});
  const [updates, setUpdates] = useState<ContentUpdate[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Latency settlement state (Stripe webhook helper)
  const [isSettling, setIsSettling] = useState(false);
  const [settlingAttempts, setSettlingAttempts] = useState(0);

  const MOCK_HOLDING: HoldingRecord = {
    id: "mock-holding-1",
    hlt_id: "prudentia",
    horse_microchip: "985125000126462",
    shares_owned: 1,
    percentage_owned: 1.0,
    purchase_price_cents: 150000,
    status: "paid",
    created_at: new Date().toISOString(),
  };

  const MOCK_CAMPAIGN: Campaign = {
    id: "prudentia",
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

  const MOCK_UPDATE: ContentUpdate = {
    id: "mock-update-1",
    content_type: "text",
    horse_microchip: "985125000126462",
    title: "Morning gallop on the sand",
    content_date: "2026-06-08",
    full_text:
      "Prudentia worked nicely over 1000m on the sand track this morning, pacing the last 400m in 24.2 seconds. Wexford Stables reported she was relaxed and hit the line with plenty in reserve.",
    status: "published",
    horse_name: "Prudentia",
  };

  const buildCampaignMap = (): Record<string, Campaign> => {
    const map: Record<string, Campaign> = {};
    (hltsData as any[]).forEach((hlt: any) => {
      const key = hlt.horse_slug || hlt.id;
      const horse = (horsesData as any[]).find((h: any) => h.slug === key);
      map[key] = {
        id: key,
        shares_total: Number(hlt.shares_total),
        share_price_cents: Number(hlt.price_per_share_nzd || 1500) * 100,
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
    return map;
  };

  const loadDashboardData = (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoadingData(true);
    }
    setErrorMsg("");

    try {
      const isBypass =
        process.env.NEXT_PUBLIC_BYPASS_STRIPE === "true" ||
        process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";

      let activeHoldings: HoldingRecord[] = [];
      const hltMap = buildCampaignMap();
      const allUpdates: ContentUpdate[] = [];

      if (isBypass) {
        activeHoldings = [MOCK_HOLDING];
        hltMap["prudentia"] = MOCK_CAMPAIGN;
        allUpdates.push(MOCK_UPDATE);
      } else if (!user) {
        activeHoldings = [MOCK_HOLDING];
        hltMap["prudentia"] = MOCK_CAMPAIGN;
        allUpdates.push(MOCK_UPDATE);
      } else {
        // Load real holdings from local JSON by user email
        activeHoldings = (holdingsData as any[])
          .filter((h: any) => h.user_email === user.email)
          .map((h: any) => ({
            id: `${h.hlt_id}-${h.user_email}`,
            hlt_id: h.hlt_id,
            horse_microchip: hltMap[h.hlt_id]?.horse_microchip || "",
            shares_owned: Number(h.shares_owned),
            percentage_owned: (Number(h.shares_owned) / (hltMap[h.hlt_id]?.shares_total || 100)) * 100,
            purchase_price_cents:
              (hltMap[h.hlt_id]?.share_price_cents || 150000) * Number(h.shares_owned),
            status: "paid",
            created_at: h.purchase_date || new Date().toISOString(),
          }));
      }

      // Static mock update fallback when no live content file exists
      if (activeHoldings.length > 0) {
        allUpdates.push(MOCK_UPDATE);
      }

      setHoldings(activeHoldings);
      setCampaigns(hltMap);
      allUpdates.sort((a, b) => new Date(b.content_date).getTime() - new Date(a.content_date).getTime());
      setUpdates(allUpdates);

      if (activeHoldings.length > 0) {
        setIsSettling(false);
      }
    } catch (err: any) {
      console.error("Dashboard loading error:", err);
      setErrorMsg("Failed to load dashboard statistics. Please refresh the page.");
    } finally {
      if (showLoadingIndicator) {
        setLoadingData(false);
      }
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    loadDashboardData();
  }, [user, authLoading]);

  // Webhook polling latency recovery loop
  useEffect(() => {
    if (authLoading || !user) return;

    if (isSuccessRedirect && holdings.length === 0 && !loadingData && settlingAttempts < 5) {
      setIsSettling(true);
      const timer = setTimeout(() => {
        setSettlingAttempts((prev) => prev + 1);
        loadDashboardData(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (holdings.length > 0 || settlingAttempts >= 5) {
      setIsSettling(false);
    }
  }, [user, authLoading, isSuccessRedirect, holdings.length, loadingData, settlingAttempts]);

  // Aggregate Stats
  const totalInvestmentCents = holdings.reduce((sum, h) => sum + h.purchase_price_cents, 0);
  const totalInvestmentNzd = totalInvestmentCents / 100;
  // Restrained premium return rate ROI
  const indicativeReturnsNzd = totalInvestmentNzd > 0 ? totalInvestmentNzd * 0.082 : 0;
  const totalValueNzd = totalInvestmentNzd + indicativeReturnsNzd;

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white/30 text-xs font-light tracking-wider uppercase">Verifying session...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-black text-foreground font-sans flex items-center justify-center pt-24 px-6">
          <div className="max-w-md w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto text-lg text-white">
              🔒
            </div>
            <div>
              <h3 className="text-lg font-light text-white mb-2">Sign In Required</h3>
              <p className="text-xs font-light text-white/50 leading-relaxed">
                Please log in to your account to view your ownership stakes, track race results, and listen to trainer logs.
              </p>
            </div>
            <Link
              href="/auth/login?redirect=/sandbox/mystable"
              className="block w-full text-center py-3 rounded-full text-[11px] font-medium uppercase tracking-widest bg-white text-black hover:bg-white/90 transition-all duration-300"
            >
              Sign In to Your Stable
            </Link>
          </div>
        </main>
        <Footer minimal={true} />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-foreground font-sans pt-36 pb-24 selection:bg-white/10 selection:text-white">
        {/* Header */}
        <section className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto mb-10">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-6">
            Evolution Stables
          </p>
          <h1 className="text-[36px] md:text-[48px] font-light tracking-tight text-white mb-6 leading-tight">
            MyStable
          </h1>
          <p className="text-[18px] leading-[1.85] font-light text-white/65 max-w-2xl">
            Welcome, <span className="text-white font-normal">{user.email}</span>. This is your personal
            dashboard for managing active racehorse ownership, viewing pedigree charts, and tracking
            morning preparations.
          </p>
        </section>

        {/* KYC Verification Banner */}
        <div className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto mb-8">
          <KycBanner />
        </div>

        {/* Latency Settlement Notice (Limited Gold) */}
        {isSettling && (
          <div className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto mb-8 animate-fade-in">
            <div className="rounded-xl border border-[#d4a964]/20 bg-[#d4a964]/5 p-5 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-semibold text-white/95 uppercase tracking-wider">Settling Transaction</h4>
                <p className="text-xs font-light text-white/50 mt-1">
                  We are registering your ownership stake on the digital ledger. This dashboard will
                  update automatically.
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                <span className="text-[10px] text-white/35">Polling sync...</span>
                <div className="h-4 w-4 animate-spin rounded-full border border-t-transparent border-[#d4a964]" />
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <section className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto">
          {errorMsg && (
            <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4 mb-8 text-center text-xs font-light text-red-400">
              {errorMsg}
            </div>
          )}

          {loadingData ? (
            <div className="text-center py-20 text-white/30 text-xs font-light tracking-wider uppercase">
              Loading portfolio data...
            </div>
          ) : holdings.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-16 text-center space-y-6">
              <p className="text-md font-light text-white/60">No active ownership stakes found</p>
              <p className="text-xs font-light text-white/40 max-w-md mx-auto leading-relaxed">
                You haven't acquired any racehorse units yet. Head over to our marketplace to browse open
                syndicates and start your ownership journey.
              </p>
              <Link
                href="/sandbox/marketplace"
                className="inline-block rounded-full bg-white text-black px-8 py-3 text-[10px] font-medium uppercase tracking-widest hover:bg-white/90 transition-colors"
              >
                Go to Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              {/* Left Column: Holdings & Stable Feed */}
              <div className="lg:col-span-2 space-y-12">
                {/* Active Horses List */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-light text-white">My Horses</h2>
                    <p className="text-xs font-light text-white/40">Active bloodstock ownership in campaign</p>
                  </div>

                  <div className="space-y-4">
                    {holdings.map((holding) => {
                      const hlt = campaigns[holding.hlt_id];
                      const horse = hlt?.horse;
                      const trainer = hlt?.trainer;

                      return (
                        <div
                          key={holding.id}
                          className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.03] transition-all duration-300"
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div className="flex gap-4 items-center">
                              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-white/[0.06] overflow-hidden relative flex-shrink-0">
                                {horse?.image_url ? (
                                  <Image
                                    src={horse.image_url}
                                    alt={horse.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-white/20 text-[9px] font-light">
                                    N/A
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-white group-hover:text-[#d4a964] transition-colors duration-300">
                                  {horse?.name || "Racehorse"}
                                </h3>
                                <p className="text-[11px] text-white/40 mt-1">
                                  {horse?.sex || "N/A"} · Trainer: {trainer?.name || "Unassigned"}
                                </p>
                              </div>
                            </div>
                            <div className="flex sm:text-right flex-row sm:flex-col justify-between sm:justify-start gap-4">
                              <div>
                                <p className="text-[9px] text-white/30 uppercase tracking-wider">Stake</p>
                                <p className="text-xs font-medium text-white">{holding.percentage_owned}%</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-white/30 uppercase tracking-wider">Acquisition</p>
                                <p className="text-xs font-medium text-white">
                                  ${(holding.purchase_price_cents / 100).toLocaleString()} NZD
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline Feed */}
                <div className="space-y-6 pt-2">
                  <div>
                    <h2 className="text-lg font-light text-white">Stable Logs & Feed</h2>
                    <p className="text-xs font-light text-white/40">Behind-the-scenes logs, workout recordings, and trial reviews</p>
                  </div>

                  {updates.length === 0 ? (
                    <div className="rounded-xl border border-white/[0.04] p-8 text-center text-xs font-light text-white/40">
                      No stable logs posted yet. Check back later for morning trackwork recordings.
                    </div>
                  ) : (
                    <div className="space-y-8 relative border-l border-white/[0.08] pl-6 ml-3">
                      {updates.map((update) => (
                        <div key={update.id} className="relative space-y-3">
                          {/* Timeline Dot (Gold Restrained Highlight) */}
                          <span className="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-[#d4a964] ring-4 ring-black" />

                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[9px] font-medium uppercase tracking-wider text-[#d4a964]">
                                {update.horse_name}
                              </span>
                              <h4 className="text-xs font-medium text-white mt-1">{update.title}</h4>
                            </div>
                            <span className="text-[10px] font-light text-white/30 whitespace-nowrap">
                              {update.content_date}
                            </span>
                          </div>

                          <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 text-xs font-light text-white/50 leading-relaxed max-w-xl">
                            {update.full_text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Financial Overview */}
              <div className="space-y-8">
                {/* Total Value */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 space-y-2">
                  <p className="text-[10px] font-light tracking-wider uppercase text-white/30">Total Valuation</p>
                  <p className="text-2xl font-light text-white">
                    ${totalValueNzd.toLocaleString(undefined, { maximumFractionDigits: 0 })} NZD
                  </p>
                  <p className="text-[10px] text-emerald-400 font-light">+8.2% ROI (indicative)</p>
                </div>

                {/* Total Returns */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 space-y-2">
                  <p className="text-[10px] font-light tracking-wider uppercase text-white/30">Stakes Earnings</p>
                  <p className="text-2xl font-light text-emerald-400">
                    ${indicativeReturnsNzd.toLocaleString(undefined, { maximumFractionDigits: 0 })} NZD
                  </p>
                  <p className="text-[10px] text-white/30 font-light">Accumulating prize dividends</p>
                </div>

                {/* Quick Links */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 space-y-4">
                  <p className="text-[10px] font-light tracking-wider uppercase text-white/30">Registry Actions</p>
                  <div className="space-y-3 text-xs font-light text-white/50">
                    <Link href="/sandbox/marketplace" className="block hover:text-white transition duration-300">
                      Browse Open Campaigns →
                    </Link>
                    <a href="/docs/sa" className="block hover:text-white transition duration-300">
                      Standard Syndicate Agreements →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer minimal={true} />
    </>
  );
}

export default function MyStableSandboxPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <MyStableDashboardContent />
    </Suspense>
  );
}
