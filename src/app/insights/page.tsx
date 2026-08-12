import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { insightArticles } from "@/lib/insights";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Insights — Racehorse Ownership, Digital Syndication & Racing Updates",
  description:
    "Guides, press coverage, race reports, and thought leadership from Evolution Stables. Learn about racehorse ownership in New Zealand, digital-syndication, and how prize money and settlement work.",
  alternates: {
    canonical: "/insights",
  },
  openGraph: {
    title: "Insights",
    description:
      "Guides, press coverage, race reports, and thought leadership from Evolution Stables.",
    url: "https://www.evolutionstables.nz/insights",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Insights",
    description:
      "Guides, press coverage, race reports, and thought leadership from Evolution Stables.",
  },
};

type Category = "Guide" | "Press" | "Race Report" | "Team";

function getCategoryArticles(category: Category) {
  return insightArticles.filter((a) => a.category === category);
}

const categoryLabels: Record<Category, string> = {
  Guide: "Ownership Guides",
  Press: "Press & Coverage",
  "Race Report": "Race Reports",
  Team: "Team Evolution",
};

const categoryDescriptions: Record<Category, string> = {
  Guide: "Everything you need to know about racehorse ownership in New Zealand — costs, syndication, prize money, and how to get started.",
  Press: "Media coverage featuring Evolution Stables and the digital-syndication movement.",
  "Race Report": "Updates from the track — race previews, results, and training reports for Evolution Stables thoroughbreds.",
  Team: "The people behind Evolution Stables — trainers, owners, and partners.",
};

export default function InsightsHubPage() {
  const categories: Category[] = ["Guide", "Press", "Race Report", "Team"];

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-canvas text-heading font-sans pt-32 pb-24 selection:bg-accent selection:text-canvas">
        <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-12">
          {/* Header */}
          <div className="mb-16 space-y-4">
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent">
              Insights
            </p>
            <h1 className="text-[36px] font-light tracking-tight text-heading md:text-[48px] leading-tight">
              Racehorse Ownership, Explained
            </h1>
            <p className="text-[16px] leading-[1.8] font-light text-foreground max-w-2xl">
              Guides, press coverage, race reports, and thought leadership from Evolution Stables. Learn how digital-syndication works, what ownership costs, and how prize money reaches owners.
            </p>
          </div>

          {/* Category Sections */}
          {categories.map((category) => {
            const articles = getCategoryArticles(category);
            if (articles.length === 0) return null;

            return (
              <section key={category} className="mb-20">
                <div className="mb-8 space-y-2">
                  <h2 className="text-[24px] font-light text-heading tracking-tight">
                    {categoryLabels[category]}
                  </h2>
                  <p className="text-[13px] leading-[1.7] font-light text-muted-foreground max-w-2xl">
                    {categoryDescriptions[category]}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/insights/${article.slug}`}
                      className="group space-y-4 rounded-2xl border border-border bg-surface-base p-6 hover:border-border transition duration-300"
                    >
                      {article.heroImage && (
                        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface-base">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={article.heroImage}
                            alt={article.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        {article.category && (
                          <span className="text-[9px] uppercase tracking-[0.2em] text-accent">
                            {article.category}
                          </span>
                        )}
                        <h3 className="text-[15px] font-light text-heading leading-tight group-hover:text-accent transition duration-300">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-[12px] leading-[1.7] font-light text-muted-foreground line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          {article.date}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
      <Footer minimal={true} />
    </>
  );
}