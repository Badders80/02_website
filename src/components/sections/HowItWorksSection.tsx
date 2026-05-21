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
    <section id="mission" className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-12 md:px-16 lg:px-20">
        {/* Heading */}
        <div className="space-y-12 mb-16">
          <p className="text-[11px] font-light tracking-[0.2em] uppercase text-white/30">
            OUR MISSION
          </p>
          <h2 className="text-[36px] md:text-[56px] leading-[1.1] text-white font-light tracking-tight">
            How It Works
          </h2>
          <p className="text-[16px] leading-[1.7] font-light text-white/65 max-w-2xl">
            At Evolution Stables, we understand that ownership is the lifeblood
            of racing — and strengthening it benefits every part of the industry.
          </p>
        </div>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="group relative bg-white/[0.02] border border-white/[0.08] rounded-lg p-10 transition-all duration-700 ease-out hover:bg-white/[0.04] hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] cursor-pointer"
            >
              <div className="relative space-y-4">
                <p className="text-sm font-light uppercase tracking-[0.32em] text-white/40">
                  {card.title.split(" & ")[0]}
                  <br />
                  {card.title.split(" & ")[1] || ""}
                </p>
                <h4 className="text-[21px] font-light text-white leading-tight">
                  {card.subtitle}
                </h4>
                <p className="text-[15px] leading-[1.9] font-light text-white/60">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
