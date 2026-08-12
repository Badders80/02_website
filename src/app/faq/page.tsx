import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { FAQStructuredData } from "@/components/seo/FAQStructuredData";
import { faqItems } from "@/lib/faq-items";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ — Racehorse Ownership Questions Answered",
  description:
    "Common questions about racehorse ownership, digital-syndication, costs, risks, and how Evolution Stables works. Everything you need to know before getting started.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ",
    description:
      "Common questions about racehorse ownership and digital-syndication, answered.",
    url: "https://www.evolutionstables.nz/faq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ",
    description:
      "Common questions about racehorse ownership and digital-syndication, answered.",
  },
};

export default function FAQPage() {
  return (
    <>
      <FAQStructuredData items={faqItems} />
      <NavBar />
      <main className="min-h-screen bg-canvas text-heading font-sans pt-32 pb-24 selection:bg-accent selection:text-canvas">
        <div className="mx-auto max-w-3xl px-6 sm:px-10 lg:px-12">
          {/* Breadcrumb */}
          <div className="mb-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-foreground">FAQ</span>
          </div>

          {/* Header */}
          <div className="mb-16 space-y-4">
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent">
              Questions
            </p>
            <h1 className="text-[36px] font-light tracking-tight text-heading md:text-[48px] leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-[16px] leading-[1.8] font-light text-foreground max-w-2xl">
              Everything you need to know about racehorse ownership through Evolution Stables — how it works, what it costs, and what to expect.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-12">
            {faqItems.map((item, idx) => (
              <div key={idx} className="space-y-4 border-b border-border pb-12">
                <h2 className="text-[20px] font-light text-heading tracking-tight leading-tight">
                  {item.question}
                </h2>
                <p className="text-[15px] leading-[1.85] font-light text-foreground">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 space-y-6 text-center">
            <p className="text-[14px] font-light text-muted-foreground">
              Still have questions?
            </p>
            <Link
              href="/marketplace"
              className="inline-block text-[11px] uppercase tracking-[0.2em] text-accent border border-accent/30 px-8 py-4 rounded-full hover:bg-accent/10 transition duration-300"
            >
              Explore the Marketplace
            </Link>
          </div>
        </div>
      </main>
      <Footer minimal={true} />
    </>
  );
}