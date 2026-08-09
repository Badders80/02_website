import React from "react";

interface PressArticle {
  headline: string;
  url: string;
  publisher: string;
  datePublished: string;
}

interface StructuredDataProps {
  pressArticles?: PressArticle[];
}

/**
 * StructuredData Component
 *
 * Generates JSON-LD structured data for SEO purposes.
 * Includes Organization schema with press mentions to help search engines
 * associate external articles with your brand.
 */
export function StructuredData({ pressArticles = [] }: StructuredDataProps) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Evolution Stables",
    alternateName: "Evolution Stables NZ",
    url: "https://www.evolutionstables.nz",
    logo: "https://www.evolutionstables.nz/images/brand/legacy/legacy-logo-gold-favicon.png",
    description:
      "Digital-syndication platform for racehorse ownership. Making racehorse ownership accessible, transparent, and liquid through regulated settlement infrastructure and modern technology.",
    foundingDate: "2024",
    sameAs: [
      "https://x.com/EvolutionStables",
      "https://www.linkedin.com/company/evolution-stables",
      "https://instagram.com/evostables",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "alex@evolutionstables.nz",
      contactType: "Customer Service",
    },
    areaServed: {
      "@type": "Place",
      name: "New Zealand",
    },
    keywords: [
      "racehorse ownership",
      "digital syndication",
      "real world assets",
      "RWA",
      "fractional ownership",
      "New Zealand racing",
      "NZTR",
      "regulated investment",
      "authorised syndicator",
      "Singularry",
    ],
    // Add press mentions if provided
    ...(pressArticles.length > 0 && {
      subjectOf: pressArticles.map((article) => ({
        "@type": "NewsArticle",
        headline: article.headline,
        url: article.url.startsWith("http") ? article.url : `https://www.evolutionstables.nz${article.url}`,
        publisher: {
          "@type": "Organization",
          name: article.publisher,
        },
        datePublished: article.datePublished,
      })),
    }),
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Evolution Stables",
    url: "https://www.evolutionstables.nz",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
    </>
  );
}
