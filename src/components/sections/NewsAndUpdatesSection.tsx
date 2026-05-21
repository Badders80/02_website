"use client";

import Image from "next/image";
import pressData from "@/dna/content/press.json";

interface PressArticle {
  title: string;
  url: string;
  publisher: string;
  date: string;
  excerpt: string;
  imageUrl: string;
}

export function NewsAndUpdatesSection() {
  const articles: PressArticle[] = pressData.articles;
  
  // Lead article is the first one (Prudentia victory)
  const leadArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <section id="news" className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-12 md:px-16 lg:px-20">
        <p className="text-[11px] font-light tracking-[0.2em] uppercase mb-12 text-white/30">
          NEWS AND UPDATES
        </p>

        {/* Lead Article - Full width card with split layout */}
        <div className="mb-16">
          <a
            href={leadArticle.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] overflow-hidden hover:bg-white/[0.04] transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Left: Content */}
                <div className="p-8 md:p-10 flex flex-col justify-center order-2 md:order-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-light text-white/40">{leadArticle.date}</span>
                    <span className="text-xs font-light uppercase tracking-wider text-gold">{leadArticle.publisher}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors mb-4">
                    <span>Read the full story here</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light text-white mb-4 group-hover:text-gold transition-colors">
                    {leadArticle.title}
                  </h3>
                  <p className="text-[15px] leading-[1.7] font-light text-white/60">
                    {leadArticle.excerpt}
                  </p>
                </div>
                
                {/* Right: Image */}
                {leadArticle.imageUrl && (
                  <div className="relative h-64 md:h-auto order-1 md:order-2">
                    <Image
                      src={leadArticle.imageUrl}
                      alt={leadArticle.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </a>
        </div>

        {/* Remaining Articles Grid - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {remainingArticles.map((article, index) => (
            <a
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] overflow-hidden hover:bg-white/[0.04] transition-colors h-full flex flex-col">
                {/* Image on top */}
                {article.imageUrl && (
                  <div className="relative h-48 w-full flex-shrink-0">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                {/* Content below image */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-light text-white/40">{article.date}</span>
                    <span className="text-xs font-light uppercase tracking-wider text-gold">{article.publisher}</span>
                  </div>
                  <h4 className="text-lg font-light text-white mb-3 group-hover:text-gold transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-[14px] leading-[1.6] font-light text-white/50 mb-4 line-clamp-2 flex-grow">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors mt-auto">
                    <span>Read the full story here</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
