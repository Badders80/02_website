# SEO Optimisation Plan — evolutionstables.nz

**Date:** 2026-06-17  
**Status:** 🟡 Ready to implement  
**Target:** Lighthouse SEO = 100, rich results eligibility, crawl efficiency

---

## Table of Contents

1. [Sitemap Fixes](#1-sitemap-fixes)
2. [Missing Page Metadata](#2-missing-page-metadata)
3. [Structured Data Improvements](#3-structured-data-improvements)
4. [Image Alt Text & LCP Optimisation](#4-image-alt-text--lcp-optimisation)
5. [Breadcrumb Structured Data](#5-breadcrumb-structured-data)
6. [Crawl Budget & Robots.txt](#6-crawl-budget--robotstxt)
7. [Performance Considerations](#7-performance-considerations)
8. [Implementation Order](#8-implementation-order)

---

## 1. Sitemap Fixes

### Problem
`sitemap.ts` includes `/demo` and `/updates` routes that don't exist (return 404s). Missing `/privacy` and `/terms`.

### File
`src/app/sitemap.ts`

### Implementation

Replace the current `sitemap()` function with:

```typescript
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
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  if (isMarketplaceProductionStage()) {
    routes.push({
      url: `${baseUrl}/marketplace`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  return routes;
}
```

**Changes:**
- Remove `/demo` (404)
- Remove `/updates` (404)
- Add `/privacy` (priority 0.3)
- Add `/terms` (priority 0.3)

---

## 2. Missing Page Metadata

### Problem
`/privacy` and `/terms` pages have no `export const metadata`, so they inherit the default title "Evolution Stables - Digital Racehorse Ownership | Tokenized RWA Platform" — misleading for legal pages.

### Files
- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`

### Implementation

Add to **both** files, just above the component function:

**`src/app/privacy/page.tsx`:**
```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Evolution Stables privacy policy. Learn how we collect, use, and safeguard your personal information when you use our digital-syndication platform.",
  alternates: {
    canonical: "/privacy",
  },
};
```

**`src/app/terms/page.tsx`:**
```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Evolution Stables terms of service governing the use of our digital-syndication platform for racehorse ownership. Includes investment risk disclosures.",
  alternates: {
    canonical: "/terms",
  },
};
```

---

## 3. Structured Data Improvements

### 3a. Press Article URLs — Absolute vs Relative

**Problem:** `press-articles.ts` uses relative paths like `/updates/...` for internal articles. The `StructuredData` component passes these directly into JSON-LD as `url` values. Google may not resolve relative URLs in structured data correctly.

**File:** `src/components/seo/StructuredData.tsx`

**Fix:** In the `StructuredData` component, prefix relative URLs with the site base URL:

```typescript
const baseUrl = "https://evolutionstables.nz";

// In the pressArticles.map():
subjectOf: pressArticles.map((article) => ({
  "@type": "NewsArticle",
  headline: article.headline,
  url: article.url.startsWith("http") ? article.url : `${baseUrl}${article.url}`,
  publisher: {
    "@type": "Organization",
    name: article.publisher,
  },
  datePublished: article.datePublished,
})),
```

### 3b. Add BreadcrumbList Structured Data

**Problem:** No breadcrumb schema exists. Breadcrumbs help Google understand site hierarchy and can enable rich results in SERPs.

**New file:** `src/components/seo/BreadcrumbStructuredData.tsx`

```typescript
import React from "react";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbStructuredData Component
 *
 * Generates JSON-LD BreadcrumbList structured data.
 * Usage: <BreadcrumbStructuredData items={[
 *   { name: "Home", url: "/" },
 *   { name: "Press", url: "/press" },
 * ]} />
 */
export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  if (!items || items.length === 0) return null;

  const baseUrl = "https://evolutionstables.nz";

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
```

**Usage in pages:**

In `src/app/layout.tsx`, add a default breadcrumb for the homepage:
```typescript
import { BreadcrumbStructuredData } from "@/components/seo/BreadcrumbStructuredData";

// In the <head> section, after <StructuredData ... />:
<BreadcrumbStructuredData items={[{ name: "Home", url: "/" }]} />
```

In `src/app/press/page.tsx`, add page-specific breadcrumbs:
```typescript
// In the component, inside the <main>:
<BreadcrumbStructuredData items={[
  { name: "Home", url: "/" },
  { name: "Press & Coverage", url: "/press" },
]} />
```

---

## 4. Image Alt Text & LCP Optimisation

### 4a. Decorative Background Images

**Problem:** `FixedBg` and `GrassBg` components pass descriptive alt text like "Horse hooves background" to decorative images. This dilutes meaningful alt text for screen readers and adds noise to image SEO.

**Files:**
- `src/components/ui/FixedBg.tsx`
- `src/components/ui/GrassBg.tsx`

**Fix:** Change default `alt` to empty string:

**`FixedBg.tsx`:**
```typescript
export function FixedBg({ src, height = "h-[50vh]", alt = "" }: FixedBgProps) {
```

**`GrassBg.tsx`:**
```typescript
export function GrassBg({ src, alt = "" }: GrassBgProps) {
```

**Usage in `src/app/page.tsx`:** Remove the `alt` prop from all `FixedBg` and `GrassBg` calls since the default is now `""`:
```typescript
<FixedBg src="/images/Background-hooves-back-and-white.jpg" height="h-[50vh]" />
<FixedBg src="/images/Landscape-digitaloverlay.jpg" height="h-[50vh]" />
<FixedBg src="/images/Horse-and-foal.jpg" height="h-[50vh]" />
<GrassBg src="/images/Hooves-on-grass.png" />
```

### 4b. Hero Image LCP Optimisation

**Problem:** The hero image in `HeroSection.tsx` already has `priority` and `sizes="100vw"` — good. But verify `fetchpriority="high"` is set.

**File:** `src/components/sections/HeroSection.tsx`

**Check:** The `<Image>` component already has:
- `priority` ✅ (enables `fetchpriority="high"` automatically in Next.js)
- `fill` ✅
- `sizes="100vw"` ✅
- `className="object-cover"` ✅

**No changes needed** — the LCP image is already optimised.

### 4c. Verify No Missing Alt Text on Content Images

**Check:** Search for all `<Image>` usages without `alt` prop.

```bash
grep -r "<Image" src/ --include="*.tsx" | grep -v "alt="
```

If any content images (not decorative) are missing alt text, add descriptive alt text.

---

## 5. Breadcrumb Structured Data

See [Section 3b](#3b-add-breadcrumb-structured-data) above for implementation details.

**Pages that should have breadcrumbs:**

| Page | Breadcrumb Items |
|------|-----------------|
| `/` (homepage) | Home |
| `/press` | Home → Press & Coverage |
| `/marketplace` | Home → Marketplace |
| `/privacy` | Home → Privacy Policy |
| `/terms` | Home → Terms of Service |
| `/auth/login` | Home → Login |
| `/mystable` | Home → My Stable |

---

## 6. Crawl Budget & Robots.txt

### Current State
```typescript
// src/app/robots.ts
disallow: ["/api/", "/auth", "/mystable", "/admin"]
```

### Assessment
The current `robots.txt` is well-configured. `/api/`, `/auth`, `/mystable`, and `/admin` are correctly disallowed. The sitemap URL is correct.

### Potential Addition
If the sandbox pages (`/sandbox/marketplace`, `/sandbox/mystable`) are for development/demo only, consider disallowing them too:

```typescript
disallow: ["/api/", "/auth", "/mystable", "/admin", "/sandbox"]
```

**Note:** Only add `/sandbox` if these pages should not be indexed. If they serve as a public demo, leave them accessible.

---

## 7. Performance Considerations

### 7a. Image Optimisation Audit

Run this command to find all images and verify they have proper attributes:

```bash
# Find all Image components without explicit width/height (fill mode)
grep -rn "<Image" src/ --include="*.tsx" | grep "fill"

# Find all Image components with explicit width/height
grep -rn "<Image" src/ --include="*.tsx" | grep -v "fill"
```

### 7b. Verify No Render-Blocking Resources

The layout uses `next/font/google` for Geist fonts. These are automatically optimised by Next.js (self-hosted, no render-blocking). ✅

### 7c. Check for Unused CSS

Tailwind's JIT compiler already purges unused styles. No action needed. ✅

---

## 8. Implementation Order

### Phase 1 — Quick Wins (5 minutes, highest impact)
1. Add `export const metadata` to `/privacy` and `/terms`
2. Fix sitemap (remove 404 routes, add legal pages)

### Phase 2 — Structured Data (10 minutes)
3. Fix press article URLs in `StructuredData.tsx` (absolute URLs)
4. Create `BreadcrumbStructuredData.tsx` component
5. Add breadcrumbs to layout and key pages

### Phase 3 — Image Quality (5 minutes)
6. Change `FixedBg` and `GrassBg` default `alt` to `""`
7. Remove `alt` prop from decorative image usages in `page.tsx`

### Phase 4 — Polish (5 minutes)
8. Consider adding `/sandbox` to `robots.txt` disallow
9. Run Lighthouse audit to verify SEO = 100

---

## Verification Checklist

After implementing all changes:

- [ ] `npm run build` passes with 0 errors
- [ ] `/privacy` page has correct `<title>` in browser tab
- [ ] `/terms` page has correct `<title>` in browser tab
- [ ] `sitemap.xml` no longer contains `/demo` or `/updates`
- [ ] `sitemap.xml` contains `/privacy` and `/terms`
- [ ] JSON-LD structured data contains absolute URLs for press articles
- [ ] JSON-LD structured data contains `BreadcrumbList`
- [ ] Decorative background images have `alt=""`
- [ ] Lighthouse SEO score = 100
- [ ] Lighthouse Accessibility score improved
- [ ] Google Rich Results Test passes for Organization + FAQ + BreadcrumbList
