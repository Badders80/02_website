import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import Image from "next/image";

export const metadata = {
  title: "Marketplace | Evolution Stables",
  description:
    "Discover and explore digital-syndication opportunities within the Evolution ecosystem. Browse upcoming offerings, ownership positions, and live data.",
};

const modules = [
  {
    title: "Digital Syndication",
    description:
      "Experience tokenised racehorse ownership. Lease or trade verified stakes directly within the Evolution platform.",
    link: { text: "View Marketplace", href: "#" },
    icon: (
      <svg className="h-8 w-8 text-white/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: "Integration & Compliance",
    description:
      "Built in alignment with NZTR and VARA frameworks, ensuring every trade and syndication is fully compliant.",
    link: { text: "Learn More", href: "https://tokinvest.capital/report" },
    icon: (
      <svg className="h-8 w-8 text-white/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    title: "Analytics & Insights",
    description:
      "Access data-driven insights into race trends, horse performance, and portfolio value growth.",
    link: { text: "View Insights", href: "#" },
    icon: (
      <svg className="h-8 w-8 text-white/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: "Ownership Dashboard",
    description:
      "Track your stable's performance, prize returns, and active leases through a unified dashboard.",
    link: { text: "Open MyStable", href: "/mystable" },
    icon: (
      <svg className="h-8 w-8 text-white/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

export default function MarketplacePage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-foreground">
        {/* Hero / Header */}
        <section className="pt-32 pb-20 px-12 md:px-16 lg:px-20 max-w-6xl mx-auto">
          <p className="text-[11px] font-medium tracking-[0.28em] uppercase text-[#a1a1aa] mb-12">
            Evolution Stables
          </p>
          <h1 className="text-[36px] md:text-[48px] font-medium tracking-tight text-[#f5f5f5] mb-6">
            Marketplace
          </h1>
          <p className="text-[16px] leading-relaxed font-normal text-[#a1a1aa] max-w-2xl">
            Discover and explore digital-syndication opportunities within the Evolution ecosystem.
            Browse upcoming offerings, ownership positions, and live data, all designed to make
            racehorse ownership more accessible and connected.
          </p>
        </section>

        {/* Mockup Image */}
        <section className="px-12 md:px-16 lg:px-20 max-w-6xl mx-auto pb-20">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/images/Mockup-trading-window.png"
              alt="Evolution Stables Marketplace Trading Interface Mockup"
              width={1200}
              height={700}
              className="w-full h-auto"
              priority
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <p className="text-[24px] font-light tracking-wide text-white/90">Coming Soon</p>
            </div>
          </div>
        </section>

        {/* Modules */}
        <section className="py-32 px-12 md:px-16 lg:px-20 max-w-6xl mx-auto">
          <p className="text-[11px] font-light tracking-[0.2em] uppercase text-white/30 mb-12">
            Evolution Stables
          </p>
          <h2 className="text-[36px] md:text-[48px] font-light tracking-tight text-white mb-6">
            Modules
          </h2>
          <p className="text-[16px] leading-[1.7] font-light text-white/65 max-w-2xl mb-20">
            Explore the core components powering the Evolution ecosystem from ownership analytics to race insights.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((mod) => (
              <div
                key={mod.title}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-10 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <div className="mb-8">{mod.icon}</div>
                <h3 className="text-[18px] font-light text-white mb-3">{mod.title}</h3>
                <p className="text-[15px] leading-[1.7] font-light text-white/50 mb-8">
                  {mod.description}
                </p>
                <a
                  href={mod.link.href}
                  className="inline-flex items-center gap-2 text-[11px] font-light tracking-[0.15em] uppercase text-white/60 transition-all duration-300 hover:text-white group-hover:text-white"
                >
                  {mod.link.text}
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
