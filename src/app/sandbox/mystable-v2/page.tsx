"use client";

import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

interface StoryUpdate {
  id: string;
  type: "workout" | "audio" | "video" | "paddock" | "race";
  title: string;
  date: string;
  location: string;
  excerpt: string;
  content: string;
  mediaUrl?: string;
  duration?: string;
  horseName: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
}

export default function MyStableV2Page() {
  const [activeTab, setActiveTab] = useState<"story" | "pedigree" | "ledger">("story");
  const [filterType, setFilterType] = useState<string>("all");
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  // Audio playback simulator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playingAudioId) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 100) {
            setPlayingAudioId(null);
            return 0;
          }
          return prev + 1.5;
        });
      }, 100);
    } else {
      setCurrentTime(0);
    }
    return () => clearInterval(interval);
  }, [playingAudioId]);

  const togglePlay = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setCurrentTime(0);
      setPlayingAudioId(id);
    }
  };

  // Sample dynamic story timeline with multi-media elements
  const storyUpdates: StoryUpdate[] = [
    {
      id: "update-1",
      type: "audio",
      title: "Wexford Stables trackwork review & campaign outlook",
      date: "2026-06-28",
      location: "Matamata Racecourse",
      excerpt: "Lance O'Sullivan shares feedback on Prudentia's recent heavy track gallop and plans for the upcoming Tauranga target.",
      content: "Prudentia worked exceptionally well over 1000m on the sand. The tracking data showed she hit her peak stride frequency at the 300m mark. The ground is getting heavy, but she shows high versatility. We've got our sights set on Tauranga next week.",
      duration: "1:42",
      horseName: "Prudentia",
      author: {
        name: "Lance O'Sullivan",
        role: "Co-Trainer, Wexford",
        avatar: "/updates/AB_Signiture.png",
      }
    },
    {
      id: "update-2",
      type: "race",
      title: "Te Rapa Finish: Tenacious win on heavy turf",
      date: "2026-06-10",
      location: "Te Rapa Racecourse",
      excerpt: "Re-live the dramatic final 200m where Prudentia rallied to secure a dominant victory.",
      content: "In extremely challenging heavy turf conditions, Prudentia showed remarkable grit. Sitting third at the turn, she responded to jockey cues to hit the lead at the 100m, winning by a comfortable length. Prize pool distribution details have been updated in the Stakes Ledger.",
      mediaUrl: "/updates/prudentia_te_rapa_may30.jpg",
      horseName: "Prudentia",
      author: {
        name: "Wexford Racing",
        role: "Race Day Team",
        avatar: "/updates/AB_Signiture.png",
      }
    },
    {
      id: "update-3",
      type: "paddock",
      title: "Routine health check & spring spelling paddock update",
      date: "2026-06-02",
      location: "Evolution Spelling Yard",
      excerpt: "A visual check-in of the spelling paddocks where the winter string is currently recovering and showing excellent conditioning.",
      content: "Prudentia has spent the last 48 hours resting in the north-facing paddocks. Stethoscope checks show optimal resting heart rate (34 BPM), and coat shine is excellent. Back to light lunging tomorrow morning.",
      mediaUrl: "/updates/prudentia_masa_tauranga_27june2026.jpg",
      horseName: "Prudentia",
      author: {
        name: "Sarah Jenkins",
        role: "Stable Vet Liaison",
        avatar: "/updates/AB_Signiture.png",
      }
    }
  ];

  const filteredUpdates = filterType === "all" 
    ? storyUpdates 
    : storyUpdates.filter(up => up.type === filterType);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-[#030303] text-[#f8fafc]/90 font-sans pt-36 pb-24 selection:bg-[#d4a964]/20 selection:text-white relative overflow-hidden">
        {/* Subtle Background Radial Gradients */}
        <div className="absolute top-[-10%] left-[5%] w-[600px] h-[600px] rounded-full bg-[#d4a964]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[5%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.02] blur-[140px] pointer-events-none" />

        {/* Header Block */}
        <section className="px-6 md:px-12 lg:px-20 max-w-6xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-10">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4a964] mb-3">
                Evolution Investor Portal
              </p>
              <h1 className="text-[40px] md:text-[54px] font-light tracking-tight text-white leading-tight">
                MyStable <span className="text-white/20 font-extralight">v2.0</span>
              </h1>
              <p className="text-[15px] font-light text-white/50 max-w-xl mt-3 leading-relaxed">
                Track live equine campaigns, review authentic stable logs, and monitor prize pool distributions from the Matamata yards.
              </p>
            </div>
            
            {/* Quick Stats Pill */}
            <div className="flex gap-4">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center min-w-[120px]">
                <p className="text-[9px] uppercase tracking-wider text-white/40 font-mono">My Stakes</p>
                <p className="text-[20px] font-light text-white mt-1">1.0%</p>
              </div>
              <div className="rounded-xl border border-[#d4a964]/20 bg-[#d4a964]/5 p-4 text-center min-w-[120px]">
                <p className="text-[9px] uppercase tracking-wider text-[#d4a964] font-mono">Indicative ROI</p>
                <p className="text-[20px] font-light text-emerald-400 mt-1">+8.2%</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Controls */}
        <section className="px-6 md:px-12 lg:px-20 max-w-6xl mx-auto mb-10">
          <div className="flex gap-2 border-b border-white/[0.04] pb-px">
            <button
              onClick={() => setActiveTab("story")}
              className={`pb-4 px-4 text-xs uppercase tracking-widest transition-all relative font-light ${
                activeTab === "story" ? "text-white font-medium" : "text-white/40 hover:text-white/70"
              }`}
            >
              Timeline Feed
              {activeTab === "story" && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#d4a964]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("pedigree")}
              className={`pb-4 px-4 text-xs uppercase tracking-widest transition-all relative font-light ${
                activeTab === "pedigree" ? "text-white font-medium" : "text-white/40 hover:text-white/70"
              }`}
            >
              Pedigree & Bloodstock
              {activeTab === "pedigree" && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#d4a964]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("ledger")}
              className={`pb-4 px-4 text-xs uppercase tracking-widest transition-all relative font-light ${
                activeTab === "ledger" ? "text-white font-medium" : "text-white/40 hover:text-white/70"
              }`}
            >
              Stakes Ledger
              {activeTab === "ledger" && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#d4a964]" />
              )}
            </button>
          </div>
        </section>

        {/* Main Content Area */}
        <section className="px-6 md:px-12 lg:px-20 max-w-6xl mx-auto">
          {activeTab === "story" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              
              {/* Sidebar Filters */}
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <h3 className="text-xs font-mono uppercase text-white/40 tracking-wider mb-3">Filter Logs</h3>
                  <div className="flex flex-col gap-1 text-xs">
                    {[
                      { label: "All Stories", value: "all" },
                      { label: "Audio Notes", value: "audio" },
                      { label: "Race Day Reviews", value: "race" },
                      { label: "Spelling & Paddock", value: "paddock" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setFilterType(item.value)}
                        className={`text-left py-2 px-3 rounded-lg transition-all ${
                          filterType === item.value 
                            ? "bg-white/[0.05] text-[#d4a964] font-medium" 
                            : "text-white/50 hover:text-white hover:bg-white/[0.02]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-5 space-y-4">
                  <h4 className="text-xs font-mono uppercase text-white/40 tracking-wider">About Prudentia</h4>
                  <div className="space-y-2 text-xs font-light text-white/60">
                    <p><span className="text-white/40 font-mono">Breeding:</span> Proisir x Little Bit Irish</p>
                    <p><span className="text-white/40 font-mono">Age:</span> 4yo Mare</p>
                    <p><span className="text-white/40 font-mono">Trainer:</span> Wexford Stables</p>
                  </div>
                </div>
              </div>

              {/* Feed List */}
              <div className="lg:col-span-3 space-y-10">
                {filteredUpdates.map((update) => (
                  <div 
                    key={update.id}
                    className="relative group rounded-2xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.02] p-8 transition-all duration-500 masked-border"
                  >
                    {/* Upper Category Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                          update.type === 'audio' ? 'bg-[#d4a964]' : 
                          update.type === 'race' ? 'bg-emerald-400' : 'bg-blue-400'
                        }`} />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                          {update.type.toUpperCase()} UPDATE
                        </span>
                      </div>
                      <div className="text-[11px] font-light text-white/40 flex items-center gap-2">
                        <span>{update.location}</span>
                        <span>·</span>
                        <span>{update.date}</span>
                      </div>
                    </div>

                    <h2 className="text-xl font-light text-white mb-3 group-hover:text-[#d4a964] transition-colors duration-300">
                      {update.title}
                    </h2>
                    
                    <p className="text-sm font-light text-white/60 leading-relaxed mb-6">
                      {update.excerpt}
                    </p>

                    {/* Media Type Renders */}
                    {update.type === "audio" && (
                      <div className="mb-6 rounded-xl border border-white/[0.06] bg-black/40 p-4 flex items-center gap-4">
                        <button
                          onClick={() => togglePlay(update.id)}
                          className="w-10 h-10 rounded-full bg-[#d4a964] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-md flex-shrink-0"
                          aria-label={playingAudioId === update.id ? "Pause" : "Play"}
                        >
                          {playingAudioId === update.id ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-white/40">
                            <span>{playingAudioId === update.id ? "PLAYING MEMO" : "LISTEN TO UPDATE"}</span>
                            <span>{playingAudioId === update.id ? "1:12 / " + update.duration : update.duration}</span>
                          </div>
                          {/* Animated/Simulated Waveform container */}
                          <div className="h-6 flex items-center gap-0.5 overflow-hidden w-full relative">
                            <div className="absolute inset-0 bg-white/[0.03] rounded-sm" />
                            {Array.from({ length: 45 }).map((_, i) => {
                              const height = Math.sin(i * 0.4) * 8 + 12;
                              const isActive = playingAudioId === update.id && (i / 45) * 100 <= currentTime;
                              return (
                                <span 
                                  key={i} 
                                  className={`flex-1 rounded-full transition-colors duration-300`} 
                                  style={{ 
                                    height: `${height}px`,
                                    backgroundColor: isActive ? '#d4a964' : 'rgba(255,255,255,0.1)' 
                                  }} 
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {update.mediaUrl && (
                      <div className="mb-6 rounded-xl overflow-hidden border border-white/[0.06] aspect-video relative group/media">
                        <Image
                          src={update.mediaUrl}
                          alt={update.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover/media:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                      </div>
                    )}

                    {/* Author block */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
                      <div className="w-6 h-6 rounded-full bg-zinc-900 border border-white/[0.08] relative overflow-hidden flex items-center justify-center">
                        <span className="text-[8px] font-mono text-white/50">ST</span>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-white/80 font-medium block">{update.author.name}</span>
                        <span className="text-white/40 font-light block text-[10px]">{update.author.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "pedigree" && (
            <div className="space-y-12">
              {/* Interactive Pedigree Tree Chart */}
              <div>
                <h2 className="text-xl font-light text-white mb-2">Pedigree Tree</h2>
                <p className="text-xs text-white/40 font-light mb-6">Detailed pedigree lines showing black-type stakes winners in bold.</p>
                
                {/* Horizontal Tree Rendering */}
                <div className="grid grid-cols-3 gap-4 border border-white/[0.06] bg-white/[0.01] p-6 rounded-2xl overflow-x-auto min-w-[640px]">
                  {/* Left Column: Sire/Dam */}
                  <div className="space-y-8 flex flex-col justify-center">
                    <div className="border border-[#d4a964]/20 bg-[#d4a964]/5 rounded-xl p-4">
                      <p className="text-[9px] uppercase tracking-wider text-[#d4a964] font-mono font-semibold">Sire</p>
                      <h4 className="text-sm font-medium text-white mt-1">PROISIR (AUS)</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">Multiple Gr.1 Sire</p>
                    </div>
                    <div className="border border-white/[0.08] bg-white/[0.02] rounded-xl p-4">
                      <p className="text-[9px] uppercase tracking-wider text-white/40 font-mono">Dam</p>
                      <h4 className="text-sm font-medium text-white mt-1">LITTLE BIT IRISH (NZ)</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">By O'Reilly (NZ)</p>
                    </div>
                  </div>
                  
                  {/* Middle Column: Grandsires / Granddams */}
                  <div className="space-y-4 flex flex-col justify-center">
                    <div className="border border-white/[0.04] bg-white/[0.01] rounded-xl p-3">
                      <p className="text-[8px] uppercase tracking-wider text-white/30 font-mono">Grand Sire</p>
                      <h4 className="text-xs font-semibold text-white/80 mt-0.5">CHOISIR (AUS)</h4>
                    </div>
                    <div className="border border-white/[0.04] bg-white/[0.01] rounded-xl p-3">
                      <p className="text-[8px] uppercase tracking-wider text-white/30 font-mono">Grand Dam</p>
                      <h4 className="text-xs font-semibold text-white/80 mt-0.5">PROPHET JEWEL (AUS)</h4>
                    </div>
                    <div className="border border-white/[0.04] bg-white/[0.01] rounded-xl p-3">
                      <p className="text-[8px] uppercase tracking-wider text-white/30 font-mono">Grand Sire</p>
                      <h4 className="text-xs font-semibold text-white/80 mt-0.5">O'REILLY (NZ)</h4>
                    </div>
                    <div className="border border-white/[0.04] bg-white/[0.01] rounded-xl p-3">
                      <p className="text-[8px] uppercase tracking-wider text-white/30 font-mono">Grand Dam</p>
                      <h4 className="text-xs font-semibold text-white/80 mt-0.5">LITTLE SATURN (NZ)</h4>
                    </div>
                  </div>

                  {/* Right Column: Great-Grandsires */}
                  <div className="space-y-2 flex flex-col justify-center text-[10px] text-white/60 font-light">
                    <div className="p-2 border-b border-white/[0.04]"><span className="text-white/30 font-mono">GS1:</span> Danehill Dancer</div>
                    <div className="p-2 border-b border-white/[0.04]"><span className="text-white/30 font-mono">GD1:</span> Great Selection</div>
                    <div className="p-2 border-b border-white/[0.04]"><span className="text-white/30 font-mono">GS2:</span> Encosta de Lago</div>
                    <div className="p-2 border-b border-white/[0.04]"><span className="text-white/30 font-mono">GD2:</span> Factor</div>
                    <div className="p-2 border-b border-white/[0.04]"><span className="text-white/30 font-mono">GS3:</span> Last Tycoon</div>
                    <div className="p-2 border-b border-white/[0.04]"><span className="text-white/30 font-mono">GD3:</span> Courtza</div>
                    <div className="p-2 border-b border-white/[0.04]"><span className="text-white/30 font-mono">GS4:</span> Saturn</div>
                    <div className="p-2"><span className="text-white/30 font-mono">GD4:</span> Fay's Joy</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ledger" && (
            <div className="space-y-8">
              {/* Financial & Distribution Table */}
              <div>
                <h2 className="text-xl font-light text-white mb-2">Ownership & Prize Ledger</h2>
                <p className="text-xs text-white/40 font-light mb-6">Historical record of syndicate dividend distributions and purchase receipts.</p>
                
                <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
                  <table className="w-full text-left text-xs font-light">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[9px] uppercase tracking-wider text-white/45">
                        <th className="px-6 py-4 font-mono">Transaction ID</th>
                        <th className="px-6 py-4 font-mono">Type</th>
                        <th className="px-6 py-4 font-mono">Amount (NZD)</th>
                        <th className="px-6 py-4 font-mono">Date</th>
                        <th className="px-6 py-4 font-mono">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/[0.04] hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 font-mono text-white/50">TX-00984</td>
                        <td className="px-6 py-4">Prize Pool Distribution (Te Rapa Win)</td>
                        <td className="px-6 py-4 text-emerald-400 font-medium">+$142.50</td>
                        <td className="px-6 py-4 text-white/60">2026-06-15</td>
                        <td className="px-6 py-4"><span className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">Settled</span></td>
                      </tr>
                      <tr className="border-b border-white/[0.04] hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 font-mono text-white/50">TX-00102</td>
                        <td className="px-6 py-4">Initial Syndicate Unit Acquisition (1%)</td>
                        <td className="px-6 py-4 text-white/80">-$1,500.00</td>
                        <td className="px-6 py-4 text-white/60">2026-05-24</td>
                        <td className="px-6 py-4"><span className="inline-block px-2.5 py-1 rounded-full bg-white/5 text-white/60 text-[10px]">Completed</span></td>
                      </tr>
                    </tbody>
                  </table>
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
