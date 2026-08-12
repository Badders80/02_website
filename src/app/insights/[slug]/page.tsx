import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { getInsightArticle, insightArticles } from '@/lib/insights';

/** Split text on URLs and render them as anchor tags. */
function linkifyText(text?: string) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline decoration-[#d4a964]/40 hover:decoration-[#d4a964] transition-colors"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return insightArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getInsightArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `/insights/${article.slug}`,
    },
    openGraph: {
      type: 'article',
      locale: 'en_NZ',
      url: `https://www.evolutionstables.nz/insights/${article.slug}`,
      title: article.title,
      description: article.excerpt,
      publishedTime: article.date,
      authors: [article.author],
      images: [
        {
          url: article.heroImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.heroImage],
    },
  };
}

function ArticleJsonLd({ article }: { article: ReturnType<typeof getInsightArticle> }) {
  if (!article) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: `https://www.evolutionstables.nz${article.heroImage}`,
    datePublished: article.date,
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: article.authorTitle,
      url: 'https://www.evolutionstables.nz',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Evolution Stables',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.evolutionstables.nz/images/brand/legacy/legacy-logo-gold-favicon.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.evolutionstables.nz/insights/${article.slug}`,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function InsightArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getInsightArticle(slug);
  if (!article) notFound();

  const formatDate = (value: string) => {
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  return (
    <>
      <ArticleJsonLd article={article} />
      <NavBar />
      <main className="min-h-screen bg-canvas text-foreground">
        {/* Hero */}
        <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
          <Image
            src={article.heroImage}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </section>

        {/* Title block */}
        <section className="px-6 md:px-12 lg:px-20 max-w-3xl mx-auto -mt-32 relative z-10">
          <p className="text-[11px] font-light tracking-[0.2em] uppercase text-muted-foreground mb-8">
            {formatDate(article.date)}
          </p>
          <h1 className="text-[28px] md:text-[40px] lg:text-[48px] leading-[1.15] text-heading font-light tracking-tight mb-6">
            {article.title}
          </h1>
          <p className="text-[16px] md:text-[18px] font-light text-muted-foreground mb-8 leading-relaxed">
            {article.subtitle}
          </p>
          <div className="flex items-center gap-4 mb-16">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-border flex items-center justify-center">
              <Image
                src="/images/brand/monograms/gold/monogram-gold.svg"
                alt="Evolution Stables"
                width={20}
                height={20}
              />
            </div>
            <div>
              <p className="text-[14px] text-foreground font-light">{article.author}</p>
              <p className="text-[11px] text-muted-foreground tracking-wider uppercase">{article.authorTitle}</p>
            </div>
          </div>
        </section>

        {/* Article body */}
        <section className="px-6 md:px-12 lg:px-20 max-w-3xl mx-auto pb-16">
          <div className="space-y-6">
            {article.body.map((block, i) => {
              if (block.type === 'heading') {
                return (
                  <h2 key={i} className="text-[22px] md:text-[26px] font-light tracking-tight text-heading pt-8">
                    {block.text}
                  </h2>
                );
              }
              if (block.type === 'subheading') {
                return (
                  <h3 key={i} className="text-[16px] md:text-[18px] font-light tracking-[0.15em] uppercase text-white pt-8 pb-2">
                    {block.text}
                  </h3>
                );
              }
              if (block.type === 'quote') {
                return (
                  <blockquote key={i} className="border-l-2 border-border pl-6 py-4 my-8">
                    <p className="text-[20px] md:text-[24px] font-light italic text-foreground leading-relaxed">
                      {block.text}
                    </p>
                  </blockquote>
                );
              }
              if (block.type === 'image') {
                return (
                  <div key={i} className="my-10">
                    <div className="relative w-full rounded-sm overflow-hidden border border-border">
                      <Image
                        src={block.src!}
                        alt={block.alt || ''}
                        width={1200}
                        height={675}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                );
              }
              if (block.type === 'list') {
                return (
                  <ul key={i} className="space-y-3 py-2">
                    {block.items?.map((item, j) => (
                      <li key={j} className="text-[16px] md:text-[17px] font-light text-muted-foreground leading-[1.7] flex gap-3">
                        <span className="text-muted-foreground mt-1">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="text-[16px] md:text-[17px] font-light text-muted-foreground leading-[1.8] text-justify">
                  {linkifyText(block.text)}
                </p>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-[12px] font-light text-muted-foreground leading-[1.8]">
              Evolution Stables is an authorised NZTR syndicator. This article is for informational purposes only and does not constitute investment advice or an offer of securities.
            </p>
          </div>

          {/* LinkedIn link */}
          {article.linkedinUrl && (
            <div className="mt-8">
              <a
                href={article.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 group"
              >
                <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-frost transition-colors duration-300">
                  Read on LinkedIn
                </span>
                <svg
                  className="w-3 h-3 text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-all duration-500"
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
              </a>
            </div>
          )}
        </section>

        {/* Back to press */}
        <section className="px-6 md:px-12 lg:px-20 max-w-3xl mx-auto pb-20">
          <Link
            href="/press"
            className="inline-flex items-center gap-2 group"
          >
            <svg
              className="w-3 h-3 text-muted-foreground group-hover:text-white group-hover:-translate-x-1 transition-all duration-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8l-4 4m0 0l4 4m-4-4H21"
              />
            </svg>
            <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-frost transition-colors duration-300">
              Back to Press
            </span>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}