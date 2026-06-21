'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

interface HeroSectionProps {
  backgroundImage?: string;
  overlay?: boolean;
  className?: string;
}

export function HeroSection({
  backgroundImage = '/images/content/background/horse-double-black.png',
  overlay = true,
  className = '',
}: HeroSectionProps) {
  const { scrollY } = useScroll();
  
  // Parallax Layering
  const bgY = useTransform(scrollY, [0, 1000], [0, 400]); // Moves slower (0.4)
  const textY = useTransform(scrollY, [0, 1000], [0, -200]); // Moves faster upwards
  const textScale = useTransform(scrollY, [0, 1000], [1, 1.1]); // Scales to 1.1

  return (
    <section
      id="hero"
      className={`relative flex min-h-screen items-center justify-center overflow-hidden pt-24 pb-48 ${className}`}
    >
      {/* Background Layer */}
      <motion.div
        className="absolute inset-0"
        style={{ y: bgY }}
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
      </motion.div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-8 pb-16 md:px-12">
        {/* Logo */}
        <motion.div
          style={{ scale: textScale, y: textY }}
          className="relative w-full max-w-[720px] animate-hero-logo"
        >
          <Image
            src="/images/brand/lockups/gold/lockup-horizontal-gold.png"
            alt="Evolution Stables - The Future of Racehorse Ownership"
            width={1200}
            height={400}
            priority
            className="relative z-20 h-auto w-full"
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          style={{ y: textY, fontSize: 12, letterSpacing: '3px', color: '#a1a1aa' }}
          className="mt-8 max-w-[720px] font-medium leading-relaxed animate-hero-tagline uppercase"
        >
          <span className="whitespace-nowrap">Grounded in tradition.</span>
          <br />
          <span className="whitespace-nowrap">Evolved through innovation.</span>
          <br />
          Ownership transformed.
        </motion.p>
      </div>
    </section>
  );
}
