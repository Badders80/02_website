import Link from "next/link";
import type { InsightArticle } from "@/lib/insights";
import { insightHubLinks } from "@/lib/insights";

interface RelatedInsightsProps {
  articles: InsightArticle[];
  /** Show marketplace / returns / FAQ hub CTAs (default true for Guides). */
  showHubLinks?: boolean;
}

export function RelatedInsights({
  articles,
  showHubLinks = true,
}: RelatedInsightsProps) {
  if (articles.length === 0 && !showHubLinks) return null;

  return (
    <div className="mt-16 space-y-12 border-t border-white/[0.06] pt-12">
      {showHubLinks && (
        <div>
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#d4a964] mb-6">
            Next steps
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {insightHubLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group block rounded-sm border border-white/[0.06] bg-white/[0.02] p-5 transition hover:border-[#d4a964]/30 hover:bg-white/[0.04]"
              >
                <span className="text-[13px] font-light text-white group-hover:text-[#d4a964] transition-colors">
                  {link.label} →
                </span>
                <p className="mt-2 text-[12px] font-light text-white/40 leading-relaxed">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {articles.length > 0 && (
        <div>
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/30 mb-6">
            Related reading
          </p>
          <ul className="space-y-4">
            {articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/insights/${article.slug}`}
                  className="group flex flex-col gap-1 border-b border-white/[0.04] pb-4 last:border-0"
                >
                  {article.category && (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                      {article.category}
                    </span>
                  )}
                  <span className="text-[15px] font-light text-white/80 group-hover:text-[#d4a964] transition-colors leading-snug">
                    {article.title}
                  </span>
                  <span className="text-[13px] font-light text-white/35 line-clamp-2">
                    {article.excerpt}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
