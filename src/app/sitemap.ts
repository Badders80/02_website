import { MetadataRoute } from "next";
import { isMarketplaceProductionStage } from "@/lib/marketplace-release-stage";
import { insightArticles } from "@/lib/insights";
import hltsData from "@/data/hlts.json";

/**
 * Sitemap Configuration
 *
 * Generates a sitemap for search engines to crawl your site.
 * This helps with SEO by ensuring all important pages are indexed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://evolutionstables.nz";
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/press`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/brand-guidelines`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/mystable`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Insight article pages
  insightArticles.forEach((article) => {
    routes.push({
      url: `${baseUrl}/insights/${article.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  if (isMarketplaceProductionStage()) {
    routes.push({
      url: `${baseUrl}/marketplace`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    });

    // Dynamic marketplace listing detail pages
    (hltsData as any[]).forEach((hlt) => {
      const slug = hlt.horse_slug || hlt.id;
      if (slug) {
        routes.push({
          url: `${baseUrl}/marketplace/${slug}`,
          lastModified: now,
          changeFrequency: "daily",
          priority: 0.6,
        });
      }
    });
  }

  return routes;
}
