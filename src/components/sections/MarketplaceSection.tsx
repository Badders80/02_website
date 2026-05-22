import { Compass, ShieldCheck, LineChart } from "lucide-react";

export function MarketplaceSection() {
  return (
    <section id="marketplace" className="py-56 bg-black">
      <div className="max-w-6xl mx-auto px-12 md:px-16 lg:px-20">
        {/* Label */}
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase mb-12 text-white/30">
          REGULATED MARKETPLACE
        </p>

        {/* Headline */}
        <h2 className="text-[36px] md:text-[48px] leading-[1.1] text-white font-light tracking-tight mb-6">
          Transformation Powered by{" "}
          <a
            href="https://tokinvest.capital/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#21B981] hover:text-[#2dd4a4] transition-all"
          >
            Tokinvest
          </a>
        </h2>

        {/* Description */}
        <p className="text-[16px] leading-[1.7] font-light text-white/65 mb-16 max-w-3xl">
          Behind our integrated marketplace, Tokinvest delivers the raw
          horsepower that powers digital-syndication — built on regulated,
          financial-grade infrastructure, tailored from institutional finance
          and adapted to meet the demands of modern owners.
        </p>

        {/* Features */}
        <div className="mt-32 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 - Discover Opportunities */}
            <div className="glass-streak masked-border group relative overflow-hidden rounded-3xl p-8 bg-white/[0.02] backdrop-blur transition-all duration-500 ease-out hover:bg-white/[0.04] hover:shadow-[0_8px_30px_rgba(212,169,100,0.15)] hover:scale-[1.02]">
              <div className="flex flex-col gap-6">
                <div className="flex-shrink-0 w-12 h-12 relative flex items-center justify-center transition-all duration-500">
                  <Compass className="w-8 h-8 text-white/80 group-hover:text-gold transition-colors duration-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(212,169,100,0.6)]" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-[18px] font-light text-white mb-3 leading-tight relative overflow-hidden">
                    <span className="relative inline-block">
                      Discover Opportunities
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/70 to-transparent -translate-x-full opacity-0 group-hover:translate-x-full group-hover:opacity-100 group-hover:transition-all group-hover:duration-700 group-hover:ease-in-out transition-none" />
                    </span>
                  </h4>
                  <p className="text-[15px] leading-[1.7] font-light text-white/50 transition-colors duration-500 group-hover:text-white/80">
                    Explore available syndications and short-term leases — all
                    clearly structured, fully transparent, and ready to invest
                    in with confidence.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 - Trade with Confidence */}
            <div className="glass-streak masked-border group relative overflow-hidden rounded-3xl p-8 bg-white/[0.02] backdrop-blur transition-all duration-500 ease-out hover:bg-white/[0.04] hover:shadow-[0_8px_30px_rgba(212,169,100,0.15)] hover:scale-[1.02]">
              <div className="flex flex-col gap-6">
                <div className="flex-shrink-0 w-12 h-12 relative flex items-center justify-center transition-all duration-500">
                  <ShieldCheck className="w-8 h-8 text-white/80 group-hover:text-gold transition-colors duration-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(212,169,100,0.6)]" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-[18px] font-light text-white mb-3 leading-tight relative overflow-hidden">
                    <span className="relative inline-block">
                      Trade with Confidence
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/70 to-transparent -translate-x-full opacity-0 group-hover:translate-x-full group-hover:opacity-100 group-hover:transition-all group-hover:duration-700 group-hover:ease-in-out transition-none" />
                    </span>
                  </h4>
                  <p className="text-[15px] leading-[1.7] font-light text-white/50 transition-colors duration-500 group-hover:text-white/80">
                    Tokinvest's regulated platform ensures secure transactions,
                    immutable ownership records, and integrated settlements — so
                    every trade is safe, clear, and straightforward.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 - Real-Time Insight */}
            <div className="glass-streak masked-border group relative overflow-hidden rounded-3xl p-8 bg-white/[0.02] backdrop-blur transition-all duration-500 ease-out hover:bg-white/[0.04] hover:shadow-[0_8px_30px_rgba(212,169,100,0.15)] hover:scale-[1.02]">
              <div className="flex flex-col gap-6">
                <div className="flex-shrink-0 w-12 h-12 relative flex items-center justify-center transition-all duration-500">
                  <LineChart className="w-8 h-8 text-white/80 group-hover:text-gold transition-colors duration-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(212,169,100,0.6)]" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-[18px] font-light text-white mb-3 leading-tight relative overflow-hidden">
                    <span className="relative inline-block">
                      Real-Time Insight
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/70 to-transparent -translate-x-full opacity-0 group-hover:translate-x-full group-hover:opacity-100 group-hover:transition-all group-hover:duration-700 group-hover:ease-in-out transition-none" />
                    </span>
                  </h4>
                  <p className="text-[15px] leading-[1.7] font-light text-white/50 transition-colors duration-500 group-hover:text-white/80">
                    Follow your horses, track performance, and manage your
                    positions in real time — with ownership data, updates, and
                    key information always at your fingertips.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-32">
            <a
              href="https://tokinvest.capital/report"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-8 py-3.5 text-[10px] font-mono tracking-[0.2em] uppercase text-white/70 transition-all duration-300 hover:text-white hover:scale-105 focus:outline-none bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer opacity-50" />
              <span className="relative z-10 inline-block transition-all duration-300 group-hover:scale-110">
                Learn More About Tokinvest
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
