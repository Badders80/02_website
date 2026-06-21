"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth, signInAnonymously } from "firebase/auth";

interface Campaign {
  id: string;
  location: string;
  pedigree: string;
  price: string;
  availability: string;
  is_active: boolean;
  horse: {
    name: string;
    image_url: string;
    story: string;
  };
  stats: {
    wins: string;
    placed: string;
    nextUp: string;
  };
}

interface ListingGridSandboxProps {
  initialCampaigns: Campaign[];
}

export function ListingGridSandbox({ initialCampaigns }: ListingGridSandboxProps) {
  const [filter, setFilter] = useState<"all" | "active" | "subscribed">("all");
  
  // Sandbox Control States
  const [accent, setAccent] = useState<"gold" | "emerald" | "ice" | "grayscale">("gold");
  const [hoverEffect, setHoverEffect] = useState<"parallax" | "glow" | "minimal">("parallax");
  const [glowPosition, setGlowPosition] = useState<"inside" | "outside">("inside");
  const [showProgress, setShowProgress] = useState(true);

  const filteredCampaigns = initialCampaigns.filter((camp) => {
    if (filter === "active") return camp.is_active;
    if (filter === "subscribed") return !camp.is_active;
    return true;
  });

  const getDetailPath = (id: string) => {
    return `/sandbox/marketplace/${id}`;
  };

  const accentColors = {
    gold: {
      text: "text-[#d4a964]",
      border: "border-[#d4a964]/20",
      bg: "bg-[#d4a964]",
      glow: "rgba(212, 169, 100, 0.06)",
      underline: "bg-[#d4a964]"
    },
    emerald: {
      text: "text-emerald-400",
      border: "border-emerald-400/20",
      bg: "bg-emerald-400",
      glow: "rgba(52, 211, 153, 0.06)",
      underline: "bg-emerald-400"
    },
    ice: {
      text: "text-sky-400",
      border: "border-sky-400/20",
      bg: "bg-sky-400",
      glow: "rgba(56, 189, 248, 0.06)",
      underline: "bg-sky-400"
    },
    grayscale: {
      text: "text-zinc-200",
      border: "border-white/10",
      bg: "bg-white",
      glow: "rgba(255, 255, 255, 0.05)",
      underline: "bg-white"
    }
  };

  const activeAccent = accentColors[accent];

  const showFeatured = filter !== "subscribed" && filteredCampaigns.some((c) => c.is_active);
  const featuredCampaign = showFeatured ? filteredCampaigns.find((c) => c.is_active) : null;

  return (
    <div className="relative space-y-12 overflow-hidden">
      {/* Drifting Ambient Background Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -100, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute top-20 left-[10%] w-[500px] h-[500px] blur-[140px] rounded-full opacity-30`}
          style={{
            background: accent === "gold" ? "radial-gradient(circle, rgba(212,169,100,0.15) 0%, transparent 70%)" :
                        accent === "emerald" ? "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)" :
                        accent === "ice" ? "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)" :
                        "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)"
          }}
        />
        <motion.div 
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 80, -60, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-40 right-[15%] w-[600px] h-[600px] bg-white/[0.02] blur-[160px] rounded-full"
        />
      </div>

      {/* Control Panel Widget (Apple-style pill) */}
      <section className="relative z-10 max-w-6xl mx-auto px-12 md:px-16 lg:px-20">
        <div className="p-5 bg-white/[0.01] backdrop-blur-xl border border-white/[0.06] rounded-2xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-[11px] uppercase tracking-[0.25em] font-mono text-white/50">Sandbox Control Center</h4>
            <p className="text-[12px] font-light text-zinc-400">Configure visual themes and hover interactions in real-time.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            {/* Color Accent Selection */}
            <div className="flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Accent</span>
              <div className="flex bg-black/40 border border-white/[0.06] rounded-full p-0.5">
                {(["gold", "emerald", "ice", "grayscale"] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setAccent(color)}
                    className={`px-3 py-1 text-[9px] uppercase tracking-wider rounded-full transition-all duration-300 ${
                      accent === color ? `${activeAccent.bg} text-black font-semibold shadow-lg` : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Hover Effect Selection */}
            <div className="flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Effect</span>
              <div className="flex bg-black/40 border border-white/[0.06] rounded-full p-0.5">
                {(["parallax", "glow", "minimal"] as const).map((effect) => (
                  <button
                    key={effect}
                    onClick={() => setHoverEffect(effect)}
                    className={`px-3 py-1 text-[9px] uppercase tracking-wider rounded-full transition-all duration-300 ${
                      hoverEffect === effect ? "bg-white text-black font-semibold shadow-lg" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {effect}
                  </button>
                ))}
              </div>
            </div>

            {/* Glow Placement Selector */}
            <div className="flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">Glow</span>
              <div className="flex bg-black/40 border border-white/[0.06] rounded-full p-0.5">
                {(["inside", "outside"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setGlowPosition(pos)}
                    className={`px-3 py-1 text-[9px] uppercase tracking-wider rounded-full transition-all duration-300 ${
                      glowPosition === pos ? "bg-white text-black font-semibold shadow-lg" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Progress Bar */}
            <button
              onClick={() => setShowProgress(!showProgress)}
              className={`px-4 py-1.5 rounded-full border text-[9px] uppercase tracking-wider font-medium transition-all duration-300 ${
                showProgress ? `${activeAccent.border} ${activeAccent.text} bg-white/[0.02]` : "border-white/10 text-white/40 hover:text-white/60"
              }`}
            >
              Progress: {showProgress ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </section>

      {/* Filter Navigation */}
      <div className="relative z-10 flex justify-start border-b border-white/[0.04] pb-4 gap-8 max-w-6xl mx-auto px-12 md:px-16 lg:px-20 select-none">
        {(["all", "active", "subscribed"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-all duration-300 relative py-1 cursor-pointer ${
              filter === tab
                ? activeAccent.text
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {tab === "all" ? "All Offerings" : tab === "active" ? "Open Stakes" : "Fully Subscribed"}
            {filter === tab && (
              <motion.span 
                layoutId="activeTabUnderline"
                className={`absolute bottom-0 left-0 right-0 h-[1.5px] ${activeAccent.underline}`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Campaigns Listing Stack */}
      <section className="relative z-10 px-12 md:px-16 lg:px-20 max-w-6xl mx-auto pb-32 space-y-8">
        <AnimatePresence mode="popLayout">
          {filteredCampaigns.map((camp) => {
            const isFeatured = featuredCampaign && camp.id === featuredCampaign.id;
            return (
              <motion.div
                key={camp.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <InteractiveCard 
                  camp={camp} 
                  isFeatured={!!isFeatured} 
                  hoverEffect={hoverEffect} 
                  activeAccent={activeAccent}
                  accent={accent}
                  glowPosition={glowPosition}
                  showProgress={showProgress}
                  getDetailPath={getDetailPath}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>
    </div>
  );
}

// Sub-component for cursor tracking, spring tilt, and glassmorphic glow
interface InteractiveCardProps {
  camp: Campaign;
  isFeatured: boolean;
  hoverEffect: "parallax" | "glow" | "minimal";
  activeAccent: {
    text: string;
    border: string;
    bg: string;
    glow: string;
    underline: string;
  };
  accent: "gold" | "emerald" | "ice" | "grayscale";
  glowPosition: "inside" | "outside";
  showProgress: boolean;
  getDetailPath: (id: string) => string;
}

function InteractiveCard({ 
  camp, 
  isFeatured, 
  hoverEffect, 
  activeAccent,
  accent,
  glowPosition,
  showProgress,
  getDetailPath 
}: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [isInside, setIsInside] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const lastOpacity = useRef(0);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const px = e.clientX;
      const py = e.clientY;

      const dx = Math.max(rect.left - px, 0, px - rect.right);
      const dy = Math.max(rect.top - py, 0, py - rect.bottom);
      const distance = Math.sqrt(dx * dx + dy * dy);

      const range = 80; // 80px distance active range for approach fade
      const newOpacity = Math.max(0, Math.min(1, 1 - distance / range));

      if (newOpacity > 0 || lastOpacity.current > 0) {
        setOpacity(newOpacity);
        setMousePos({ x: px - rect.left, y: py - rect.top });
        setIsInside(distance === 0);
        lastOpacity.current = newOpacity;
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  // Compute card tilt angle only when cursor is inside the card
  useEffect(() => {
    if (!isInside) {
      setTilt({ x: 0, y: 0 });
    } else if (hoverEffect === "parallax" && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = -(mousePos.y - centerY) / 35;
      const rotateY = (mousePos.x - centerX) / 45;
      setTilt({ x: rotateX, y: rotateY });
    }
  }, [mousePos, isInside, hoverEffect]);

  // KYC Apply to Own handler
  const handleApplyToOwn = async (hltId: string, horseName: string) => {
    try {
      const auth = getAuth();
      let user = auth.currentUser;
      if (!user) {
        const cred = await signInAnonymously(auth);
        user = cred.user;
      }
      const token = await user.getIdToken();

      const res = await fetch("/api/kyc/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.uid,
          email: user.email || "",
          hlt_id: hltId,
          horse_name: horseName,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "KYC failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No verification URL returned");
      }
    } catch (err: any) {
      console.error("KYC Apply failed:", err);
      alert(`Failed to start KYC: ${err.message}`);
    }
  };

  // Dynamic Styles
  const cardStyles = {
    transform: hoverEffect === "parallax" && isInside 
      ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.01, 1.01, 1.01)`
      : `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
    transition: isInside ? "transform 0.1s ease-out" : "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  if (isFeatured) {
    return (
      <div
        ref={cardRef}
        style={cardStyles}
        className={`group relative flex flex-col md:flex-row gap-8 md:gap-12 items-stretch rounded-3xl p-6 md:p-8 hover:shadow-[0_0_50px_rgba(255,255,255,0.01),0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-500 ${glowPosition === "inside" ? "overflow-hidden" : "overflow-visible"}`}
      >
        {/* 1. Outside Glow Backlight (Z-0) */}
        {glowPosition === "outside" && opacity > 0 && hoverEffect !== "minimal" && (
          <div 
            className="absolute -inset-8 pointer-events-none rounded-[2.5rem] blur-3xl z-0 transition-opacity duration-150"
            style={{
              background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, ${
                accent === "grayscale" ? "rgba(255, 255, 255, 0.15)" : activeAccent.glow.replace("0.06", "0.28").replace("0.05", "0.22")
              }, transparent 80%)`,
              opacity: opacity
            }}
          />
        )}

        {/* 2. Opaque Card BG (Z-10) */}
        <div 
          className={`absolute inset-0 rounded-3xl border transition-all duration-500 pointer-events-none z-10 ${
            opacity > 0 
              ? accent === "grayscale" ? "border-white/20" : "border-white/[0.08]" 
              : "border-white/[0.04]"
          } ${
            glowPosition === "outside" ? "bg-[#060606]" : "bg-[#060606]/90"
          }`}
        />

        {/* 3. Inside Glow Layer (Z-12) */}
        {glowPosition === "inside" && opacity > 0 && hoverEffect !== "minimal" && (
          <div 
            className="absolute inset-0 pointer-events-none rounded-3xl z-12 overflow-hidden"
            style={{
              background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${activeAccent.glow}, rgba(255, 255, 255, 0.005) 50%, transparent 100%)`,
              opacity: opacity
            }}
          />
        )}

        {/* 4. Inside Glow border highlight overlay (Z-13) */}
        {opacity > 0 && hoverEffect === "glow" && glowPosition === "inside" && (
          <div 
            className="absolute inset-0 pointer-events-none rounded-3xl border transition-all duration-500 z-13"
            style={{
              borderColor: "rgba(255, 255, 255, 0.08)",
              boxShadow: `inset 0 0 20px ${activeAccent.glow}`,
              opacity: opacity
            }}
          />
        )}

        {/* Media Column (Always on the Right) - Z-20 */}
        <Link
          href={getDetailPath(camp.id)}
          className="block w-full md:w-[60%] flex-shrink-0 md:order-last relative z-20"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/[0.04] bg-zinc-950">
            <Image
              src={camp.horse.image_url}
              alt={camp.horse.name}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover opacity-90 transition-transform duration-[2400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-hover:opacity-100"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 pointer-events-none" />
            
            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 select-none">
              <span className={`w-1.5 h-1.5 rounded-full ${
                accent === "gold" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : 
                accent === "emerald" ? "bg-emerald-400" : 
                accent === "ice" ? "bg-sky-400" : "bg-white"
              } animate-pulse`} />
              <span className="text-[8px] uppercase tracking-widest font-medium text-white/80">
                Open Stakes
              </span>
            </div>
          </div>
        </Link>

        {/* Text Column (Always on the Left) - Z-20 */}
        <div className="flex flex-col justify-end w-full md:w-[40%] py-2 pr-0 md:pr-6 md:order-first relative z-20">
          <div className="space-y-4 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
            <div className="space-y-1">
              <span className="text-[8px] uppercase tracking-[0.25em] font-mono text-zinc-500">Featured Campaign</span>
              <h3 className="text-[32px] md:text-[38px] font-light tracking-tight text-white leading-none">
                {camp.horse.name}
              </h3>
            </div>

            <p className="text-[14px] leading-[1.85] font-light text-zinc-400">
              {camp.horse.story}
            </p>

            {/* Sandbox progress bar (Gold/Emerald acquired indicator) */}
            {showProgress && (
              <div className="space-y-2 pt-2 transition-all duration-300">
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                  <span>Reserved: 23 units</span>
                  <span className={activeAccent.text}>77% Left</span>
                </div>
                <div className="h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "23%" }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full bg-gradient-to-r ${
                      accent === "gold" ? "from-[#d4a964]/60 to-[#d4a964]" : 
                      accent === "emerald" ? "from-emerald-400/60 to-emerald-400" : 
                      accent === "ice" ? "from-sky-400/60 to-sky-400" : 
                      "from-zinc-400 to-white"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Hover Stats Section */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-4 opacity-0 max-h-0 overflow-hidden pointer-events-none transition-all duration-[800ms] cubic-bezier(0.16,1,0.3,1) group-hover:opacity-100 group-hover:max-h-24 group-hover:pointer-events-auto">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-0.5">wins</p>
                <p className="text-[15px] font-medium text-white">{camp.stats.wins}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-0.5">placed</p>
                <p className="text-[15px] font-medium text-white">{camp.stats.placed}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">next up</p>
                <p className={`text-[13px] font-light ${activeAccent.text}`}>{camp.stats.nextUp}</p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex items-center gap-4">
            <Link
              href={getDetailPath(camp.id)}
              className={`inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase ${activeAccent.text} hover:text-white transition-colors duration-300`}
            >
              <span>Explore Offering</span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            {camp.is_active && (
              <button
                type="button"
                onClick={() => handleApplyToOwn(camp.id, camp.horse.name)}
                className="inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full transition-all duration-300"
              >
                Apply to Own
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Smaller Subscribed Horizontal Cards
  return (
    <div
      ref={cardRef}
      style={cardStyles}
      className={`group relative flex flex-col md:flex-row gap-6 md:gap-8 items-stretch rounded-3xl p-5 md:p-6 hover:shadow-[0_0_30px_rgba(255,255,255,0.01),0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-500 ${glowPosition === "inside" ? "overflow-hidden" : "overflow-visible"}`}
    >
      {/* 1. Outside Glow Backlight (Z-0) */}
      {glowPosition === "outside" && opacity > 0 && hoverEffect !== "minimal" && (
        <div 
          className="absolute -inset-6 pointer-events-none rounded-[2.2rem] blur-2xl z-0 transition-opacity duration-150"
          style={{
            background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${
              accent === "grayscale" ? "rgba(255, 255, 255, 0.12)" : activeAccent.glow.replace("0.06", "0.24").replace("0.05", "0.2")
            }, transparent 80%)`,
            opacity: opacity
          }}
        />
      )}

      {/* 2. Opaque Card BG (Z-10) */}
      <div 
        className={`absolute inset-0 rounded-3xl border transition-all duration-500 pointer-events-none z-10 ${
          opacity > 0 
            ? accent === "grayscale" ? "border-white/20" : "border-white/[0.06]" 
            : "border-white/[0.03]"
        } ${
          glowPosition === "outside" ? "bg-[#060606]" : "bg-[#060606]/90"
        }`}
      />

      {/* 3. Inside Glow Layer (Z-12) */}
      {glowPosition === "inside" && opacity > 0 && hoverEffect !== "minimal" && (
        <div 
          className="absolute inset-0 pointer-events-none rounded-3xl z-12 overflow-hidden"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${activeAccent.glow}, rgba(255, 255, 255, 0.005) 50%, transparent 100%)`,
            opacity: opacity
          }}
        />
      )}

      {/* Media Column (Always on the Right) - Z-20 */}
      <Link
        href={getDetailPath(camp.id)}
        className="block w-full md:w-[40%] flex-shrink-0 md:order-last relative z-20"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/[0.03] bg-zinc-950">
          <Image
            src={camp.horse.image_url}
            alt={camp.horse.name}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover opacity-90 transition-transform duration-[2400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 pointer-events-none" />
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span className="text-[8px] uppercase tracking-widest font-medium text-white/80">
              Subscribed
            </span>
          </div>
        </div>
      </Link>

      {/* Text Column (Always on the Left) - Z-20 */}
      <div className="flex flex-col justify-end w-full md:w-[60%] py-2 pr-0 md:pr-6 md:order-first relative z-20">
        <div className="space-y-3 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="space-y-0.5">
            <span className="text-[8px] uppercase tracking-[0.2em] font-mono text-zinc-500">Fully Subscribed</span>
            <h3 className="text-[24px] font-light tracking-tight text-white/90 leading-none transition-colors duration-300 group-hover:text-white">
              {camp.horse.name}
            </h3>
          </div>

          <p className="text-[13px] leading-[1.8] font-light text-zinc-400">
            {camp.horse.story}
          </p>

          {/* Sandbox progress bar for Subscribed campaign (always full/complete in accent colors) */}
          {showProgress && (
            <div className="space-y-1.5 pt-1 transition-all duration-300">
              <div className="flex justify-between text-[8px] font-mono uppercase tracking-wider text-zinc-600">
                <span>Completed</span>
                <span>100% Subscribed</span>
              </div>
              <div className="h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full bg-zinc-800 w-full" />
              </div>
            </div>
          )}
        </div>

        <div className="pt-5">
          <Link
            href={getDetailPath(camp.id)}
            className={`inline-flex items-center gap-2 text-[9px] font-medium tracking-[0.2em] uppercase ${activeAccent.text} hover:text-white transition-colors duration-300`}
          >
            <span>Explore Offering</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
