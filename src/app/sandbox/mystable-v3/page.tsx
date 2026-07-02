"use client";

import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

interface StartRecord {
  date: string;
  venue: string;
  class: string;
  dist: string;
  track: string;
  pos: string;
  jockey: string;
  margin: string;
  winner: string;
}

interface StoryUpdate {
  id: string;
  type: "audio" | "workout" | "paddock" | "race";
  title: string;
  date: string;
  location: string;
  excerpt: string;
  content: string;
  duration?: string;
  mediaUrl?: string;
  author: string;
  role: string;
}

export default function MyStableV3Page() {
  const [activeHorse, setActiveHorse] = useState<"prudentia" | "fantasy">("prudentia");
  const [activeTab, setActiveTab] = useState<"story" | "pedigree" | "form" | "documents">("story");
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);

  // Audio simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playingAudioId) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setPlayingAudioId(null);
            return 0;
          }
          return prev + 2;
        });
      }, 150);
    } else {
      setAudioProgress(0);
    }
    return () => clearInterval(interval);
  }, [playingAudioId]);

  const toggleAudio = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setAudioProgress(0);
      setPlayingAudioId(id);
    }
  };

  const starts: StartRecord[] = [
    { date: "26 Jun 2026", venue: "Tauranga", class: "R75 Benchmark", dist: "1400m", track: "Heavy 9", pos: "6 / 9", jockey: "M. Hashizume", margin: "4.59L", winner: "Rocking" },
    { date: "30 May 2026", venue: "Te Rapa", class: "R65 Benchmark", dist: "1400m", track: "Soft 7", pos: "1 / 12", jockey: "M. Hashizume", margin: "0.80L", winner: "Prudentia (2nd: Cork)" },
    { date: "10 May 2026", venue: "Ruakaka", class: "R65 Benchmark", dist: "1400m", track: "Good 4", pos: "4 / 11", jockey: "W. Kennedy", margin: "2.10L", winner: "Solid Impact" },
    { date: "17 Apr 2026", venue: "Te Rapa", class: "Maiden 1400", dist: "1400m", track: "Heavy 10", pos: "1 / 14", jockey: "M. Hashizume", margin: "1.50L", winner: "Prudentia (2nd: Irish)" },
    { date: "28 Mar 2026", venue: "Matamata", class: "Maiden 1200", dist: "1200m", track: "Soft 6", pos: "3 / 10", jockey: "C. Grylls", margin: "1.20L", winner: "Starlight Express" }
  ];

  const updates: StoryUpdate[] = [
    {
      id: "up-1",
      type: "audio",
      title: "Wexford trackwork gallop analysis & Tauranga plans",
      date: "28 Jun 2026",
      location: "Matamata Training Center",
      excerpt: "Co-trainer Andrew Scott provides a voice memo review of Prudentia's Tuesday morning work and strategy details.",
      content: "Prudentia worked on the course proper this morning under Masahiro Hashizume. The track conditions were testing, but she worked through her gears comfortably, finishing her last 400m in 24.8. We're on target for the Rating 75 Greerton 1400 next.",
      duration: "1:45",
      author: "Andrew Scott",
      role: "Co-Trainer, Wexford"
    },
    {
      id: "up-2",
      type: "race",
      title: "Te Rapa Win: Toughing it out in Benchmark 65",
      date: "30 May 2026",
      location: "Te Rapa Turf",
      excerpt: "Re-live the late surge where she dug deep on the inner rail to secure her second career victory.",
      content: "A magnificent ride by Hashizume. Settled midfield, tracked up behind the leaders on the corner, and displayed supreme resolve under pressure. Distribution of stakes payouts has been initiated.",
      mediaUrl: "/updates/prudentia_te_rapa_may30.jpg",
      author: "Wexford Racing Team",
      role: "Race Management"
    }
  ];

  return (
    <>
      {/* Load luxury variable web fonts dynamically */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
        
        .font-luxury-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }
        .font-luxury-sans {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .ease-premium-bezier {
          transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
        }
        .noise-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}} />

      <NavBar />
      
      <main className="min-h-screen bg-[#030303] text-[#f8fafc]/90 font-luxury-sans pt-36 pb-32 relative overflow-hidden">
        {/* Background Mesh Gradient Orbs */}
        <div className="absolute top-[-15%] left-[10%] w-[700px] h-[700px] rounded-full bg-[#d4a964]/[0.04] blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-emerald-500/[0.02] blur-[160px] pointer-events-none" />
        
        {/* Fine Noise Film Grain pseudo-element */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02] noise-overlay" />

        {/* Cinematic Macro Header */}
        <section className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto mb-16 animate-fade-in">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[9px] uppercase tracking-[0.25em] font-medium text-[#d4a964]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a964] animate-pulse" />
              Ownership Reimagined
            </span>
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/[0.08]">
              <div>
                <h1 className="text-[44px] md:text-[68px] font-light tracking-tight text-white leading-[1.05] font-luxury-serif">
                  MyStable <span className="text-white/20 font-extralight italic">V3</span>
                </h1>
                <p className="text-sm font-light text-white/50 max-w-xl mt-4 leading-relaxed">
                  A high-end tactile dashboard connecting fractional stakeholders to elite bloodstock, training logs, and regulatory leases.
                </p>
              </div>

              {/* Concentric Double-Bezel Portfolio overview pill */}
              <div className="p-1 rounded-[1.75rem] bg-white/[0.02] border border-white/[0.06] backdrop-blur-md shadow-2xl">
                <div className="rounded-[calc(1.75rem-0.25rem)] bg-[#0A0A0F] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-5 flex items-center gap-10">
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-widest text-white/30 font-mono">Portfolio Value</p>
                    <p className="text-xl font-light text-white">$1,642 NZD</p>
                  </div>
                  <div className="h-8 w-px bg-white/[0.08]" />
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-widest text-[#d4a964] font-mono">Active Units</p>
                    <p className="text-xl font-light text-[#d4a964]">1 Horse</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Double Column Bento Layout */}
        <section className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT PANEL: Horse Selector & Specs Bento Card (Colspan 4) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Concentric Double-Bezel Selector Container */}
            <div className="p-1.5 rounded-[2rem] bg-white/[0.02] border border-white/[0.06]">
              <div className="rounded-[calc(2rem-0.375rem)] bg-[#0A0A0F]/60 backdrop-blur-2xl border border-white/[0.08] p-6 space-y-6 shadow-xl">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">Select Bloodstock</h3>
                
                <div className="space-y-3">
                  {/* Selector Item: Prudentia */}
                  <button 
                    onClick={() => setActiveHorse("prudentia")}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-500 ease-premium-bezier flex items-center justify-between ${
                      activeHorse === "prudentia" 
                        ? "border-[#d4a964]/40 bg-[#d4a964]/5" 
                        : "border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 relative overflow-hidden">
                        <Image
                          src="/updates/prudentia_te_rapa_may30.jpg"
                          alt="Prudentia"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">PRUDENTIA</h4>
                        <p className="text-[10px] text-white/40 mt-0.5">4yo Mare · Wexford</p>
                      </div>
                    </div>
                    {activeHorse === "prudentia" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4a964] shadow-[0_0_8px_#d4a964]" />
                    )}
                  </button>

                  {/* Selector Item: Hottathanafantasy */}
                  <button 
                    onClick={() => setActiveHorse("fantasy")}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-500 ease-premium-bezier flex items-center justify-between ${
                      activeHorse === "fantasy" 
                        ? "border-[#d4a964]/40 bg-[#d4a964]/5" 
                        : "border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-3 opacity-40">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 relative overflow-hidden">
                        <Image
                          src="https://images.squarespace-cdn.com/content/v1/68b3a55795fa0517264bfda3/ecff499a-445a-4cf0-a746-29e763e5ec4c/5caf253b-5ed3-485a-a8ba-4e14cf8ecb73.JPG?format=750w"
                          alt="Hottathanafantasy"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">HOTTATHANAFANTASY</h4>
                        <p className="text-[10px] text-white/40 mt-0.5">2yo Filly · In Training</p>
                      </div>
                    </div>
                    {activeHorse === "fantasy" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4a964] shadow-[0_0_8px_#d4a964]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Concentric Double-Bezel Spec Specs */}
            <div className="p-1.5 rounded-[2rem] bg-white/[0.02] border border-white/[0.06]">
              <div className="rounded-[calc(2rem-0.375rem)] bg-[#0A0A0F]/60 backdrop-blur-2xl border border-white/[0.08] p-6 space-y-4 shadow-xl">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 border-b border-white/[0.06] pb-3">Syndicate Parameters</h3>
                
                <div className="space-y-3 text-xs font-light">
                  <div className="flex justify-between">
                    <span className="text-white/40">Lease Allocation</span>
                    <span className="text-white font-medium">100% Leasehold</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Upkeep Term</span>
                    <span className="text-white font-medium">18 Months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Lease Commenced</span>
                    <span className="text-white font-medium">2026-07-01</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Prize Distribution</span>
                    <span>80% Net Return</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Dynamic Story & Form timeline (Colspan 8) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Sliding Sub-Navigation Menu */}
            <div className="flex border-b border-white/[0.06] pb-px overflow-x-auto scrollbar-none gap-2">
              {[
                { label: "Stable Timeline", value: "story" },
                { label: "Bloodstock Pedigree", value: "pedigree" },
                { label: "NZTR Form Guide", value: "form" },
                { label: "Legal Agreements", value: "documents" }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as any)}
                  className={`pb-4 px-4 text-xs uppercase tracking-widest font-light transition-all duration-300 border-b-2 -mb-[2px] ease-premium-bezier whitespace-nowrap ${
                    activeTab === tab.value
                      ? "border-[#d4a964] text-[#d4a964] font-medium"
                      : "border-transparent text-white/40 hover:text-white/70"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENTS */}
            <div className="min-h-[400px]">
              
              {/* TIMELINE FEED */}
              {activeTab === "story" && (
                <div className="space-y-8">
                  {updates.map((update) => (
                    <div 
                      key={update.id}
                      className="p-1 rounded-[2rem] bg-white/[0.02] border border-white/[0.06] shadow-xl hover:scale-[1.005] transition-all duration-700 ease-premium-bezier"
                    >
                      <div className="rounded-[calc(2rem-0.25rem)] bg-[#0A0A0F]/65 border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-8 space-y-6">
                        {/* Upper Category Meta */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.04] text-[10px] font-mono text-white/35">
                          <span className="text-[#d4a964] uppercase tracking-wider">{update.type} entry</span>
                          <span className="font-light">{update.location} · {update.date}</span>
                        </div>

                        <div>
                          <h3 className="text-xl font-light text-white font-luxury-serif mb-2">{update.title}</h3>
                          <p className="text-sm font-light text-white/60 leading-relaxed">{update.excerpt}</p>
                        </div>

                        {/* Interactive Audio Player widget */}
                        {update.type === "audio" && (
                          <div className="p-1 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.06]">
                            <div className="rounded-[calc(1.5rem-0.125rem)] bg-black/40 border border-white/[0.08] p-4 flex items-center gap-4">
                              {/* Circle-in-Circle button architecture */}
                              <button 
                                onClick={() => toggleAudio(update.id)}
                                className="w-12 h-12 rounded-full bg-[#d4a964] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-500 ease-premium-bezier flex-shrink-0"
                              >
                                {playingAudioId === update.id ? (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                )}
                              </button>
                              
                              <div className="flex-1 space-y-1">
                                <div className="flex justify-between text-[9px] font-mono tracking-wider text-white/40">
                                  <span>TRAINER AUDIO VOICE MEMO</span>
                                  <span>{playingAudioId === update.id ? `${Math.floor(audioProgress / 60)}:${audioProgress % 60 < 10 ? '0' : ''}${audioProgress % 60} / ` + update.duration : update.duration}</span>
                                </div>
                                
                                {/* Soundwave Simulation */}
                                <div className="h-6 flex items-center gap-0.5 overflow-hidden w-full relative">
                                  {Array.from({ length: 48 }).map((_, i) => {
                                    const waveHeight = Math.sin(i * 0.3) * 6 + 10;
                                    const isActive = playingAudioId === update.id && (i / 48) * 100 <= audioProgress;
                                    return (
                                      <span 
                                        key={i}
                                        className="flex-1 rounded-full transition-colors duration-300"
                                        style={{
                                          height: `${waveHeight}px`,
                                          backgroundColor: isActive ? "#d4a964" : "rgba(255,255,255,0.08)"
                                        }}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {update.mediaUrl && (
                          <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video relative group">
                            <Image
                              src={update.mediaUrl}
                              alt={update.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                        )}

                        {/* Author signature footer */}
                        <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
                          <div className="w-7 h-7 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-mono text-white/60">
                            ST
                          </div>
                          <div className="text-[11px] font-light">
                            <span className="text-white/80 font-medium block">{update.author}</span>
                            <span className="text-white/40 block">{update.role}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PEDIGREE INTERACTIVE TREE */}
              {activeTab === "pedigree" && (
                <div className="p-1 rounded-[2rem] bg-white/[0.02] border border-white/[0.06] shadow-xl animate-fade-in">
                  <div className="rounded-[calc(2rem-0.25rem)] bg-[#0A0A0F]/65 border border-white/[0.08] p-8 space-y-8">
                    <div>
                      <h3 className="text-lg font-light text-white font-luxury-serif">Equine Pedigree Chart</h3>
                      <p className="text-xs text-white/45 font-light mt-1">Stakes-winning thoroughbred ancestors highlighted in gold.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 overflow-x-auto min-w-[600px]">
                      {/* Sire/Dam */}
                      <div className="space-y-6 flex flex-col justify-center">
                        <div className="border border-[#d4a964]/20 bg-[#d4a964]/5 rounded-2xl p-5">
                          <p className="text-[9px] uppercase tracking-wider text-[#d4a964] font-mono font-semibold">Sire</p>
                          <h4 className="text-sm font-semibold text-white mt-1">PROISIR (AUS)</h4>
                          <p className="text-[10px] text-white/40 mt-1">Champion Sire of Stakes Winners</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-5">
                          <p className="text-[9px] uppercase tracking-wider text-white/30 font-mono">Dam</p>
                          <h4 className="text-sm font-semibold text-white mt-1">LITTLE BIT IRISH (NZ)</h4>
                          <p className="text-[10px] text-white/40 mt-1">By O'Reilly (NZ)</p>
                        </div>
                      </div>

                      {/* Grandsires */}
                      <div className="space-y-4 flex flex-col justify-center text-xs">
                        <div className="border border-white/[0.06] bg-white/[0.01] rounded-xl p-4">
                          <p className="text-[8px] uppercase tracking-wider text-white/30 font-mono">Grandsire</p>
                          <h4 className="font-semibold text-white/80 mt-1">CHOISIR (AUS)</h4>
                        </div>
                        <div className="border border-white/[0.06] bg-white/[0.01] rounded-xl p-4">
                          <p className="text-[8px] uppercase tracking-wider text-white/30 font-mono">Granddam</p>
                          <h4 className="font-semibold text-white/80 mt-1">PROPHET JEWEL (AUS)</h4>
                        </div>
                        <div className="border border-white/[0.06] bg-white/[0.01] rounded-xl p-4">
                          <p className="text-[8px] uppercase tracking-wider text-white/30 font-mono">Grandsire</p>
                          <h4 className="font-semibold text-white/80 mt-1">O'REILLY (NZ)</h4>
                        </div>
                        <div className="border border-white/[0.06] bg-white/[0.01] rounded-xl p-4">
                          <p className="text-[8px] uppercase tracking-wider text-white/30 font-mono">Granddam</p>
                          <h4 className="font-semibold text-white/80 mt-1">LITTLE SATURN (NZ)</h4>
                        </div>
                      </div>

                      {/* Great-Grandsires */}
                      <div className="space-y-2 flex flex-col justify-center text-[10px] text-white/50 pl-4 border-l border-white/[0.06]">
                        <div><span className="text-[#d4a964] font-medium">Danehill Dancer</span></div>
                        <div><span>Great Selection</span></div>
                        <div className="pt-2"><span className="text-white/70">Encosta de Lago</span></div>
                        <div><span>Factor</span></div>
                        <div className="pt-2"><span>Last Tycoon</span></div>
                        <div><span className="text-[#d4a964] font-medium">Courtza</span></div>
                        <div className="pt-2"><span>Saturn</span></div>
                        <div><span>Fay's Joy</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NZTR FORM GUIDE */}
              {activeTab === "form" && (
                <div className="p-1 rounded-[2rem] bg-white/[0.02] border border-white/[0.06] shadow-xl animate-fade-in">
                  <div className="rounded-[calc(2rem-0.25rem)] bg-[#0A0A0F]/65 border border-white/[0.08] p-8 space-y-6">
                    <div>
                      <h3 className="text-lg font-light text-white font-luxury-serif">Race History (Last 5 Starts)</h3>
                      <p className="text-xs text-white/45 font-light mt-1">Form and margins synced dynamically with NZTR databases.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-light">
                        <thead>
                          <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[9px] uppercase tracking-wider text-white/40">
                            <th className="px-6 py-4 font-mono">Date</th>
                            <th className="px-6 py-4 font-mono">Venue</th>
                            <th className="px-6 py-4 font-mono">Class</th>
                            <th className="px-6 py-4 font-mono">Dist</th>
                            <th className="px-6 py-4 font-mono">Track</th>
                            <th className="px-6 py-4 font-mono">Pos</th>
                            <th className="px-6 py-4 font-mono">Jockey</th>
                            <th className="px-6 py-4 font-mono">Margin</th>
                            <th className="px-6 py-4 font-mono">Winner</th>
                          </tr>
                        </thead>
                        <tbody>
                          {starts.map((start, idx) => (
                            <tr key={idx} className="border-b border-white/[0.04] hover:bg-white/[0.01] transition-colors">
                              <td className="px-6 py-4 text-white/50">{start.date}</td>
                              <td className="px-6 py-4 text-white font-medium">{start.venue}</td>
                              <td className="px-6 py-4 text-white/60">{start.class}</td>
                              <td className="px-6 py-4">{start.dist}</td>
                              <td className="px-6 py-4 font-mono text-[10px] text-white/40">{start.track}</td>
                              <td className={`px-6 py-4 font-semibold ${start.pos.startsWith("1") ? "text-emerald-400" : "text-white/80"}`}>{start.pos}</td>
                              <td className="px-6 py-4 text-white/60">{start.jockey}</td>
                              <td className="px-6 py-4">{start.margin}</td>
                              <td className="px-6 py-4 text-white/50">{start.winner}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* LEGAL AGREEMENTS */}
              {activeTab === "documents" && (
                <div className="p-1 rounded-[2rem] bg-white/[0.02] border border-white/[0.06] shadow-xl animate-fade-in">
                  <div className="rounded-[calc(2rem-0.25rem)] bg-[#0A0A0F]/65 border border-white/[0.08] p-8 space-y-6">
                    <div>
                      <h3 className="text-lg font-light text-white font-luxury-serif">Regulatory Disclosures</h3>
                      <p className="text-xs text-white/45 font-light mt-1">Regulatory leasehold syndicate agreements and product disclosure PDFs.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Doc 1: PDS */}
                      <div className="flex items-center justify-between p-5 border border-white/[0.06] bg-white/[0.01] rounded-2xl hover:border-white/10 transition-colors">
                        <div>
                          <p className="text-xs font-semibold text-white">Product Disclosure Statement (PDS)</p>
                          <p className="text-[10px] text-white/40 mt-1">PDF · Financial declarations and risk schedules</p>
                        </div>
                        <a 
                          href="/documents/prudentia/pds.pdf"
                          target="_blank"
                          className="px-5 py-2.5 rounded-full border border-white/20 hover:border-white/50 text-[10px] uppercase tracking-wider text-white transition-all duration-300"
                        >
                          View Document
                        </a>
                      </div>

                      {/* Doc 2: Syndicate Agreement */}
                      <div className="flex items-center justify-between p-5 border border-white/[0.06] bg-white/[0.01] rounded-2xl hover:border-white/10 transition-colors">
                        <div>
                          <p className="text-xs font-semibold text-white">Syndicate Agreement</p>
                          <p className="text-[10px] text-white/40 mt-1">PDF · Operations and co-ownership definitions</p>
                        </div>
                        <a 
                          href="/documents/prudentia/sa.pdf"
                          target="_blank"
                          className="px-5 py-2.5 rounded-full border border-white/20 hover:border-white/50 text-[10px] uppercase tracking-wider text-white transition-all duration-300"
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer minimal={true} />
    </>
  );
}
