import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { KycBanner } from "@/components/KycBanner";
import Image from "next/image";

export const metadata = {
  title: "MyStable | Evolution Stables",
  description:
    "Your personal command center for managing ownership positions, tracking performance, and staying connected to your stable.",
};

const horses = [
  {
    name: "Thunder Strike",
    status: "racing",
    record: "3W / 8R",
    returns: "+16.2%",
    stake: "15%",
    investment: "$45k",
    value: "$52.3k",
    nextRace: "Mar 28",
  },
  {
    name: "Golden Horizon",
    status: "racing",
    record: "5W / 12R",
    returns: "+11.1%",
    stake: "25%",
    investment: "$62k",
    value: "$68.9k",
    nextRace: "Apr 5",
  },
  {
    name: "Midnight Runner",
    status: "training",
    record: "2W / 6R",
    returns: "+6.4%",
    stake: "10%",
    investment: "$28k",
    value: "$29.8k",
    nextRace: "Apr 12",
  },
];

export default function MyStablePage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-foreground">
        {/* Header */}
        <section className="pt-32 pb-20 px-12 md:px-16 lg:px-20 max-w-6xl mx-auto">
          <p className="text-[11px] font-medium tracking-[0.28em] uppercase text-[#a1a1aa] mb-12">
            Evolution Stables
          </p>
          <h1 className="text-[36px] md:text-[48px] font-medium tracking-tight text-[#f5f5f5] mb-6">
            MyStable
          </h1>
          <p className="text-[16px] leading-relaxed font-normal text-[#a1a1aa] max-w-2xl">
            Welcome, <span className="text-[#f5f5f5] font-normal">Owner</span>. This is your personal command center for
            managing ownership positions, tracking performance, and staying connected to your stable.
          </p>
        </section>

        {/* KYC Verification Banner */}
        <KycBanner />

        {/* Dashboard */}
        <section className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* My Horses */}
            <div className="lg:col-span-2 space-y-6">
              <div className="mb-4">
                <h2 className="text-[24px] font-light text-white mb-1">My Horses</h2>
                <p className="text-[13px] font-light text-white/40">Your active ownership stakes</p>
              </div>

              {horses.map((horse) => (
                <div
                  key={horse.name}
                  className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  {/* Top row: name + status + returns */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-[18px] font-medium tracking-tight text-white">{horse.name}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                            horse.status === 'racing'
                              ? 'bg-[#34D399]/10 text-[#34D399]'
                              : 'bg-[#60A5FA]/10 text-[#60A5FA]'
                          }`}
                        >
                          {horse.status}
                        </span>
                        <span className="text-[12px] text-white/30">{horse.record}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[18px] font-medium text-[#34D399]">{horse.returns}</p>
                      <p className="text-[11px] text-white/30">returns</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-4 border-t border-white/[0.06] pt-4">
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-wider text-white/30">Stake</p>
                      <p className="text-[14px] font-medium text-white">{horse.stake}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-wider text-white/30">Investment</p>
                      <p className="text-[14px] font-medium text-white">{horse.investment}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-wider text-white/30">Value</p>
                      <p className="text-[14px] font-medium text-white">{horse.value}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-wider text-white/30">Next Race</p>
                      <p className="text-[14px] font-medium text-white">{horse.nextRace}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coming Soon overlay */}
              <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-12 text-center">
                <p className="text-[24px] font-light tracking-wide text-white/90 mb-4">Coming Soon</p>
                <p className="text-[14px] font-light text-white/40 max-w-lg mx-auto">
                  The full MyStable ownership dashboard for portfolio analytics, horse performance, and race insights will unlock shortly.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Total Value */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <p className="text-[11px] font-light tracking-wider uppercase text-white/30 mb-2">Total Value</p>
                <p className="text-[28px] font-light text-white mb-1">$245.8k</p>
                <p className="text-[13px] font-light text-[#21B981]">+12.3% this month</p>
              </div>

              {/* Total Returns */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <p className="text-[11px] font-light tracking-wider uppercase text-white/30 mb-2">Total Returns</p>
                <p className="text-[28px] font-light text-white mb-1">$18.6k</p>
                <p className="text-[13px] font-light text-[#21B981]">+8.2% ROI</p>
              </div>

              {/* Active Stakes */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <p className="text-[11px] font-light tracking-wider uppercase text-white/30 mb-2">Active Stakes</p>
                <p className="text-[28px] font-light text-white mb-1">3</p>
                <p className="text-[13px] font-light text-white/40">across portfolio</p>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <p className="text-[11px] font-light tracking-wider uppercase text-white/30 mb-4">Quick Actions</p>
                <div className="space-y-3">
                  <a href="#" className="block text-[13px] font-light text-white/60 hover:text-white transition-colors">
                    View Marketplace →
                  </a>
                  <a href="#" className="block text-[13px] font-light text-white/60 hover:text-white transition-colors">
                    Performance Report →
                  </a>
                  <a href="#" className="block text-[13px] font-light text-white/60 hover:text-white transition-colors">
                    Upcoming Races →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Information Hub */}
        <section className="py-32 px-12 md:px-16 lg:px-20 max-w-6xl mx-auto">
          <p className="text-[11px] font-light tracking-[0.2em] uppercase text-white/30 mb-12">
            Evolution Stables
          </p>
          <h2 className="text-[36px] md:text-[48px] font-light tracking-tight text-white mb-6">
            Information Hub
          </h2>
          <p className="text-[16px] leading-[1.7] font-light text-white/65 max-w-2xl mb-12">
            Stay connected with the latest Evolution news, interviews, and race insights. Follow community
            updates and media coverage through the Information Hub.
          </p>

          <div className="relative rounded-2xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/images/Gemini_Generated_Image_r4hnnzr4hnnzr4hn.jpg"
              alt="Digital racehorse tracking and insights on Evolution Stables platform"
              width={1200}
              height={500}
              className="w-full h-auto"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
              <h3 className="text-[18px] font-light text-white mb-2">Latest Insights</h3>
              <p className="text-[14px] font-light text-white/60">Curated coverage of races, partnerships, and trends.</p>
            </div>
          </div>
        </section>

        {/* Press Coverage */}
        <section className="pb-32 px-12 md:px-16 lg:px-20 max-w-6xl mx-auto">
          <p className="text-[11px] font-light tracking-[0.2em] uppercase text-white/30 mb-12">
            Evolution Stables
          </p>
          <h2 className="text-[36px] md:text-[48px] font-light tracking-tight text-white mb-6">
            Press Coverage
          </h2>
          <p className="text-[16px] leading-[1.7] font-light text-white/65 max-w-2xl mb-12">
            Explore the latest media coverage and announcements from Evolution Stables.
          </p>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-10 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04]">
            <h3 className="text-[18px] font-light text-white mb-2">View All Press Coverage</h3>
            <p className="text-[14px] font-light text-white/50 mb-6">Read full stories, partnerships, and industry insights in the press archive.</p>
            <a
              href="/press"
              className="inline-flex items-center gap-2 text-[11px] font-light tracking-[0.15em] uppercase text-white/60 transition-all duration-300 hover:text-white"
            >
              View All Press Coverage
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
