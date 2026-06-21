import { Metadata } from 'next';
import Image from 'next/image';
import { pressArticles } from '@/lib/press-articles';
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: 'Press & Media | Evolution Stables',
  description:
    'The latest news, media coverage, and press releases from Evolution Stables. Discover how we are transforming thoroughbred ownership through digital innovation.',
  alternates: {
    canonical: '/press',
  },
};

export default function PressPage() {
  const formatDate = (value: string) => {
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const sortedArticles = [...pressArticles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const featuredArticle = sortedArticles[0];
  const gridArticles = sortedArticles.slice(1);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black text-foreground">
        {/* Header */}
        <section className="pt-32 pb-20 px-12 md:px-16 lg:px-20 max-w-5xl mx-auto">
          <p className="text-[11px] font-light tracking-[0.2em] uppercase text-white/30 mb-12">
            Evolution Stables
          </p>
          <h1 className="text-[36px] md:text-[56px] leading-[1.1] text-white font-light tracking-tight mb-6">
            Press & Coverage
          </h1>
          <p className="text-[16px] leading-[1.7] font-light text-white/65 max-w-2xl">
            Stay updated with our latest announcements and media features as we bridge the gap between traditional equine excellence and modern digital syndication.
          </p>
        </section>

        {/* Content Section */}
        <section className="px-12 md:px-16 lg:px-20 max-w-5xl mx-auto pb-20">
          {/* Featured Article - Split Layout Card */}
          {featuredArticle && (
            <div className="mb-16">
              <a
                href={featuredArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="rounded-sm border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    {/* Left: Content */}
                    <div className="p-8 md:p-12 lg:col-span-7 flex flex-col justify-center order-2 lg:order-1">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 transition-colors group-hover:text-white">
                          {formatDate(featuredArticle.date)}
                        </span>
                        <div className="h-px w-6 bg-white/10" />
                        <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 transition-colors group-hover:text-white">
                          {featuredArticle.publisher}
                        </span>
                      </div>
                      
                      <h2 className="text-3xl md:text-4xl font-light leading-snug tracking-tight text-white/90 mb-6 group-hover:text-white transition-colors duration-300">
                        {featuredArticle.title}
                      </h2>
                      
                      <p className="text-[15px] md:text-[17px] font-light leading-[1.7] text-white/55 transition-colors duration-300 group-hover:text-white/65 mb-8 line-clamp-4">
                        {featuredArticle.excerpt}
                      </p>
                      
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-2">
                          <span className="text-xs uppercase tracking-[0.3em] bg-gradient-to-r from-white/40 via-white to-white/40 bg-[length:200%_auto] bg-clip-text text-transparent animate-bolt-shimmer transition-all duration-700">
                            Read Full Article
                          </span>
                          <svg
                            className="w-3 h-3 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all duration-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                    
                    {/* Right: Image */}
                    <div className="relative aspect-[16/9] lg:aspect-auto lg:min-h-[400px] lg:col-span-5 w-full overflow-hidden bg-white/5 transition-all duration-700 order-1 lg:order-2">
                      {featuredArticle.imageUrl ? (
                        <Image
                          src={featuredArticle.imageUrl}
                          alt={featuredArticle.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          priority
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/10 font-medium tracking-widest uppercase text-xs">
                          {featuredArticle.publisher}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                    </div>
                  </div>
                </div>
              </a>
            </div>
          )}

          {/* Grid Articles - 3-Column Typographic Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridArticles.map((article) => (
              <a
                key={article.url}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="h-full rounded-sm border border-white/[0.06] bg-white/[0.02] p-8 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 transition-colors group-hover:text-white">
                        {formatDate(article.date)}
                      </span>
                      <div className="h-px w-6 bg-white/10" />
                      <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 transition-colors group-hover:text-white">
                        {article.publisher}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-light leading-snug tracking-tight text-white/90 group-hover:text-white transition-colors duration-300 line-clamp-3">
                      {article.title}
                    </h3>

                    <p className="text-[14px] md:text-[15px] font-light leading-[1.7] text-white/55 transition-colors duration-300 group-hover:text-white/65 line-clamp-4">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-8">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-xs uppercase tracking-[0.3em] bg-gradient-to-r from-white/40 via-white to-white/40 bg-[length:200%_auto] bg-clip-text text-transparent animate-bolt-shimmer transition-all duration-700">
                        Read Full Article
                      </span>
                      <svg
                        className="w-3 h-3 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all duration-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

