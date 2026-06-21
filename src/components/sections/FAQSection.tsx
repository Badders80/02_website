'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import faqData from '@/dna/content/faq.json';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection() {
  const items: FAQItem[] = faqData.items;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleMouseLeave = () => {
    setOpenIndex(null);
  };

  return (
    <section id="faq" className="py-56 bg-black text-foreground">
      <div className="max-w-6xl mx-auto px-12 md:px-16 lg:px-20">
        {/* Section Label */}
        <p className="text-[11px] font-light tracking-[0.2em] uppercase mb-12 text-white/30">
          FAQ
        </p>

        {/* Headline */}
        <h2 className="text-[36px] md:text-[48px] leading-[1.1] text-white font-light tracking-tight mb-6">
          Understanding
          <br />
          Digital-Syndication
        </h2>

        {/* Description */}
        <p className="text-[18px] leading-[1.7] font-light text-white/50 mb-24 max-w-xl">
          A considered guide to the essentials — how digital-syndication works, what it means for ownership, and where Evolution Stables fits in.
        </p>

        {/* FAQ Container with Auto-Collapse on Mouse Leave */}
        <div 
          className="max-w-3xl mx-auto" 
          onMouseLeave={handleMouseLeave}
        >
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`transition-all duration-300 ${index === 0 ? 'border-t border-white/[0.08]' : ''}`}
              >
                <div className="py-8 border-b border-white/[0.08] transition-all duration-300 ease-out hover:border-white/[0.12]">
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full text-left cursor-pointer group relative focus:outline-none"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <h3 className={`font-heading text-base font-light tracking-tight transition-all duration-300 ease-out ${
                          isOpen ? 'text-white' : 'text-white/95'
                        } group-hover:text-white`}>
                          {item.question}
                        </h3>
                      </div>
                      
                      {/* Plus icon that rotates 45 degrees to a cross */}
                      <svg
                        className={`h-5 w-5 shrink-0 transition-all duration-300 ease-out ${
                          isOpen ? 'rotate-45 text-[#d4a964]' : 'rotate-0 text-white/40'
                        } group-hover:text-[#d4a964]`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                  </button>
                  
                  {/* Smooth dynamic height container using Framer Motion */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div 
                          className="text-base leading-relaxed font-light max-w-2xl pt-4 pb-2 text-white/60"
                        >
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
