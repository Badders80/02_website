'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BenefitItem {
  iconSrc: string;
  title: string;
  description: string;
  alt: string;
}

const benefits: BenefitItem[] = [
  {
    iconSrc: "/images/content/icons/increased-access.svg",
    title: "Increased Access",
    description: "A digital platform that lowers barriers and opens ownership to everyone.",
    alt: "INCREASED ACCESS",
  },
  {
    iconSrc: "/images/content/icons/greater-than-equal.svg",
    title: "Greater Transparency",
    description: "Real-time performance, clear costs, and open communication.",
    alt: "GREATER TRANSPARENCY",
  },
  {
    iconSrc: "/images/content/icons/untitled-36.svg",
    title: "Borderless Flexibility",
    description: "Fractional shares and short-term commitments for modern investors.",
    alt: "BORDERLESS FLEXIBILITY",
  },
];

export function DigitalSyndicationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Left column slides in from left
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current,
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: leftColRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Right column benefits stagger up from below, delayed after left column finishes
      if (rightColRef.current) {
        const items = rightColRef.current.querySelectorAll(':scope > div > div > div');
        gsap.fromTo(
          items,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            delay: 0.5,
            scrollTrigger: {
              trigger: rightColRef.current,
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
    <section ref={sectionRef} id="digital-syndication" className="py-56 bg-black text-foreground">
      <div className="max-w-6xl mx-auto px-12 md:px-16 lg:px-20 w-full">
        {/* Section Label */}
        <p className="text-[11px] font-light tracking-[0.2em] uppercase mb-12 text-white/30">
          OUR MODEL
        </p>

        {/* Two Column Layout */}
        <div className="grid gap-16 lg:grid-cols-[1fr,1fr] lg:gap-48 xl:gap-56">
          {/* LEFT COLUMN */}
          <div ref={leftColRef} className="space-y-8">
            {/* Headline */}
            <h2 className="text-[36px] md:text-[48px] leading-[1.1] text-white font-light tracking-tight">
              Digital Syndication
            </h2>

            {/* Lead Paragraph */}
            <p className="text-[16px] leading-[1.7] font-light text-white/65">
              Syndication has always been the heartbeat of racehorse ownership — sharing risk, reward, and the thrill of the sport. But the way people participate has changed.
            </p>
            <p className="text-[16px] leading-[1.7] font-light text-white/65">
              Our digital-syndication model builds on that legacy — lowering barriers, increasing transparency, and unlocking new ways for owners, investors, and fans to participate — without replacing what works.
            </p>
          </div>

          {/* RIGHT COLUMN */}
          <div ref={rightColRef} className="space-y-8">
            {/* Features List */}
            <div className="space-y-12">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="group py-2 transition-transform duration-500 hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-12 h-12 relative flex items-center justify-center transition-all duration-500">
                      <Image
                        src={benefit.iconSrc}
                        alt={benefit.alt}
                        width={48}
                        height={48}
                        className="w-10 h-10 transition-all duration-500 group-hover:[filter:brightness(0)_saturate(100%)_invert(100%)]"
                        style={{
                          filter: "brightness(0) saturate(100%) invert(80%)",
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-[300] tracking-[0.05em] uppercase text-white mb-3 relative overflow-hidden">
                        <span className="relative inline-block">
                          {benefit.title}
                          {/* Dark overlay sweep - left to right only, instant disappear on unhover */}
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
      </div>
    </section>
  );
}
