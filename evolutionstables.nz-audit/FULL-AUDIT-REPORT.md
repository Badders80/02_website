# SEO Full Audit — evolutionstables.nz

**Date:** 2026-07-13  
**URL:** https://www.evolutionstables.nz (live host)  
**Business type:** Digital marketplace / regulated fractional racehorse ownership (NZ-first, fintech + racing)  
**Scope:** Live crawl of homepage, robots, sitemap (49 URLs), key templates, sample horse pages, all 34 insight URLs word-count pass  
**Reference:** PH Digital pitch (Jan 2026) + market emails (AI/decision visibility) + prior internal SEO plan/content sprint  

---

## Executive summary

| Metric | Score |
|--------|------:|
| **SEO Health Score** | **56 / 100** |
| Technical SEO | 62 |
| Content Quality | 44 |
| On-Page SEO | 58 |
| Schema / Structured Data | 52 |
| Performance (CWV) | 50* |
| AI Search Readiness | 55 |
| Images | 72 |

\*PageSpeed Insights API quota exhausted (429) — performance scored as neutral/unknown; HSTS present, Vercel edge cache HIT on homepage.

### vs PH Digital (Jan 2026)

| PH finding (Jan) | Status now (Jul) |
|------------------|------------------|
| ~4 organic keywords / ~0 traffic | Cannot verify rankings live without GSC; **site inventory vastly improved** |
| No SERP features / thin presence | Org + FAQ + Article + Product schema present; FAQ rich results largely retired by Google (May 2026) |
| Need SEO/GEO/AI foundation first | **Partially done** — insights hub, FAQ, AI bot allows |
| Keywords: fractional ownership, digital syndicate, how to invest | **Guides exist** under `/insights/*` — not yet dedicated money landings |
| Educate + credibility content | 34 insight URLs; many still **thin** |

**Bottom line:** You are no longer “invisible by design.” Technical floor is OK. Growth is blocked by **host/canonical conflict**, **sitemap/robots mismatch**, **thin conversion + content pages**, and **schema noise**. Highest ROI is fix crawl signals + flesh horse/marketplace pages + deepen 5–8 decision guides for AI/SERP.

---

## Top 5 critical / high issues

1. **Canonical host ≠ live host** — Apex `https://evolutionstables.nz` 307-redirects to `https://www.evolutionstables.nz`, but `metadataBase`, canonicals, sitemap, and JSON-LD all use **non-www**. Split signals for Google.  
2. **`/mystable` in sitemap while `robots.txt` Disallow** — and page is thin, auth-y, with **canonical pointing at homepage**.  
3. **Marketplace horse pages are SEO-empty** (~40 words, **no H1**, Product schema with **price 0.00 / OutOfStock / offerCount 0**). Conversion + SEO leak.  
4. **FAQPage JSON-LD injected sitewide** from root layout (every page, including marketplace). Wrong scope; FAQ rich results retired for most sites May 2026 — keep FAQ only on `/faq` (+ maybe home) for AI citability.  
5. **~30/34 insight articles thin** (press summaries + race reports ~150–300 words). Risk of soft content / low ranking / weak AI citation.

### Top 5 quick wins

1. Unify host to **www** (or apex) everywhere: metadataBase, sitemap, StructuredData, OG.  
2. Remove `/mystable` and `/brand-guidelines` from sitemap (or noindex brand guidelines).  
3. Absolute URLs only in JSON-LD (`subjectOf` still has relative paths).  
4. Stop global `FAQStructuredData` in `layout.tsx` — page-scoped only.  
5. Add primary nav links to `/insights`, `/faq`, `/marketplace` from homepage (homepage currently barely links them).

---

## 1. Technical SEO (62)

### What works
- HTTPS + HSTS (`max-age=63072000`)
- `robots.txt` present; AI crawlers explicitly allowed (GPTBot, PerplexityBot, ClaudeBot, Google-Extended, etc.)
- Sitemap present (49 URLs), auto-includes insights + marketplace horses
- Homepage prerendered (`x-nextjs-prerender: 1`), cache HIT
- `lang="en-NZ"`
- Private areas disallowed: `/api/`, `/auth`, `/admin`

### Findings

| Severity | Finding | Evidence |
|----------|---------|----------|
| **Critical** | Host mismatch: www live, apex canonical/sitemap | Apex → 307 Location: `https://www.evolutionstables.nz/`; canon `https://evolutionstables.nz` |
| **High** | Sitemap lists `/mystable` but robots Disallow | sitemap.ts L48–51; robots Disallow `/mystable` |
| **High** | Relative URLs in Organization `subjectOf` | e.g. `/insights/...`, `/updates/prudentia_...html` |
| **Medium** | Weak security headers | Only HSTS observed; no CSP / X-Frame-Options / X-Content-Type-Options / Referrer-Policy |
| **Medium** | Brand guidelines indexable + in sitemap | `/brand-guidelines` priority 0.4 |
| **Low** | Sitemap uses apex host | Same host decision as canonical |

### Robots.txt (live)
```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /auth
Disallow: /mystable
Disallow: /admin
# + AI bots Allow
Sitemap: https://evolutionstables.nz/sitemap.xml
```

---

## 2. Content quality (44)

### Inventory (sitemap)
| Section | Count | Notes |
|---------|------:|-------|
| Core pages | 8 | home, press, insights, faq, brand-guidelines, mystable, privacy, terms |
| Insights articles | 34 | guides + press summaries + race reports + team |
| Marketplace | 1 + 6 horses | listings live |

### Word-count pass (full HTML text; chrome inflated — relative depth still clear)

| Band | Count | Examples |
|------|------:|----------|
| Critical thin (~40 words) | 6 horse pages | marketplace/* no real copy |
| Thin (&lt;400) | ~30 insights | press summaries, race reports, some guides |
| OK-ish (400–600) | 2 | syndication explained, cost guide |
| Solid (800+) | 2 | team-evolution, RWA thought piece |

### PH Digital keyword coverage

| Target theme | On-site coverage |
|--------------|------------------|
| Fractional / digital ownership NZ | Partial — homepage + guides; **no** `/fractional-ownership` money page |
| How to buy a racehorse share | **Yes** — `/insights/how-to-buy-a-racehorse-share-in-nz` (~384 words) |
| Cost of ownership NZ | **Yes** — cost guide (~528 words) |
| Digital vs traditional syndicate | **Yes** — comparison guide (thin-ish ~351) |
| How to invest in a racehorse | Partial — not exact slug |
| Authority / trainers / proof | **Yes** — team-evolution, race reports (thin) |

### E-E-A-T
- **Experience:** Founder voice + live horse campaigns (Prudentia, First Gear) — good signal when expanded.  
- **Expertise:** Regulated RWA / Tokinvest / NZTR keywords present.  
- **Authority:** External press linked; internal summaries often too short to stand alone.  
- **Trust:** Risk language in FAQ good; marketplace $0 Product offers **hurt** trust/schema.

---

## 3. On-page SEO (58)

### Homepage
- Title/description/OG present and on-brand  
- H1 present  
- Schema: Organization, WebSite, FAQPage  
- **Internal links weak:** crawlable paths mostly `/marketplace`, `/mystable`, `/press`, `/privacy`, `/terms` — **not** `/insights` or `/faq` as primary IA  
- ~945 words of page text (acceptable for home)

### Titles
- Template `%s | Evolution Stables` causes **double brand** when page title already includes brand: e.g. `Press & Media | Evolution Stables | Evolution Stables`, `Marketplace | Evolution Stables | Evolution Stables`, `Brand Guidelines | Evolution Stables | Evolution Stables`

### Thin conversion surfaces
| Page | Issue |
|------|--------|
| `/marketplace` | ~155 words; vague H1 “Ownership, evolved.” |
| `/marketplace/{horse}` | ~40 words, **no H1**, JS-heavy listing shell |
| `/mystable` | Auth dashboard; should not compete in organic |

### Missing money landings (PH-aligned)
- `/how-it-works` → 404 (content only as homepage sections)  
- `/fractional-ownership`, `/racehorse-ownership`, `/invest` → 404  
- Insights guides partly cover intent but sit under `/insights/` (weaker commercial URL architecture)

---

## 4. Schema / structured data (52)

| Type | Where | Quality |
|------|-------|---------|
| Organization | Global | Good; fix relative `subjectOf` URLs |
| WebSite | Global | Basic; no SearchAction |
| FAQPage | **Global (layout)** | Over-applied |
| FAQPage | `/faq` | Appropriate (duplicate with global) |
| Article | Insight posts | Present |
| Product | Horse pages | Present but **broken commercially** (price 0, OutOfStock, empty offers) |

**Note:** Google retired FAQ rich results for most sites (May 2026). Keep FAQ schema for LLM/AEO citability on FAQ content only — not for SERP stars.

---

## 5. Performance (50*)

- PSI API: **quota exceeded** this run — re-check later via GSC CrUX or PSI.  
- Positive: edge cache, prerender, HSTS.  
- Risk areas to measure: LCP on hero video/image, marketplace client hydration, font loading.

---

## 6. AI search readiness / GEO (55)

### What works
- AI bots allowed in robots  
- Some citable passages (FAQ answers, cost/syndication guides, RWA essay)  
- Organization entity + sameAs (X, LinkedIn, Instagram)

### Gaps
- **No `llms.txt`** (404)  
- Thin press/race pages = weak citation targets  
- Decision content incomplete: comparisons/trade-offs/proof tables still light (PH: “content must survive summarisation”)  
- Brand clarity in AI answers unknown — run prompt battery (ChatGPT / Perplexity / AI Overviews)

### Recommended AI visibility prompts
1. “How do I buy a racehorse share in New Zealand?”  
2. “What is digital racehorse syndication?”  
3. “Best fractional racehorse ownership platforms NZ”  
4. “How much does it cost to own a racehorse in NZ?”  
5. “Evolution Stables vs traditional syndicate”  
6. “Is Evolution Stables NZTR authorised?”  

---

## 7. Images (72)

- Sampled insight/guides: images present with alt attributes  
- Marketplace: few images, limited context  
- OG image route works (`/opengraph-image`)

---

## 8. Conversion / SXO (PH: “ads work, website doesn’t”)

Even without paid traffic: organic that lands on marketplace horse pages sees **almost no indexable explanation** of risk, term, cost, trainer, or CTA narrative. Product schema says **OutOfStock / $0**. That matches PH’s leak story: acquisition without commercial page depth fails.

---

## Category scores (detail)

| Category | Weight | Score | Weighted |
|----------|-------:|------:|---------:|
| Technical SEO | 22% | 62 | 13.6 |
| Content Quality | 23% | 44 | 10.1 |
| On-Page SEO | 20% | 58 | 11.6 |
| Schema | 10% | 52 | 5.2 |
| Performance | 10% | 50 | 5.0 |
| AI Search | 10% | 55 | 5.5 |
| Images | 5% | 72 | 3.6 |
| **Total** | | | **≈ 54.6 → 56** |

---

## Synthesis (PH + audit)

| PH principle | Site reality | Next move |
|--------------|--------------|-----------|
| SEO before heavy paid | Correct priority still | Finish foundation before scaling ads |
| Decision visibility | Partial guides; thin elsewhere | Deepen 5–8 decision pages |
| Content survives summarisation | Weak on most insights | Comparisons, costs, trade-offs, proof |
| Brand clarity for AI | OK keywords; entity messy (www) | Host unify + llms.txt + entity pages |
| Conversion quality | Horse pages empty | Treat listings as commercial landings |

---

## Limitations

- No GSC/GA4/CrUX this run (auth/quota)  
- No live SERP rank export  
- Word counts include chrome/nav; relative thinness still valid  
- Did not run full Lighthouse lab or visual screenshots  
