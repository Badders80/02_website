'use client';

interface StakeholderCard {
  title: string;
  subtitle: string;
  description: string;
}

const cards: StakeholderCard[] = [
  {
    title: "Investors & Fans",
    subtitle: "Experience the thrill — without the hassle.",
    description:
      "Ownership, on your terms. Simplified terms and conditions give you the full thrill of ownership in a transparent, regulated marketplace — where risk and return are clear before you buy.",
  },
  {
    title: "Breeders & Syndicators",
    subtitle: "Unlock new income — same control, zero extra effort.",
    description:
      "Expand your reach and retain full control, with offers structured, managed, and delivered — all in one place.",
  },
  {
    title: "Clubs & Organisations",
    subtitle: "From spectators to invested stakeholders.",
    description:
      "Ownership is the gateway to deeper engagement — turning one-time spectators into lifelong members, building revenue, and strengthening the sport's future, all in one place.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="mission" className="py-24 bg-black text-foreground">
      <div className="max-w-6xl mx-auto px-12 md:px-16 lg:px-20 w-full">
        {/* Heading & Description */}
        <div className="mb-16">
          <p className="mb-16 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
            OUR MISSION
          </p>
          <h2 className="mb-8 text-[36px] font-light tracking-tight text-white md:text-[48px]">
            How It Works
          </h2>
          <p className="text-[18px] font-light leading-[1.85] text-white/65">
            At Evolution Stables, we understand that ownership is the lifeblood of racing — and strengthening it benefits every part of the industry.
          </p>
        </div>

        {/* 3 Cards — horizontal split (1/3 title, 2/3 body), vertical stack below lg */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="group relative bg-white/[0.02] border border-white/[0.08] masked-border glass-streak rounded-lg p-10 transition-all duration-700 ease-out hover:bg-white/[0.04] hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] cursor-pointer overflow-hidden"
            >
              {/* Soft linear gradient sweep on hover */}
              <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background:
                    "linear-gradient(140deg, rgba(255,255,255,0.06), rgba(67,129,255,0.08) 40%, transparent 70%)",
                }}
              />
              <div className="relative grid grid-cols-1 xl:grid-cols-3 gap-x-8 gap-y-4">
                {/* Left third — title */}
                <p className="text-sm font-light uppercase tracking-[0.32em] text-white/40 xl:col-span-1">
                  {card.title.split(" & ")[0]} & <br />
                  {card.title.split(" & ")[1] || ""}
                </p>
                {/* Right two-thirds — subtitle + description */}
                <div className="space-y-4 xl:col-span-2">
                  <h4 className="text-[21px] font-light text-white leading-tight">
                    {card.subtitle}
                  </h4>
                  <p className="text-[15px] leading-[1.9] font-light text-white/60">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
