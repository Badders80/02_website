'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header slides in from left
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Cards stagger in from left
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll(':scope > div');
        gsap.fromTo(
          cards,
          { x: -100, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="mission" className="py-24 bg-black text-foreground">
      <div className="max-w-6xl mx-auto px-12 md:px-16 lg:px-20 w-full">
        {/* Heading & Description */}
        <div ref={headerRef} className="mb-16">
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

        {/* 3 Cards — title above body, vertical stack below lg */}
        <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              <div className="relative space-y-6">
                {/* Title — full width, above subtitle */}
                <p className="text-[11px] font-light uppercase tracking-[0.25em] text-white/40">
                  {card.title}
                </p>
                {/* Subtitle + description */}
                <div className="space-y-4">
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
