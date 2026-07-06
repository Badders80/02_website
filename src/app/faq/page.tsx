import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { FAQStructuredData } from "@/components/seo/FAQStructuredData";
import { faqItems } from "@/lib/faq-items";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Racehorse Ownership Questions Answered",
  description:
    "Common questions about racehorse ownership, digital-syndication, costs, risks, and how Evolution Stables works. Everything you need to know before getting started.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ | Evolution Stables",
    description:
      "Common questions about racehorse ownership and digital-syndication, answered.",
    url: "https://evolutionstables.nz/faq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | Evolution Stables",
    description:
      "Common questions about racehorse ownership and digital-syndication, answered.",
  },
};

export default function FAQPage() {
  return (
    <>
      <FAQStructuredData items={faqItems} />
      <NavBar />
      <main className="min-h-screen bg-black text-white font-sans pt-32 pb-24 selection:bg-[#d4a964] selection:text-black">
        <div className="mx-auto max-w-3xl px-6 sm:px-10 lg:px-12">
          {/* Breadcrumb */}
          <div className="mb-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/30">
            <span className="text-white/60">FAQ</span>
          </div>

          {/* Header */}
          <div className="mb-16 space-y-4">
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#d4a964]">
              Questions
            </p>
            <h1 className="text-[36px] font-light tracking-tight text-white md:text-[48px] leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-[16px] leading-[1.8] font-light text-white/60 max-w-2xl">
              Everything you need to know about racehorse ownership through Evolution Stables — how it works, what it costs, and what to expect.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-12">
            {faqItems.map((item, idx) => (
              <div key={idx} className="space-y-4 border-b border-white/[0.06] pb-12">
                <h2 className="text-[20px] font-light text-white tracking-tight leading-tight">
                  {item.question}
                </h2>
                <p className="text-[15px] leading-[1.85] font-light text-white/70">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 space-y-6 text-center">
            <p className="text-[14px] font-light text-white/50">
              Still have questions?
            </p>
            <a
              href="/marketplace"
              className="inline-block text-[11px] uppercase tracking-[0.2em] text-[#d4a964] border border-[#d4a964]/30 px-8 py-4 rounded-full hover:bg-[#d4a964]/10 transition duration-300"
            >
              Explore the Marketplace
            </a>
          </div>
        </div>
      </main>
      <Footer minimal={true} />
    </>
  );
}