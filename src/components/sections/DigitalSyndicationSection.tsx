'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: FeatureItem[] = [
  {
    title: "Discover Opportunities",
    description:
      "Explore available syndications and short-term leases — all clearly structured, fully transparent, and ready to invest in with confidence.",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white/80 group-hover:text-[#00E599] transition-colors duration-300"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    title: "Trade with Confidence",
    description:
      "Our regulated platform ensures secure transactions, compliant ownership records, and integrated settlements — so every trade is safe, clear, and straightforward.",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white/80 group-hover:text-[#00E599] transition-colors duration-300"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Real-Time Insight",
    description:
      "Follow your horses, track performance, and manage your positions in real time — with ownership data, updates, and key information always at your fingertips.",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white/80 group-hover:text-[#00E599] transition-colors duration-300"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export function DigitalSyndicationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header animation
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

      // Body paragraph — triggers after header
      if (bodyRef.current) {
        gsap.fromTo(
          bodyRef.current,
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: bodyRef.current,
              start: 'top 78%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Grid columns stagger animation
      if (gridRef.current) {
        const columns = gridRef.current.querySelectorAll(':scope > div');
        gsap.fromTo(
          columns,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="digital-syndication" className="py-48 md:py-56 bg-black text-foreground">
      <div className="max-w-6xl mx-auto px-12 md:px-16 lg:px-20 w-full">
        {/* Section Label */}
        <p className="text-[11px] font-light tracking-[0.2em] uppercase mb-12 text-white/30">
          REGULATED MARKETPLACE
        </p>

        {/* Section Headline */}
        <div ref={headerRef} className="max-w-4xl">
          <h2 className="text-[36px] md:text-[48px] lg:text-[52px] leading-[1.1] text-white font-light tracking-tight">
            Transformation Powered <br className="hidden sm:inline" />
            by{' '}
            <span className="text-[#00E599] font-normal">
              Regulation
            </span>
          </h2>
        </div>

        {/* Lead Paragraph */}
        <div ref={bodyRef} className="mt-8 max-w-3xl">
          <p className="text-[16px] md:text-[17px] leading-[1.75] font-light text-white/65">
            Evolution Stables operates as an Authorised Syndicator — delivering regulated, financial-grade infrastructure built for modern racehorse owners.
          </p>
        </div>

        {/* 3 Pillar Features Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mt-24">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative border-l border-white/10 pl-8 pr-4 space-y-6 transition-colors duration-500 hover:border-[#00E599]/50"
            >
              {/* Icon */}
              <div className="w-12 h-12 flex items-center justify-start">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-[18px] md:text-[20px] font-light tracking-tight text-white group-hover:text-[#00E599] transition-colors duration-300">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-[14px] md:text-[15px] leading-[1.7] font-light text-white/55 group-hover:text-white/75 transition-colors duration-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


