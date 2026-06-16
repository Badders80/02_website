"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { KycBanner } from "@/components/KycBanner";
import { getHoldings, getHlts, getContent } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

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

export default function MyStablePage() {
  const { user, loading: authLoading, kycStatus } = useAuth();
  
  const [holdings, setHoldings] = useState<HoldingRecord[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, Campaign>>({});
  const [updates, setUpdates] = useState<ContentUpdate[]>([]);
  
  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const MOCK_HOLDING: HoldingRecord = {
    id: "mock-holding-1",
    hlt_id: "mock-hlt-id",
    horse_microchip: "982000123456789",
    shares_owned: 1,
    percentage_owned: 1.0,
    purchase_price_cents: 150000,
    status: "paid",
    created_at: new Date().toISOString(),
  };

  const MOCK_CAMPAIGN: Campaign = {
    id: "mock-hlt-id",
    shares_total: 100,
    share_price_cents: 150000,
    horse_microchip: "982000123456789",
    horse: {
      name: "Prudentia",
      age: 3,
      sex: "Mare",
      colour: "Bay",
      sire_name: "Proisir (AUS)",
      dam_name: "Prudent (NZ)",
      image_url: "/updates/prudentia_te_rapa_may30.jpg"
    },
    trainer: {
      name: "Mark Walker",
      stable_name: "Te Akau Racing",
      location: "Matamata, NZ"
    }
  };

  const MOCK_UPDATE: ContentUpdate = {
    id: "mock-update-1",
    content_type: "text",
    horse_microchip: "982000123456789",
    title: "Morning gallop on the sand",
    content_date: "2026-06-08",
    full_text: "Prudentia worked nicely over 1000m on the sand track this morning, pacing the last 400m in 24.2 seconds. Mark Walker reported she was relaxed and hit the line with plenty in reserve.",
    status: "published",
    horse_name: "Prudentia"
  };

  useEffect(() => {
    if (authLoading || !user) return;

    const loadDashboardData = async () => {
      setLoadingData(true);
      setErrorMsg("");
      try {
        let activeHoldings: HoldingRecord[] = [];
        const hltMap: Record<string, Campaign> = {};
        const allUpdates: ContentUpdate[] = [];

        const isBypass = process.env.NEXT_PUBLIC_BYPASS_STRIPE === "true" || process.env.NEXT_PUBLIC_BYPASS_AUTH_KYC === "true";

        if (isBypass) {
          activeHoldings = [MOCK_HOLDING];
          hltMap["mock-hlt-id"] = MOCK_CAMPAIGN;
          allUpdates.push(MOCK_UPDATE);
        } else {
          try {
            // 1. Fetch user's holdings
            const holdingsData = await getHoldings(user.uid);
            activeHoldings = (holdingsData || []).filter((h: any) => h.status === "paid");
          } catch (err) {
            console.error("Failed to fetch live holdings:", err);
            throw err;
          }

          if (activeHoldings.length > 0) {
            try {
              // 2. Fetch all resolved HLTs to map details
              const hltList = await getHlts({ resolve: true });
              hltList.forEach((hlt: Campaign) => {
                hltMap[hlt.id] = hlt;
              });
            } catch (err) {
              console.error("Failed to fetch live HLTs:", err);
              throw err;
            }

            // 3. Fetch campaign updates for owned horses
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
        
        // Sort updates by date descending
        allUpdates.sort((a, b) => new Date(b.content_date).getTime() - new Date(a.content_date).getTime());
        setUpdates(allUpdates);
      } catch (err: any) {
        console.error("Dashboard loading error:", err);
        setErrorMsg("Failed to load dashboard statistics. Please refresh the page.");
      } finally {
        setLoadingData(false);
      }
    };

    loadDashboardData();
  }, [user, authLoading]);

  // Aggregate stats
  const totalInvestmentCents = holdings.reduce((sum, h) => sum + h.purchase_price_cents, 0);
  const totalInvestmentNzd = totalInvestmentCents / 100;
  // Mock indicative returns (e.g. 8.2% ROI placeholder for premium look)
  const indicativeReturnsNzd = totalInvestmentNzd > 0 ? totalInvestmentNzd * 0.082 : 0;
  const totalValueNzd = totalInvestmentNzd + indicativeReturnsNzd;

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white/40 text-sm font-light">Verifying session...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-black text-foreground font-sans flex items-center justify-center pt-24 px-6">
          <div className="max-w-md w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-[#d4a964]/10 border border-[#d4a964]/20 flex items-center justify-center mx-auto text-xl">
              🔑
            </div>
            <div>
              <h3 className="text-xl font-light text-white mb-2">Sign In Required</h3>
              <p className="text-sm font-light text-white/50 leading-relaxed">
                Please log in to your account to view your ownership stakes, track race results, and listen to trainer logs.
              </p>
            </div>
            <Link
              href="/auth/login?redirect=/mystable"
              className="block w-full text-center py-3 rounded-full text-[11px] font-medium uppercase tracking-widest bg-white text-black hover:bg-white/90 transition-all duration-300"
            >
              Sign In to Your Stable
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-foreground font-sans selection:bg-white/10 selection:text-white">
        {/* Header */}
        <section className="pt-40 pb-16 px-12 md:px-16 lg:px-20 max-w-6xl mx-auto">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-6">
            Evolution Stables
          </p>
          <h1 className="text-[36px] md:text-[48px] font-light tracking-tight text-white mb-6 leading-[1.1]">
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

        {/* Dashboard Grid */}
        <section className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto pb-24">
          {errorMsg && (
            <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 mb-8 text-center text-sm font-light text-red-400">
              {errorMsg}
            </div>
          )}

          {loadingData ? (
            <div className="text-center py-20 text-white/30 text-sm font-light">Loading holdings and update timelines...</div>
          ) : holdings.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center space-y-6">
              <p className="text-lg font-light text-white/60">No active ownership stakes found</p>
              <p className="text-sm font-light text-white/40 max-w-md mx-auto leading-relaxed">
                You haven't acquired any racehorse units yet. Head over to our marketplace to browse open syndicates and start your ownership journey.
              </p>
              <Link
                href="/marketplace"
                className="inline-block rounded-full bg-white text-black px-8 py-3 text-[11px] font-medium uppercase tracking-widest hover:bg-white/90 transition-colors"
              >
                Go to Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              {/* Left & Middle Column: My Horses & Updates Feed */}
              <div className="lg:col-span-2 space-y-12">
                {/* Active Horses List */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-[20px] font-light text-white mb-1">My Horses</h2>
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
                          className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all duration-300"
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                            <div className="flex gap-4 items-center">
                              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/[0.06] overflow-hidden relative flex-shrink-0">
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
                                <h3 className="text-md font-medium text-white group-hover:text-[#d4a964] transition-colors">
                                  {horse?.name || "Racehorse"}
                                </h3>
                                <p className="text-xs text-white/40 mt-0.5">
                                  {horse?.sex || "N/A"} · Trainer: {trainer?.name || "Unassigned"}
                                </p>
                              </div>
                            </div>
                            <div className="flex sm:text-right flex-row sm:flex-col justify-between sm:justify-start gap-4">
                              <div>
                                <p className="text-xs text-white/30 uppercase tracking-wider">Stake</p>
                                <p className="text-sm font-semibold text-white">{holding.percentage_owned}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-white/30 uppercase tracking-wider">Acquisition</p>
                                <p className="text-sm font-semibold text-white">
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

                {/* Campaign Updates Storytelling Feed */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-[20px] font-light text-white mb-1">Stable Logs & Feed</h2>
                    <p className="text-xs font-light text-white/40">Behind-the-scenes logs, workout recordings, and trial reviews</p>
                  </div>

                  {updates.length === 0 ? (
                    <div className="rounded-xl border border-white/[0.06] p-8 text-center text-xs font-light text-white/40">
                      No stable logs posted yet. Check back later for morning trackwork recordings.
                    </div>
                  ) : (
                    <div className="space-y-8 relative border-l border-white/[0.08] pl-6 ml-3">
                      {updates.map((update) => (
                        <div key={update.id} className="relative space-y-3">
                          {/* Timeline Dot */}
                          <span className="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-[#d4a964] ring-4 ring-black" />
                          
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[10px] font-medium uppercase tracking-wider text-[#d4a964]">
                                {update.horse_name}
                              </span>
                              <h4 className="text-md font-medium text-white mt-1">
                                {update.title}
                              </h4>
                            </div>
                            <span className="text-xs font-light text-white/30 whitespace-nowrap">
                              {update.content_date}
                            </span>
                          </div>

                          <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 text-xs font-light text-white/60 leading-relaxed max-w-xl">
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
                {/* Total Value */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-1">
                  <p className="text-[11px] font-light tracking-wider uppercase text-white/30">Total Valuation</p>
                  <p className="text-[28px] font-light text-white">${totalValueNzd.toLocaleString(undefined, {maximumFractionDigits: 0})} NZD</p>
                  <p className="text-xs text-[#21B981] font-light">+8.2% ROI (indicative)</p>
                </div>
 
                {/* Total Returns */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-1">
                  <p className="text-[11px] font-light tracking-wider uppercase text-white/30">Stakes Earnings</p>
                  <p className="text-[28px] font-light text-[#21B981]">${indicativeReturnsNzd.toLocaleString(undefined, {maximumFractionDigits: 0})} NZD</p>
                  <p className="text-xs text-white/30 font-light">Accumulating prize dividends</p>
                </div>

                {/* Quick Links */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
                  <p className="text-[11px] font-light tracking-wider uppercase text-white/30">Registry Actions</p>
                  <div className="space-y-3 text-xs font-light text-white/60">
                    <Link href="/marketplace" className="block hover:text-white transition">
                      Browse Open Campaigns →
                    </Link>
                    <Link href="/stables" className="block hover:text-white transition">
                      View Trainer Stable Yards →
                    </Link>
                    <a href="/docs/sa" className="block hover:text-white transition">
                      Standard Syndicate Agreements →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
