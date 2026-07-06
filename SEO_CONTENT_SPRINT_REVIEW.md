# SEO Content Sprint Spec — Concept Review

**Reviewer:** Kimi subagent (concept review)  
**Spec reviewed:** `/home/evo/evo_01/02_website/SEO_CONTENT_SPRINT_SPEC.md`  
**Date:** 2026-07-06  
**Verdict:** **CONDITIONAL GO** — strategy is directionally right, but several categories need rebalancing, legal guardrails, and technical corrections before execution.

---

## 1. STRATEGY — Is this the right approach to close the content gap?

**Verdict: WARN**

The sprint correctly identifies that Evolution Stables has a material content deficit versus a well-funded competitor and proposes a publishable volume of pages. However, the mix is heavily weighted toward low-search-volume, time-bound content.

| What works | What’s off |
|---|---|
| 5 original evergreen SEO guides directly target buyer-intent queries. | 15 race reports from 2025/2026 investor emails are mostly historical/retrospective (First Gear is retired; several Prudentia races are old). They add page count, not necessarily search demand. |
| 12 press summaries leverage existing third-party credibility. | 12 press summaries from crypto/RWA/blockchain sources will require heavy rewrites to stay on-brand; several may have little NZ audience search intent. |
| 1 team profile builds authority by association. | Missing a content hub/insights index page that ties the pieces together and prevents orphan pages. |

**Recommendations:**
1. **Rebalance the portfolio.** Treat the 5 guides and the team profile as P0. Treat race reports as P1/P2 and publish the strongest 5–7 first, not all 15.
2. **Add current-horse content.** Prudentia, Hottathanafantasy, I Stole A Manolo, and TLM x Yearn need individual syndicate pages or horse profiles with JSON-LD. These are likely higher commercial intent than old race reports.
3. **Cut or merge weak press summaries.** Articles that are primarily about Tokinvest corporate news (pre-seed raise, VARA licence) should be combined into a single "Tokinvest & Evolution: the regulated platform" explainer rather than 4 separate thin pages.
4. **Add a hub page.** `/insights` should be a real index listing categories: Guides, Press Commentary, Race Reports, Team. This turns isolated pages into a structured section.

---

## 2. SEARCH INTENT — Are the 5 original guide topics right?

**Verdict: PASS with additions**

The 5 guide topics cover the core commercial funnel well:

| Guide | Target query | Intent fit |
|---|---|---|
| Cost to own a racehorse NZ | `"cost to own a racehorse NZ"` | High — price-aware prospect |
| Racehorse syndication explained NZ | `"racehorse syndication NZ"` | High — research phase |
| How prize money works in NZ racing | `"prize money NZ racing"` | Medium — owner/investor education |
| Digital vs traditional syndication | `"digital syndication vs traditional"` | Medium — comparison/buyer |
| How to buy a racehorse share NZ | `"buy racehorse share NZ"` | High — transactional |

A user searching `"racehorse ownership NZ"` would find value in the cost, syndication, and "how to buy" guides. The sprint does not miss the query entirely, but it does not target it explicitly.

**Missing search queries/terms to add:**
- `"racehorse ownership NZ"` (create a dedicated guide or title variant)
- `"NZ racehorse syndicate"`
- `"thoroughbred syndication New Zealand"`
- `"invest in a racehorse NZ"`
- `"racehorse shares for sale NZ"`
- `"how does racehorse syndication work NZ"`
- `"racehorse leasing NZ"`
- `"Evolution Stables Tokinvest"` (brand/defensive SEO)
- `"Wexford Stables Lance O'Sullivan"` (authority/trainer brand)

**Recommendations:**
1. Add one additional guide: **"Racehorse Ownership in New Zealand: A Beginner’s Guide"** targeting `"racehorse ownership NZ"`.
2. Use the missing terms as H2s and related-question anchors inside the existing guides.
3. Include an FAQ within each guide addressing the exact question form people search (e.g., "How much does it cost to own a racehorse in New Zealand?").

---

## 3. CONTENT QUALITY RISK — Writing 32 articles in Alex’s voice without his direct input

**Verdict: FAIL without a revised approval gate**

Writing in a founder’s voice at scale without the founder is high risk: voice drift, misattributed opinions, factual overreach, and legal/regulatory misstatements. The current review checklist is a good start but insufficient.

**Specific risks:**
- **Misattribution:** Author JSON-LD and bylines will point to Alex. If he has not read and approved every line, the site is effectively putting words in his mouth.
- **Regulatory claims:** Articles about VARA, NZTR, tokenisation, and returns are sensitive. A misstatement about VARA’s scope or Evolution’s licensing status could create compliance issues.
- **Press-summary drift:** Summarising crypto/RWA press articles in Alex’s voice risks importing vocabulary the brand explicitly bans ("tokenised", "blockchain", "crypto", "payout").
- **Thin content:** 12 press summaries at 300–500 words could be perceived by Google as thin or duplicate if they mostly recap existing articles.

**"Localising press articles" — legally sound?**

**Conditional yes.** It is legally sound **only if** the articles are:
- Clearly labelled as summaries/commentary, not original reporting.
- Link prominently to the source.
- Do not reproduce paywalled or substantial portions of the original text.
- Do not alter the original publisher’s meaning or invent quotes.
- Avoid implying endorsement by the original publisher.

If "localise" means rewriting the full article in Alex’s voice, it is **not sound** and risks copyright, defamation, and misrepresentation issues.

**Recommendations:**
1. **Two-stage byline:** Draft as **"Evolution Stables"**; change to **"Alex Baddeley"** only after Alex ticks the approval checkbox.
2. **Expand the review checklist:** Add a "Voice & Vocabulary" audit column, a "Regulatory claim" column, and a "Source link verified" column.
3. **Mandatory approval for:** guides, team profile, and any press summary that makes a regulatory or financial claim. Race reports can be batch-approved if they stick to facts.
4. **Automated guardrails:** Run every article through a banned-word scan (`tokenised`, `tokenization`, `crypto`, `blockchain`, `payout`, `profit`, `guaranteed return`, `pieces`, `horses`) before it reaches Alex.
5. **Add a disclaimer on press-summary pages:** "This is a summary and commentary. Read the full original article at [source]."

---

## 4. TECHNICAL — Is "crawlable but not navigable" correct for SEO?

**Verdict: FAIL as currently specified**

The spec says Category 1–2 pages will be "in sitemap, NOT in nav" and "users won’t find via clicking." That describes orphan pages. Google can index pages discovered via sitemap, but pages with no internal links typically receive less crawl budget, weaker relevance signals, and are more likely to be demoted or ignored.

**Key technical points:**
- **Sitemap inclusion:** Yes, all 32 articles should be in the sitemap.
- **Orphan risk:** Category 1–2 pages need at least one internal link from a hub/index page (e.g., `/insights` filtered by category) or from related articles. Relying only on sitemap is weak.
- **Noindex is not needed:** If they are quality pages, let them be indexed. Do not noindex them.
- **Navigation:** It is fine that they are not in the top-level nav. They should be in the **insights hub** navigation.
- **Doorway-page risk:** 12 thin press summaries with no internal links could look like doorway content if they all target similar long-tail variants.

**Recommendations:**
1. Build `/insights` as a real category hub and link every article from it.
2. Add a "Related articles" component to every article page using tag-based matching.
3. Link Category 3 guides into the footer and main nav under "Guides" or "Learn."
4. Use `rel="nofollow ugc"` only if user-generated; not needed here.
5. Submit the updated sitemap to Google Search Console after deploy (already noted in spec).

---

## 5. COMPETITIVE — Is racex.ae the right benchmark?

**Verdict: WARN**

Racex.ae is a useful **volume benchmark** but a poor **strategy benchmark** for a New Zealand audience.

**Why it is a weak primary benchmark:**
- Racex operates in Dubai under VARA with an Arabic/English audience.
- It is positioned around crypto/blockchain/tokenisation — vocabulary Evolution avoids.
- Its buyer journey, regulation, and syndication mechanics differ from NZ.

**More relevant NZ competitors to analyse:**
- The Racehorse Syndicate / NZ-based thoroughbred syndicators
- New Zealand Bloodstock’s syndication channels
- Individual trainer/stable syndication pages (e.g., Wexford Stables, Stephen Gray Racing)
- General racehorse ownership education sites (NZTR, RaceBase, Trackside)

**What racex does that this spec does not address:**
- Rich individual horse pages with video, stats, and ownership tiers.
- Bilingual content.
- Strong visual/embedded media.
- Marketplace-style listings with clear call-to-action and pricing.
- Active news cadence tied to current race meetings.

**Recommendations:**
1. Keep racex.ae as a **content-volume reference** only.
2. Add a NZ competitor content audit to the sprint: identify what local syndicators rank for and where the gaps are.
3. Benchmark against NZTR and leading trainer sites for "racehorse ownership NZ" SERPs.
4. Note the spec already acknowledges video and bilingual gaps; add a recommendation to produce short video clips or embed existing Wexford/Stephen Gray videos once file size/compression is handled.

---

## 6. BRAND SAFETY — Risk of brand voice drift across 32 articles

**Verdict: WARN**

The spec has a good brand-voice section but executing it across 32 articles without direct founder input is hard. The biggest risk is **vocabulary slippage**: source press articles naturally use "tokenisation", "blockchain", "crypto", "payout" — all banned. A subagent summarising those sources will repeatedly have to translate concepts, and errors will slip through.

**Additional risks:**
- **Authoritative We** can become generic corporate "we" if not calibrated with real Alex quotes.
- **Silent Gavel** (no justification, no negation, no legitimacy-convincing) is subtle and easy to violate when explaining why digital syndication is better than traditional.
- **Horse vs thoroughbred** will repeatedly regress to "horse" in race reports.
- **Dollar returns/yields** may leak in when describing prize-money distribution.

**Recommendations:**
1. Create a **Voice Calibration Document** with 5–10 real Alex paragraphs from LinkedIn, NZ Entrepreneur, and investor emails, annotated for what makes them sound like him.
2. Implement a **pre-publication lint** that checks every article against the banned word list and Silent Gavel patterns ("unlike traditional…", "we are not a crypto…", "you might think…").
3. Use a **two-author model**: initial author = "Evolution Stables"; upon Alex approval, switch author schema to Alex Baddeley/LinkedIn URL.
4. Run a **brand-voice spot check** on 3 random articles before approving the full batch.
5. Include a **final Silent Gavel compliance statement** in the review checklist for each article.

---

## 7. GAPS — What’s missing from the spec?

**Verdict: WARN / several additions needed**

### Content gaps
- **Current horse/syndicate pages:** No individual pages for active HLTs/syndicates beyond race reports. These are likely the highest-intent pages.
- **Comparison / why-evolution content:** No page comparing Evolution’s model to traditional NZ syndicates.
- **Glossary of racing terms:** Useful for SEO and user education; could be one guide or a separate `/glossary`.
- **Investor testimonial/social proof:** Press coverage helps, but owner/investor quotes would build trust.
- **Regulatory explainer separate from VARA/Tokinvest press:** A plain-English page on "How Evolution Stables is regulated" (NZTR + VARA) without combining them in consumer copy.

### Process gaps
- **KPIs and measurement:** The spec has no targets for rankings, traffic, conversions, or indexing. Add a measurement plan.
- **Promotion/distribution plan:** Publishing 32 pages is not enough. Plan: LinkedIn posts, email to existing investors, potential PR outreach, and Search Console monitoring.
- **Content refresh cadence:** Race reports date quickly. Plan to update/redirect stale race reports.
- **Risk register:** Legal, voice, technical, and competitive risks should be listed with owners.
- **Author schema:** Spec notes this as a gap; it should be required, not optional.
- **Related-articles / internal linking:** Spec notes this as a gap; implement before publish.
- **FAQPage schema for the FAQ page:** Spec mentions the FAQ page but not FAQPage JSON-LD. Add it.

### Suggested removals
- Do not publish all 15 race reports in one sprint. Phase them.
- Do not publish 12 separate Tokinvest/Evolution press summaries if they overlap; merge the 4 Tokinvest-centric items into one deeper piece.

---

## SUMMARY TABLE

| Section | Verdict | Top action |
|---|---|---|
| 1. Strategy | WARN | Rebalance toward evergreen guides + current horse pages; add insights hub. |
| 2. Search intent | PASS | Add a guide targeting `"racehorse ownership NZ"` and fill missing H2 terms. |
| 3. Content quality risk | FAIL | Add a real approval gate, banned-word lint, and source-disclaimer before any article is attributed to Alex. |
| 4. Technical | FAIL | Link Category 1–2 from `/insights` hub and add related-articles internal links; sitemap alone is not enough. |
| 5. Competitive | WARN | Treat racex.ae as volume reference only; audit NZ syndicator/trainer sites. |
| 6. Brand safety | WARN | Create voice calibration doc + automated lint; use two-stage byline until Alex approves. |
| 7. Gaps | WARN | Add KPIs, distribution plan, current-horse pages, FAQPage schema, and risk register. |

---

## RECOMMENDED REVISED EXECUTION ORDER

1. **Voice calibration document + brand lint rules** (P0)
2. **Insights hub page** (`/insights`) (P0)
3. **5 original SEO guides + team profile** (P0)
4. **Current-horse syndicate pages** (P0)
5. **7 best race reports** (P1)
6. **Merged Tokinvest/platform explainer + 4–5 strongest press summaries** (P1)
7. **Remaining race reports and press summaries** (P2)
8. **Internal linking, related articles, FAQPage schema, sitemap, Search Console submit** (P0)
9. **Alex approval pass + Silent Gavel audit** (P0 gate)
10. **Deploy + measure** (P0)

---

**Overall recommendation:** Approve the sprint direction, but require the above revisions to content mix, approval workflow, internal linking, and competitive benchmarking before any articles are published.
