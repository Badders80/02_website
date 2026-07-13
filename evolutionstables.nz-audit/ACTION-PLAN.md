# SEO Action Plan — evolutionstables.nz

**Date:** 2026-07-13  
**Health score:** 56/100  
**Goal:** Crawl consistency → conversion pages → decision content → AI visibility  

Each item: **why** · **how we’d know it failed** · **leading indicator**

---

## Phase 1 — Critical crawl fixes (this week)

### 1.1 Unify host to www (or apex — pick one)
- **Do:** Prefer **www** as live host (already 307 target). Set `metadataBase`, all canonicals, sitemap `baseUrl`, Organization/WebSite JSON-LD, OG urls to `https://www.evolutionstables.nz`.
- **Files:** `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/components/seo/StructuredData.tsx`, any horse Product schema builders.
- **Fail check:** GSC still reports both hosts as separate properties without redirect consolidation.
- **Indicator:** Single preferred domain in GSC; no canonical→redirect loops.

### 1.2 Fix sitemap vs robots
- **Remove** `/mystable` from sitemap.
- **Remove or noindex** `/brand-guidelines` (internal brand asset).
- Keep privacy/terms if desired (low priority).
- **Fail check:** Disallowed URLs still appear in sitemap coverage reports.
- **Indicator:** Sitemap URL count drops; GSC “Submitted URL blocked by robots” clears.

### 1.3 Absolute URLs in JSON-LD
- Prefix every `subjectOf.url` (and any relative paths) with site origin.
- Drop or rewrite dead `/updates/*.html` references if those aren’t canonical public articles.
- **Fail check:** Rich Results Test / schema validator still shows relative URLs.
- **Indicator:** Zero relative `url` fields in Organization JSON-LD.

### 1.4 Scope FAQ schema
- Remove `<FAQStructuredData />` from root `layout.tsx`.
- Keep on `/faq` (and optionally homepage only if FAQ section is visible).
- **Fail check:** FAQPage still on marketplace/horse HTML.
- **Indicator:** View-source on `/marketplace/prudentia` has no FAQPage block.

---

## Phase 2 — Conversion pages (weeks 1–2) — PH “website isn’t working”

### 2.1 Horse listing SEO shell (highest commercial ROI)
For each `/marketplace/{slug}`:
- Real **H1** (horse name + “shares” / ownership framing)
- 300–600 words: pedigree/campaign summary, trainer, term, cost structure, risks, CTA
- Unique meta title/description
- Product/Offer schema only when real price + availability known; **never** `$0` + empty offers if misleading
- If not for sale: use descriptive page + `Offer` omitted or clear “campaign closed” copy — not fake OutOfStock $0

**Fail check:** HTML still &lt;100 words / no H1.  
**Indicator:** Organic landing rate + apply/CTA clicks on listing pages.

### 2.2 Marketplace index
- Expand `/marketplace` copy: how buying works, eligibility, risk, what’s listed.
- Internal links to guides + FAQ.
- **Indicator:** Time on page / scroll depth.

### 2.3 Fix title template doubles
- Page titles should not already end with `| Evolution Stables` if template appends it.
- **Indicator:** No titles matching `* | Evolution Stables | Evolution Stables`.

---

## Phase 3 — Decision content (weeks 2–4) — PH “survive summarisation”

### 3.1 Deepen the money guides (priority order)
| Slug | Target depth | Add |
|------|-------------|-----|
| `how-to-buy-a-racehorse-share-in-nz` | 1200+ words | Steps, KYC, costs, timeline, CTA |
| `how-much-does-it-cost-to-own-a-racehorse-in-nz` | 1200+ | Table of costs, scenarios, Evolution model |
| `digital-vs-traditional-syndication` | 1000+ | Comparison table, trade-offs |
| `racehorse-syndication-explained-nz` | 1000+ | NZTR/authorised framing |
| `how-prize-money-works-in-nz-racing` | 900+ | Worked examples |

### 3.2 Optional money URLs (if ranking stalls under /insights/)
- `/how-it-works`, `/fractional-ownership` as thin wrappers or canonical hubs linking into guides.

### 3.3 Press summaries
- Either expand to 600+ words with original angle + citations, **or** noindex and keep as internal references.
- Prefer expansion for top 5 press pieces with brand search value.

### 3.4 Race reports
- Keep for owners/E-E-A-T but add 400+ words narrative + outcomes; interlink to horse marketplace pages.

**Fail check:** AI answers cite competitors, not Evolution, on cost/how-to queries.  
**Indicator:** Monthly AI prompt battery (6 queries); GSC impressions on guide queries.

---

## Phase 4 — GEO / AI + internal architecture (month 2)

### 4.1 Add `/llms.txt`
- Short brand definition, key URLs (home, marketplace, top guides, FAQ, press), contact, “what we are / are not”.
- **Indicator:** File returns 200; referenced by AI tools over time.

### 4.2 Homepage internal links
- Nav/footer: Insights, FAQ, Marketplace, How it works (anchor or page).
- Pass PageRank to money content.

### 4.3 Entity hygiene
- Consistent NAP/email in schema.
- sameAs complete (add BusinessDesk / Trackside profiles if stable).
- Consider `FinancialService` or clearer Organization subtype only if accurate legally.

### 4.4 AI visibility diagnostic (DIY)
- Monthly: run PH-style prompt set; log whether Evolution appears; note competitors cited.
- Fix content gaps that explain absences.

### 4.5 Performance re-measure
- Run PSI mobile/desktop when quota available; fix LCP/INP if red.

---

## Phase 5 — Monitoring (ongoing)

| Signal | Tool | Cadence |
|--------|------|---------|
| Index coverage / host | GSC | Weekly |
| Guide queries impressions | GSC | Weekly |
| Ranking for 10 seed keywords | GSC or rank tracker | Biweekly |
| AI mention rate | Manual prompts | Monthly |
| Marketplace conversion | Analytics | Weekly |
| Schema errors | GSC enhancements | After deploys |

### Seed keywords (PH + site)
1. racehorse ownership NZ  
2. buy racehorse share NZ  
3. fractional racehorse ownership  
4. digital horse syndicate  
5. how much to own a racehorse NZ  
6. racehorse syndication explained  
7. digital vs traditional syndication  
8. Evolution Stables  
9. invest in racehorse New Zealand  
10. Tokinvest racehorse / digital syndication  

---

## Explicit non-goals (for now)

- Heavy paid Search/PMax until Phase 1–2 done (aligns with PH sequence).  
- AU/UK/UAE geo pages before NZ guides rank.  
- New FAQPage for Google rich results (retired).  
- Mass thin press clones without expansion.

---

## Suggested implementation order (engineering)

1. Host unify + sitemap prune + JSON-LD absolute URLs + FAQ scope (~1–2 hrs)  
2. Title template cleanup (~30 min)  
3. Horse page content + schema honesty (content + eng, 1–2 days)  
4. Guide expansions (content, ongoing)  
5. llms.txt + nav links (~1 hr)  
6. GSC verification + baseline ranks  

**Falsifiability for whole plan:** After 6–8 weeks, if guide impressions and listing engagement are flat despite fixes, re-check indexation and competitor SERP capture before more content volume.
