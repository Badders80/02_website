import Image from "next/image";

interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

const benefits: BenefitItem[] = [
  {
    icon: "/images/Increased Access.svg",
    title: "Increased Access",
    description: "A digital platform that lowers barriers and opens ownership to everyone.",
  },
  {
    icon: "/images/greater-than-equal-icon-original.svg",
    title: "Greater Transparency",
    description: "Real-time performance, clear costs, and open communication.",
  },
  {
    icon: "/images/Untitled design (36).svg",
    title: "Borderless Flexibility",
    description: "Fractional shares and short-term commitments for modern investors.",
  },
];

export function DigitalSyndicationSection() {
  return (
    <section id="digital-syndication" className="py-56 bg-black">
      <div className="max-w-5xl mx-auto px-6">
        {/* Label */}
        <p className="text-[11px] font-light tracking-[0.2em] uppercase mb-12 text-white/30">
          OUR MODEL
        </p>

        {/* Two Column Layout */}
        <div className="grid gap-16 lg:grid-cols-[1fr,1fr] lg:gap-48 xl:gap-56">
          {/* Left Column - Text */}
          <div className="space-y-8">
            <h2 className="text-[36px] md:text-[48px] leading-[1.1] text-white font-light tracking-tight">
              Digital Syndication
            </h2>
            <p className="text-[16px] leading-[1.7] font-light text-white/65">
              Syndication has always been the heartbeat of racehorse ownership —
              sharing risk, reward, and the thrill of the sport. But the way
              people participate has changed.
            </p>
            <p className="text-[16px] leading-[1.7] font-light text-white/65">
              Our digital-syndication model builds on that legacy — lowering
              barriers, increasing transparency, and unlocking new ways for
              owners, investors, and fans to participate — without replacing
              what works.
            </p>
          </div>

          {/* Right Column - Features */}
          <div className="space-y-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group py-2 transition-transform duration-500 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-12 h-12 relative flex items-center justify-center transition-all duration-500">
                    <Image
                      src={benefit.icon}
                      alt={benefit.title}
                      width={48}
                      height={48}
                      className="w-10 h-10 transition-all duration-500"
                      style={{ filter: "brightness(0) saturate(100%) invert(80%)" }}
                    />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-[300] tracking-[0.05em] uppercase text-white mb-3 relative overflow-hidden">
                      <span className="relative inline-block">
                        {benefit.title}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/70 to-transparent -translate-x-full opacity-0 group-hover:translate-x-full group-hover:opacity-100 group-hover:transition-all group-hover:duration-700 group-hover:ease-in-out transition-none" />
                      </span>
                    </h4>
                    <p className="text-[15px] leading-[1.6] font-light text-white/50 group-hover:text-white/70 transition-colors duration-500">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
