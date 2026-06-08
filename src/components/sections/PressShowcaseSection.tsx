'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import pressData from "@/dna/content/press.json";

interface PressArticle {
  title: string;
  url: string;
  publisher: string;
  date: string;
  excerpt?: string;
  imageUrl?: string;
}

export function PressShowcaseSection() {
  const articles: PressArticle[] = pressData.articles;
  
  const leadArticle =
    articles.find(
      (article) =>
        article.url ===
        '/updates/prudentia_update_02june2026_email.html'
    ) ?? articles[0];

  const remainingArticles =
    articles.filter((article) => article !== leadArticle) || [];

  const preferredOrder = [
    'https://businessdesk.co.nz/article/technology/bringing-racing-into-the-digital-age',
    'https://trackside.co.nz/article/thoroughbred-ownership-reimagined',
    'https://www.investing.com/news/cryptocurrency-news/tokinvest-and-singularry-superapp-partner-to-make-regulated-realworld-asset-investing-accessible-to-everyone-4316762',
  ];

  const orderMap = new Map(
    preferredOrder.map((url, index) => [url, index])
  );

  const rightArticles = [...remainingArticles].sort((a, b) => {
    const aRank = orderMap.get(a.url);
    const bRank = orderMap.get(b.url);

    if (aRank !== undefined || bRank !== undefined) {
      if (aRank === undefined) return 1;
      if (bRank === undefined) return -1;
      return aRank - bRank;
    }

    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const visibleCount = Math.min(6, rightArticles.length);
  const shouldRotate = rightArticles.length > visibleCount;
  const animationDuration = 800;
  const displayDuration = 4200;

  const [openArticleUrl, setOpenArticleUrl] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [itemHeight, setItemHeight] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const itemRef = useRef<HTMLDivElement | null>(null);
  const rotateTimeoutRef = useRef<number | null>(null);

  const toggleArticle = (article: PressArticle) => {
    setOpenArticleUrl((current) => (current === article.url ? null : article.url));
  };

  useEffect(() => {
    setStartIndex(0);
    setOpenArticleUrl(null);
  }, [rightArticles.length]);

  useEffect(() => {
    if (!itemRef.current || openArticleUrl) return;

    const measure = () => {
      if (!itemRef.current) return;
      const nextHeight = itemRef.current.getBoundingClientRect().height;
      if (nextHeight > 0) {
        setItemHeight(nextHeight);
      }
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [rightArticles.length, openArticleUrl]);

  const isPaused = isHovered || openArticleUrl !== null;

  useEffect(() => {
    if (!shouldRotate || isPaused || !itemHeight) return;

    const startTimer = window.setTimeout(() => {
      setIsAnimating(true);
      rotateTimeoutRef.current = window.setTimeout(() => {
        setStartIndex((current) => (current + 1) % rightArticles.length);
        setIsAnimating(false);
        setOpenArticleUrl(null);
      }, animationDuration);
    }, displayDuration);

    return () => {
      window.clearTimeout(startTimer);
      if (rotateTimeoutRef.current) {
        window.clearTimeout(rotateTimeoutRef.current);
        rotateTimeoutRef.current = null;
      }
    };
  }, [animationDuration, displayDuration, isPaused, itemHeight, rightArticles.length, shouldRotate, startIndex]);

  const renderArticles = useMemo(() => {
    if (!shouldRotate) return rightArticles;
    return Array.from({ length: visibleCount + 1 }, (_, index) => {
      return rightArticles[(startIndex + index) % rightArticles.length];
    });
  }, [rightArticles, shouldRotate, startIndex, visibleCount]);

  const partners = [
    {
      name: 'Investing.com',
      src: '/images/partners/1_Investing_comLOGO.png',
      wrapperClass: 'w-[155px] h-[31px] sm:w-[175px] sm:h-[35px] md:w-[185px] md:h-[37px] lg:w-[210px] lg:h-[42px]'
    },
    {
      name: 'BusinessDesk',
      src: '/images/partners/2_businessdesk-Logo.jpg',
      wrapperClass: 'w-[155px] h-[31px] sm:w-[185px] sm:h-[37px] md:w-[200px] md:h-[40px] lg:w-[230px] lg:h-[46px]'
    },
    {
      name: 'Singularity',
      src: '/images/partners/3_SingularryLOGO.png',
      wrapperClass: 'w-[175px] h-[33px] sm:w-[200px] sm:h-[38px] md:w-[215px] md:h-[40px] lg:w-[245px] lg:h-[46px]'
    },
    {
      name: 'Tokinvest',
      src: '/images/partners/4_New Logo - White & Green.png',
      wrapperClass: 'w-[125px] h-[31px] sm:w-[140px] sm:h-[35px] md:w-[150px] md:h-[37px] lg:w-[175px] lg:h-[42px]'
    },
    {
      name: 'Trackside NZ',
      src: '/images/partners/6_tracksideNZ-logo.png',
      wrapperClass: 'w-[155px] h-[37px] sm:w-[185px] sm:h-[44px] md:w-[200px] md:h-[48px] lg:w-[230px] lg:h-[55px]'
    },
    {
      name: 'NZTR',
      src: '/images/partners/8_NZTR_LOGO_WHITE.png',
      wrapperClass: 'w-[145px] h-[40px] sm:w-[165px] sm:h-[45px] md:w-[180px] md:h-[50px] lg:w-[205px] lg:h-[57px]'
    },
    {
      name: 'Stephen Grey Racing',
      src: '/images/partners/9_StephenGreyRacingLogo.png',
      wrapperClass: 'w-[145px] h-[40px] sm:w-[165px] sm:h-[45px] md:w-[180px] md:h-[50px] lg:w-[205px] lg:h-[57px]'
    },
    {
      name: 'Arabian Business',
      src: '/images/partners/10_arabian-bussiness-logo.png',
      wrapperClass: 'w-[100px] h-[36px] sm:w-[110px] sm:h-[40px] md:w-[125px] md:h-[45px] lg:w-[145px] lg:h-[52px]'
    },
  ];
  const logoAdjustments: Record<string, string> = {
    'BusinessDesk': 'scale-110',
    'Singularity': 'scale-110',
    'Trackside NZ': 'scale-115',
    'NZTR': 'scale-110',
    'Stephen Grey Racing': 'scale-105',
    'Arabian Business': 'scale-110 brightness-125',
  };

  const formatDate = (value: string) => {
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-black text-white overflow-hidden py-24 bloomberg-showcase">
      <div className="max-w-5xl mx-auto px-12 md:px-16 lg:px-20 w-full space-y-24">
        {/* News and Updates Section - On Top */}
        <div>
          <p className="text-[11px] font-light tracking-[0.2em] uppercase mb-12 text-white/30">
            NEWS AND UPDATES
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-[6fr,4fr] gap-0">
            <a
              href={leadArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative pr-0 lg:pr-12 py-8 flex flex-col justify-center bg-black hover:bg-black/95 transition-colors duration-300 cursor-pointer"
            >
              <div className="space-y-8 max-w-2xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40 transition-colors group-hover:text-white">
                      {formatDate(leadArticle.date)}
                    </span>
                    <div className="h-px w-8 bg-white/10" />
                    <span className="text-xs uppercase tracking-[0.3em] text-white/60 transition-colors group-hover:text-white">
                      {leadArticle.publisher}
                    </span>
                  </div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/40 transition-colors group-hover:text-white">
                    <span className="relative inline-flex items-center gap-2 overflow-hidden">
                      <span className="relative z-10">Read the full story here</span>
                      <span className="relative z-10">→</span>
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 animate-text-wave"
                        style={{ animationDelay: '1.2s' }}
                      />
                    </span>
                  </div>
                </div>

                <div className="relative w-full h-96 overflow-hidden rounded-sm shadow-2xl opacity-90 transition-opacity duration-500 group-hover:opacity-100">
                  {leadArticle.imageUrl && (
                    <Image
                      src={leadArticle.imageUrl}
                      alt={leadArticle.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                </div>

                <h3 className="text-3xl md:text-4xl font-light leading-[1.15] tracking-tight text-white/90 transition-colors duration-300 group-hover:text-white">
                  {leadArticle.title}
                </h3>

                <p className="text-[15px] md:text-[17px] font-light leading-[1.7] text-white/55 transition-colors duration-300 group-hover:text-white/65">
                  {leadArticle.excerpt}
                </p>
              </div>
            </a>

            <div className="relative bg-black flex flex-col pl-0 lg:pl-12 py-8">
              <div
                className={`relative overflow-x-hidden ${
                  shouldRotate ? (openArticleUrl ? 'overflow-y-auto' : 'overflow-hidden') : ''
                }`}
                style={
                  shouldRotate && itemHeight
                    ? { height: itemHeight * visibleCount }
                    : undefined
                }
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div
                  className="space-y-0"
                  style={
                    shouldRotate && itemHeight
                      ? {
                          transform: isAnimating ? `translateY(-${itemHeight}px)` : 'translateY(0px)',
                          transition: isAnimating
                            ? `transform ${animationDuration}ms ease-in-out`
                            : 'none',
                        }
                      : undefined
                  }
                >
                  {renderArticles.map((article, index) => {
                    const isOpen = openArticleUrl === article.url;
                    const lastVisibleIndex = shouldRotate
                      ? isAnimating
                        ? visibleCount
                        : visibleCount - 1
                      : renderArticles.length - 1;
                    const isLast = index === lastVisibleIndex;
                    return (
                      <div
                        key={`${article.url}-${index}`}
                        ref={index === 0 ? itemRef : undefined}
                        className={`transition-all duration-300 ease-out hover:border-white/[0.12] ${
                          isLast ? '' : 'border-b border-white/[0.08]'
                        }`}
                      >
                        <button
                          onClick={() => toggleArticle(article)}
                          className="w-full text-left py-6 group"
                        >
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex flex-col gap-2">
                              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                                {article.publisher}
                              </span>
                              <span className="text-[15px] md:text-[16px] font-light text-white/90 line-clamp-2">
                                {article.title}
                              </span>
                            </div>
                            <svg
                              className={`h-4 w-4 shrink-0 transition-all duration-300 ease-out ${
                                isOpen ? 'rotate-45 text-white/70' : 'rotate-0 text-white/30'
                              } group-hover:text-white/70`}
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
                        <div
                          className={`overflow-hidden transition-all duration-500 ease-out ${
                            isOpen ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div
                            className={`pt-2 pb-8 space-y-4 transition-all duration-300 ease-out ${
                              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                                {formatDate(article.date)}
                              </span>
                              <div className="h-px w-6 bg-white/10" />
                              <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                                {article.publisher}
                              </span>
                            </div>

                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm grayscale hover:grayscale-0 transition-all duration-700">
                                {article.imageUrl && (
                                  <Image
                                    src={article.imageUrl}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                            </a>

                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <h4 className="text-[17px] md:text-[19px] font-light leading-tight tracking-tight text-white/90 hover:text-white transition-colors">
                                {article.title}
                              </h4>
                            </a>

                            <p className="text-[14px] md:text-[15px] font-light leading-[1.7] text-white/55 line-clamp-4">
                              {article.excerpt}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-10">
                <Link
                  href="/press"
                  className="text-xs uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors group"
                >
                  <span className="relative inline-flex items-center gap-2 overflow-hidden">
                    <span className="relative z-10">View All Press Coverage</span>
                    <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 animate-text-wave"
                    />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* As Featured In Section - On Bottom */}
        <div>
          <p className="text-[11px] font-light tracking-[0.2em] uppercase text-white/30 mb-12">
            AS FEATURED IN
          </p>
          <div className="pb-6">
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-10 lg:grid lg:grid-cols-6 lg:gap-x-16 lg:gap-y-12 lg:justify-items-center">
              {partners.map((partner, index) => {
                const colSpanClass = index >= 6 ? 'lg:col-span-3' : 'lg:col-span-2';
                return (
                  <div
                    key={partner.name}
                    className={`partner-logo-wrapper relative opacity-90 hover:opacity-100 transition-opacity duration-500 ${partner.wrapperClass} ${colSpanClass}`}
                  >
                    <Image
                      src={partner.src}
                      alt={partner.name}
                      fill
                      className={`object-contain filter brightness(0) invert(1) ${
                        logoAdjustments[partner.name] ?? ''
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
