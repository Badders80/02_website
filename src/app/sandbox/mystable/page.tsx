"use client";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { KycBanner } from "@/components/KycBanner";
import { getHoldings, getHlts, getContent } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
    horse_microchip: "982000123456789",
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
    horse_microchip: "982000123456789",
    horse: {
      name: "Prudentia",
      age: 4,
      sex: "Mare",
      colour: "Bay",
      sire_name: "Proisir (AUS)",
      dam_name: "Little Bit Irish (NZ)",
      image_url: "/updates/prudentia_te_rapa_may30.jpg"
    },
    trainer: {
      name: "Lance O'Sullivan",
      stable_name: "Wexford Stables",
      location: "Matamata, NZ"
    }
  };

  const MOCK_UPDATE: ContentUpdate = {
    id: "mock-update-1",
    content_type: "text",
    horse_microchip: "982000123456789",
    title: "Morning gallop on the sand",
    content_date: "2026-06-08",
    full_text: "Prudentia worked nicely over 1000m on the sand track this morning, pacing the last 400m in 24.2 seconds. Wexford Stables reported she was relaxed and hit the line with plenty in reserve.",
    status: "published",
    horse_name: "Prudentia"
  };

  const loadDashboardData = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoadingData(true);
    }
    setErrorMsg("");
    try {
      let activeHoldings: HoldingRecord[] = [];
      const hltMap: Record<string, Campaign> = {};
      const allUpdates: ContentUpdate[] = [];

      const isBypass = process.env.NEXT_PUBLIC_BYPASS_STRIPE === "true" || process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";

      if (isBypass) {
        activeHoldings = [MOCK_HOLDING];
        hltMap["prudentia"] = MOCK_CAMPAIGN;
        allUpdates.push(MOCK_UPDATE);
      } else {
        try {
          // 1. Fetch user's holdings
          const holdingsData = await getHoldings(user!.uid);
          activeHoldings = (holdingsData || []).filter((h: any) => h.status === "paid");
        } catch (err) {
          console.error("Failed to fetch live holdings:", err);
          throw err;
        }

        // 2. Fetch all campaigns to resolve info
        try {
          const hltList = await getHlts({ resolve: true });
          (hltList || []).forEach((hlt: Campaign) => {
            hltMap[hlt.id] = hlt;
          });
        } catch (err) {
          console.error("Failed to fetch live HLTs:", err);
          throw err;
        }

        // 3. Fetch updates for holdings
        if (activeHoldings.length > 0) {
          for (const holding of activeHoldings) {
            const horseHlt = hltMap[holding.hlt_id];
            const horseName = horseHlt?.horse?.name || "Racehorse";
            
            try {
              const horseUpdates = await getContent({
                horse_microchip: holding.horse_microchip,
                status: "published",
              });
              
              if (horseUpdates && horseUpdates.length > 0) {
                horseUpdates.forEach((up: any) => {
                  allUpdates.push({
                    ...up,
                    horse_name: horseName,
                  });
                });
              }
            } catch (err) {
              console.warn(`Failed to fetch updates for horse ${holding.horse_microchip}:`, err);
            }
          }
        }
      }

      setHoldings(activeHoldings);
      setCampaigns(hltMap);
      allUpdates.sort((a, b) => new Date(b.content_date).getTime() - new Date(a.content_date).getTime());
      setUpdates(allUpdates);

      // If holdings are successfully loaded, turn off settling latency flag
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
    
    // If the user redirected with ?success=true but the holdings query returned empty, trigger settlement state
    if (isSuccessRedirect && holdings.length === 0 && !loadingData && settlingAttempts < 5) {
      setIsSettling(true);
      const timer = setTimeout(() => {
        setSettlingAttempts(prev => prev + 1);
        loadDashboardData(false); // poll silently without full loading spinner
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
            Welcome, <span className="text-white font-normal">{user.email}</span>. This is your personal dashboard for managing active racehorse ownership, viewing pedigree charts, and tracking morning preparations.
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
                  We are registering your ownership stake on the digital ledger. This dashboard will update automatically.
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
                You haven't acquired any racehorse units yet. Head over to our marketplace to browse open syndicates and start your ownership journey.
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
                              <h4 className="text-xs font-medium text-white mt-1">
                                {update.title}
                              </h4>
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
                  <p className="text-2xl font-light text-white">${totalValueNzd.toLocaleString(undefined, {maximumFractionDigits: 0})} NZD</p>
                  <p className="text-[10px] text-emerald-400 font-light">+8.2% ROI (indicative)</p>
                </div>
 
                {/* Total Returns */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 space-y-2">
                  <p className="text-[10px] font-light tracking-wider uppercase text-white/30">Stakes Earnings</p>
                  <p className="text-2xl font-light text-emerald-400">${indicativeReturnsNzd.toLocaleString(undefined, {maximumFractionDigits: 0})} NZD</p>
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
