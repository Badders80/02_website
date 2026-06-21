'use client';

export function MarketplaceSection() {
  return (
    <section id="marketplace" className="py-56 bg-black text-foreground">
      <div className="max-w-6xl mx-auto px-12 md:px-16 lg:px-20">
        {/* Original Regulated Marketplace Label */}
        <p className="text-[11px] font-light tracking-[0.2em] uppercase mb-12 text-white/30">
          REGULATED MARKETPLACE
        </p>

        {/* Headline */}
        <h2 className="text-[36px] md:text-[48px] leading-[1.1] text-white font-light tracking-tight mb-6">
          Transformation Powered
          <br />
          by{" "}
          <a
            href="https://tokinvest.capital/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#21B981] hover:!text-[#2dd4a4] hover:font-normal hover:tracking-[-0.02em] transition-all"
          >
            Tokinvest
          </a>
        </h2>

        {/* Description */}
        <p className="text-[16px] leading-[1.7] font-light text-white/65 mb-16 max-w-3xl">
          Behind our integrated marketplace, Tokinvest delivers the raw
          horsepower that powers digital-syndication — built on regulated,
          financial-grade infrastructure, tailored from institutional
          finance and adapted to meet the demands of modern owners.
        </p>

        {/* Features */}
        <div className="mt-32 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Card 1 - Discover Opportunities */}
            <div className="group flex flex-col gap-6 relative px-8 py-12 md:px-10 md:py-16 transition-all duration-500">
              {/* Vertical lines */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[1px] bg-white/[0.08]" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[1px] bg-[#d4a964] origin-center scale-y-0 transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-y-100" />
              <div className="space-y-12">
                <div>
                  <svg
                    className="h-8 w-8 text-white/60 transition-colors duration-500 group-hover:text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[18px] font-light text-white leading-tight relative overflow-hidden">
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
            <div className="group flex flex-col gap-6 relative px-8 py-12 md:px-10 md:py-16 transition-all duration-500">
              {/* Vertical lines */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[1px] bg-white/[0.08]" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[1px] bg-[#d4a964] origin-center scale-y-0 transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-y-100" />
              <div className="space-y-12">
                <div>
                  <svg
                    className="h-8 w-8 text-white/60 transition-colors duration-500 group-hover:text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[18px] font-light text-white leading-tight relative overflow-hidden">
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
            <div className="group flex flex-col gap-6 relative px-8 py-12 md:px-10 md:py-16 transition-all duration-500">
              {/* Vertical lines */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[1px] bg-white/[0.08]" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[1px] bg-[#d4a964] origin-center scale-y-0 transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-y-100" />
              <div className="space-y-12">
                <div>
                  <svg
                    className="h-8 w-8 text-white/60 transition-colors duration-500 group-hover:text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[18px] font-light text-white leading-tight relative overflow-hidden">
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
            <div className="relative group inline-block">
              {/* Subtle breathing glow on hover */}
              <div className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-white/5 via-white/10 to-white/5 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
              {/* Gold accent on hover - bottom highlight */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] w-0 bg-gradient-to-r from-transparent via-[#d4a964] to-transparent opacity-0 blur-[2px] group-hover:w-full group-hover:opacity-100 transition-all duration-500 ease-out" />
              <a
                href="https://tokinvest.capital/report"
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-8 py-3.5 text-[11px] font-light tracking-wider uppercase text-white/70 transition-all duration-300 hover:text-white hover:scale-105 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary/50 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] overflow-hidden"
              >
                {/* Gentle shimmer animation */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer opacity-50" />
                <span className="relative z-10 inline-block transition-all duration-300 group-hover:scale-110">
                  Learn More About Tokinvest
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
