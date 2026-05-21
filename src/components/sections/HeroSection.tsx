'use client';

import React from 'react';
import Image from 'next/image';

interface HeroSectionProps {
  backgroundImage?: string;
  overlay?: boolean;
  className?: string;
}

export function HeroSection({
  backgroundImage = '/images/Horse-Double-Black.png',
  overlay = true,
  className = '',
}: HeroSectionProps) {
  const [shouldFixBackground, setShouldFixBackground] = React.useState(false);
  const [bgY, setBgY] = React.useState(0);
  const rafRef = React.useRef<number>(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const isFixed = scrollPosition > windowHeight * 0.3;
      setShouldFixBackground(isFixed);

      // Parallax: background moves slower than scroll (0 to -300 over 0-1000px scroll)
      if (!isFixed) {
        const parallaxY = -(scrollPosition * 0.3);
        setBgY(parallaxY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="hero"
      className={`relative flex min-h-screen items-center justify-center overflow-hidden pt-24 pb-48 ${className}`}
    >
      {/* Background Layer */}
      <div
        className="absolute inset-0"
        style={{
          position: shouldFixBackground ? 'fixed' : 'absolute',
          top: shouldFixBackground ? 0 : undefined,
          zIndex: shouldFixBackground ? -1 : undefined,
          transform: shouldFixBackground ? 'none' : `translateY(${bgY}px)`,
        }}
      >
        <Image
          src={backgroundImage}
          alt="Majestic racehorses representing Evolution Stables digital ownership"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0.35 }} />
        {overlay && (
          <div
            className="fixed inset-0"
            style={{
              height: '100vh',
              background: 'linear-gradient(to bottom, rgba(9,9,11,0.7) 0%, rgba(9,9,11,0.7) 20%, rgba(9,9,11,0.3) 40%, transparent 50%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-8 pb-16 md:px-12">
        {/* Logo */}
        <div
          className="w-full max-w-[720px] animate-hero-logo"
        >
          <Image
            src="/images/Evolution-Stables-Logo.png"
            alt="Evolution Stables - The Future of Racehorse Ownership"
            width={1200}
            height={400}
            priority
            className="h-auto w-full"
          />
        </div>

        {/* Tagline */}
        <p className="mt-8 max-w-[720px] font-medium leading-relaxed animate-hero-tagline uppercase" style={{ fontSize: 12, letterSpacing: '3px', color: '#a1a1aa' }}>
          <span className="whitespace-nowrap">Grounded in tradition.</span>
          <br />
          <span className="whitespace-nowrap">Evolved through innovation.</span>
          <br />
          Ownership transformed.
        </p>
      </div>
    </section>
  );
}
