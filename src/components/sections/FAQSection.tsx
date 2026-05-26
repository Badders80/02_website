"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase mb-12 text-white/30">
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
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                animate={{
                  backgroundColor: isOpen ? "rgba(15,15,15,0.95)" : "rgba(8,8,8,0.9)",
                  boxShadow: isOpen ? "0 0 20px rgba(255,255,255,0.05)" : "none",
                }}
                className="border border-white/10 rounded-3xl overflow-hidden backdrop-blur transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-8 py-6 text-left transition-colors"
                >
                  <span className="text-[16px] font-light text-white">
                    {item.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-white/60 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-white" : ""
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
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <div className="px-8 pb-6 border-t border-white/10 pt-4">
                        <p className="text-[15px] leading-[1.8] font-light text-white/60">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
