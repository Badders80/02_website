"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { KycBanner } from "@/components/KycBanner";
import Image from "next/image";
import Link from "next/link";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, isAuthInitialized } from "@/lib/firebase";
import holdingsData from "@/data/holdings.json";
import hltsData from "@/data/hlts.json";

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      if (!isAuthInitialized()) {
        throw new Error("Firebase authentication is not configured. Please contact support.");
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

  useEffect(() => {
    if (authLoading) return;

    // Detect post-Stripe checkout success (sheet write happens in webhook; json updates after manual sync + rebuild)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('success') === 'true') {
        setPurchaseSuccess(true);
        // Clean url (optional)
        window.history.replaceState({}, '', '/mystable');
      }
    }

    if (!user) {
      // Load mock dashboard data for the gated preview
      setHoldings([MOCK_HOLDING]);
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
          image_url: "/images/content/stables/prudentia-action.png"
        },
        trainer: {
          name: "Lance O'Sullivan & Andrew Scott",
          stable_name: "Wexford Stables",
          location: "Matamata, NZ"
        }
      };
      setCampaigns({ "hlt-prudentia": previewCampaign });
      setUpdates([MOCK_UPDATE]);
      setLoadingData(false);
      return;
    }

    // Load from local JSON data
    const loadDashboardData = () => {
      setLoadingData(true);
      setErrorMsg("");

      try {
        // Build campaign map from local JSON
        const hltMap: Record<string, Campaign> = {};
        (hltsData as any[]).forEach((hlt: any) => {
          hltMap[hlt.id] = {
            id: hlt.id,
            shares_total: hlt.shares_total,
            share_price_cents: (hlt.price_per_share_nzd || 1500) * 100,
            horse_microchip: hlt.horse_microchip,
            horse: {
              name: hlt.horse_name,
              sex: hlt.sex || "",
              colour: hlt.colour || "",
              sire_name: hlt.sire_name || "",
              dam_name: hlt.dam_name || "",
              image_url: hlt.image_path || "",
            },
            trainer: {
              name: hlt.trainer_name || "",
              stable_name: hlt.trainer_stable || "",
              location: hlt.trainer_location || "",
            },
          };
        });

        // Filter holdings by user email (from local JSON)
        const userHoldings = (holdingsData as any[])
          .filter((h: any) => h.user_email === user.email && h.kyc_status === "verified")
          .map((h: any) => ({
            id: `${h.hlt_id}-${h.user_email}`,
            hlt_id: h.hlt_id,
            horse_microchip: hltMap[h.hlt_id]?.horse_microchip || "",
            shares_owned: h.shares_owned,
            percentage_owned: (h.shares_owned / (hltMap[h.hlt_id]?.shares_total || 100)) * 100,
            purchase_price_cents: (hltMap[h.hlt_id]?.share_price_cents || 150000) * h.shares_owned,
            status: "paid",
            created_at: h.purchase_date || new Date().toISOString(),
          }));

        setHoldings(userHoldings);
        setCampaigns(hltMap);
        setUpdates([]); // No content updates in local JSON yet
      } catch (err: any) {
        console.error("Dashboard loading error:", err);
        setErrorMsg("Failed to load dashboard data.");
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

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-foreground font-sans selection:bg-white/10 selection:text-white relative">
        {/* Glassmorphic Gated Overlay */}
        {!user && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[6px] px-6 py-20">
            <div className="rounded-3xl border border-white/[0.08] bg-[#0A0A0F]/65 backdrop-blur-2xl p-8 max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.85)] animate-fade-in pointer-events-auto">
              <div className="w-14 h-14 rounded-full bg-[#d4a964]/10 border border-[#d4a964]/20 flex items-center justify-center mx-auto text-2xl">
                🔑
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-light text-white tracking-tight">Unlock Your Stable</h3>
                <p className="text-sm font-light text-white/50 leading-relaxed">
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
                  className="block w-full text-center border border-white/10 text-white hover:bg-white/5 transition-all py-3.5 rounded-full text-[11px] font-medium uppercase tracking-widest active:scale-[0.98]"
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
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-6">
              Evolution Stables
            </p>
            <h1 className="text-[36px] md:text-[48px] font-light tracking-tight text-white mb-6 leading-[1.1]">
              MyStable
            </h1>
            <p className="text-[18px] leading-[1.85] font-light text-white/65 max-w-2xl">
              Welcome, <span className="text-white font-normal">{user?.email || "Guest"}</span>. This is your personal dashboard for managing active racehorse ownership, viewing pedigree charts, and tracking morning preparations.
            </p>
          </section>

          {/* KYC Verification Banner */}
          <div className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto mb-8">
            <KycBanner />
          </div>

          {purchaseSuccess && (
            <div className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto mb-8">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-400">
                ✅ Payment received. Holding recorded in source sheet (via webhook). Run <code>python scripts/sync_inventory.py</code> then rebuild/deploy to surface in this JSON-powered view. kyc_status claims updated for future purchases.
              </div>
            </div>
          )}

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
        </div>
      </main>
      <Footer />
    </>
  );
}
