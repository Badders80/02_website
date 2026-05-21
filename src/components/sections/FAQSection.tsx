"use client";

import { useState } from "react";
import faqData from "@/dna/content/faq.json";

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection() {
  const items: FAQItem[] = faqData.items;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-56 bg-black">
      <div className="max-w-6xl mx-auto px-12 md:px-16 lg:px-20">
        {/* Label */}
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
          A considered guide to the essentials — how digital-syndication works,
          what it means for ownership, and where Evolution Stables fits in.
        </p>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="border border-white/[0.08] rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <span className="text-[15px] font-light text-white">
                  {item.question}
                </span>
                <svg
                  className={`w-5 h-5 text-white/60 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 py-5 bg-white/[0.01] border-t border-white/[0.08]">
                  <p className="text-[15px] leading-[1.7] font-light text-white/70">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
