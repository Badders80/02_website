# SEO Content Sprint Spec — Evolution Stables

**Date:** 2026-07-06
**Author:** GLM-5.2 (orchestrator)
**Status:** DRAFT — pending Nemotron + DeepSeek concept review, then GLM gap review

---

## SPRINT GOAL

Close the content gap with Racex.ae (25+ articles vs our 1) by publishing 30+ SEO-targeted content pages on evolutionstables.nz. All content is written in Alex Baddeley's voice (Founder, Evolution Stables), adhering to the Silent Gavel brand rules. A review document is produced listing every claim, opinion, and voice insertion so Alex can tick each one off before publishing.

---

## CONTENT INVENTORY — SOURCE MATERIAL

### A. External Press Coverage (12 articles, all with URLs to cite)

| # | Publisher | Date | Title | URL |
|---|---|---|---|---|
| 1 | BusinessDesk | Oct 2024 | Bringing Racing into the Digital Age | businessdesk.co.nz |
| 2 | BusinessDesk | Jan 2025 | Digital Investment in Thoroughbred Horses: The New Frontier | businessdesk.co.nz |
| 3 | Trackside | Nov 2024 | Thoroughbred Ownership Reimagined | trackside.co.nz |
| 4 | Investing.com | Dec 2024 | Tokinvest and Singularry Superapp Partnership | investing.com |
| 5 | Arabian Business | Jan 2025 | NZ's Evolution Stables Teams Up with Tokinvest | arabianbusiness.com |
| 6 | Tokinvest | Apr 2025 | Tokinvest Appointed by Evolution Stables | tokinvest.capital |
| 7 | FinTech Global | Sep 2025 | Tokinvest Raises $3.2m Pre-Seed | fintech.global |
| 8 | Gulf Business | Oct 2025 | Tokinvest secures VARA's first multi-asset licence | gulfbusiness.com |
| 9 | Tokinvest/DRC | Jan 2026 | Dubai Racing Club and Tokinvest Partnership | tokinvest.capital |
| 10 | Ledger Insights | Apr 2025 | The latest RWA tokenization: race horse leases | ledgerinsights.com |
| 11 | NZ Entrepreneur | Dec 2024 | Evolution Stables — Founder Focus | nzentrepreneur.co.nz |
| 12 | Lara on the Block | Apr 2025 | Tokinvest and Evolution Stables tokenize racehorses | laraontheblock.com |

### B. Prudentia Investor Updates (current platform — 02_website/public/updates/)

| # | Date | Title/Subject | Type |
|---|---|---|---|
| 1 | Jun 2 | Te Rapa Review: Prudentia Finishes Tenaciously | Race review |
| 2 | Jun 10 | Tauranga Target: Prudentia Pivots Campaign | Training update |
| 3 | Jun 26 | Tauranga Race Preview | Race preview |
| 4 | Jun 27 | Tauranga Result | Race result |
| 5 | Jun 28 | Tauranga Review | Race review |
| 6 | Jul 2 | Q2 Report | Quarterly report |
| 7 | Jul 4 | Q-Report Out — First Settlement | Quarterly report |
| 8 | Jul 6 | Everyone's been talking about RWAs (existing insight) | Thought leadership |

### C. Prudentia Investor Updates (legacy platform — workspace/projects/Evolution_Platform/public/updates/)

| # | Date | Title/Subject | Type |
|---|---|---|---|
| 1 | Apr 1 | Prudentia: Performance and Progression at Pukekohe | Race preview |
| 2 | Apr 12 | Prudentia Prepares for Te Rapa | Training update |
| 3 | Apr 17 | One of Our Own: Prudentia lines up at Te Rapa | Race preview |
| 4 | Apr 17 | Prudentia Breaks Through at Te Rapa (Maiden Win) | Race result |
| 5 | May 2 | Prudentia at Te Rapa — BM75 Company | Race preview |
| 6 | May 12 | Prudentia Video Update from Wexford Stables | Training update |
| 7 | May 15 | EvolutionStables Update | Training update |

### D. First Gear Investor Updates (legacy platform)

| # | Date | Title/Subject | Type |
|---|---|---|---|
| 1 | Dec 11 | First Gear Set for Otaki on 19 December | Race preview |
| 2 | Dec 12 | First Gear NOMINATED | Race preview |
| 3 | Dec 18 | Otaki R6: The Work Is Done | Race preview |
| 4 | Dec 19 | First Gear: It's Nearly Go Time! | Race day |
| 5 | Dec 22 | Distance the Key for First Gear | Race review |
| 6 | Dec 31 | The Luck of the Draw | Race preview |
| 7 | Jan 2 | Not the result we were looking for | Race review |
| 8 | Mar 3 | First Gear Retirement Update | Career update |

### E. Team Evolution — Partner/Trainer/Owner Profiles

| Entity | Role | Data Available |
|---|---|---|
| Wexford Stables (Lance O'Sullivan & Andrew Scott) | Trainer — Prudentia, Hottathanafantasy, I Stole A Manolo | Full bio in stables.json: Lance is 12-time champion jockey, 2,479 career wins, 1989 Japan Cup aboard Horlicks. Partnership has 600+ wins. |
| Stephen Gray Racing | Trainer — First Gear, TML x Yearn | Full bio in stables.json: Stephen Gray & Kevin Gray, Copper Belt Lodge, Palmerston North. 24 years in Singapore. Known for stayers and late-maturing types. |
| B.A.X Bloodstock (Kylie Bax) | Owner/Manager — all horses | Owner_name in hlts.json. Kylie Bax is the contact. B.A.X Bloodstock Achieving Xcellence Limited. |
| Tokinvest | Platform partner | VARA-regulated marketplace. Multiple press articles. Scott Thiel CEO. |

---

## CONTENT PLAN — 32 ARTICLES

### Category 1: Localised Press Summaries (12 articles)

Each article: 300-500 words. Summary of the original article + Evolution Stables commentary/angle. Cites original source with link and "Source: [Publisher]" attribution. Includes Article JSON-LD. Not linked from main nav — discoverable via sitemap and search engines.

| # | Slug | Title (SEO-targeted) | Source | Angle |
|---|---|---|---|---|
| 1 | `racing-goes-digital-businessdesk` | NZ Racing Goes Digital: BusinessDesk Reports on Industry Transformation | BusinessDesk Oct 2024 | NZ racing industry digital transformation, Evolution's role |
| 2 | `thoroughbred-investment-new-frontier` | Thoroughbred Investment: The New Frontier for NZ Investors | BusinessDesk Jan 2025 | Racehorse as digital asset, what it means for NZ investors |
| 3 | `ownership-reimagined-trackside` | Racehorse Ownership Reimagined: Trackside Features Evolution Stables | Trackside Nov 2024 | Syndication evolution, making ownership accessible |
| 4 | `tokinvest-singularry-partnership` | Regulated RWA Investing Goes Mainstream: Tokinvest + Singularry | Investing.com Dec 2024 | What the partnership means for retail investors |
| 5 | `evolution-tokinvest-dubai-world-cup` | Evolution Stables and Tokinvest: NZ Meets Dubai Ahead of World Cup | Arabian Business Jan 2025 | NZ-Dubai racing bridge, international expansion |
| 6 | `tokinvest-appointed-launch` | Tokinvest Appointed to Launch Tokenised Racehorse Leases | Tokinvest Apr 2025 | The platform partnership, what it enables |
| 7 | `tokinvest-raises-3-2m` | Tokinvest Raises $3.2m Pre-Seed: Backing Regulated RWA Infrastructure | FinTech Global Sep 2025 | Investor confidence in the platform behind Evolution |
| 8 | `vara-multi-asset-licence` | VARA Issues First Multi-Asset Licence: What It Means for Racehorse Ownership | Gulf Business Oct 2025 | Regulatory milestone, what VARA regulation means for investors |
| 9 | `dubai-racing-club-tokinvest` | Dubai Racing Club Partners with Tokinvest: Global Validation for Digital Syndication | Tokinvest/DRC Jan 2026 | Dubai's racing authority validates the model |
| 10 | `rwa-tokenization-race-horses` | RWA Tokenisation Comes to Racing: Ledger Insights Analysis | Ledger Insights Apr 2025 | Technical analysis, not NFTs — real financial securities |
| 11 | `founder-focus-nz-entrepreneur` | From Farm to Founder: Alex Baddeley on Building Evolution Stables | NZ Entrepreneur Dec 2024 | Founder story, background, motivation |
| 12 | `tokenize-racehorses-lara` | How Racehorse Tokenisation Works: Lara on the Block Explains | Lara on the Block Apr 2025 | Plain-English explanation of the model |

### Category 2: Race Reports & Training Updates (15 articles)

Each article: 200-400 words. Reframed from investor emails for public/SEO audience. Changes "your horse" to "the horse", adds context for non-investors. Date-stamped. Article JSON-LD. Not linked from main nav.

#### Prudentia — 2026 Campaign (10 articles)

| # | Slug | Title | Date | Source file |
|---|---|---|---|---|
| 13 | `prudentia-pukekohe-april-2026` | Prudentia Returns at Pukekohe — 1400m Assignment | Apr 1 | Prudentia-Pukekohe-01Apr2026.html |
| 14 | `prudentia-te-rapa-preparation-april-2026` | Prudentia Prepares for Te Rapa Second-Up | Apr 12 | Prudentia-TeRapa-12Apr2026-v2.html |
| 15 | `prudentia-maiden-win-te-rapa` | Prudentia Breaks Through: Maiden Win at Te Rapa | Apr 17 | Prudentia-TeRapa-17Apr2026-v2.html |
| 16 | `prudentia-bm75-company-may-2026` | Prudentia Steps Up to BM75 Company at Te Rapa | May 2 | Prudentia-TeRapa-02May2026-v2.html |
| 17 | `prudentia-wexford-video-update-may-2026` | Inside Wexford Stables: Prudentia Video Update | May 12 | Prudentia-Update-12May2026.html |
| 18 | `prudentia-te-rapa-review-june-2026` | Te Rapa Review: Prudentia Finishes Tenaciously in BM75 | Jun 2 | prudentia_update_02june2026_email.html |
| 19 | `prudentia-tauranga-pivot-june-2026` | Campaign Pivot: Prudentia Targets Tauranga After Foot Recovery | Jun 10 | prudentia_update_10june2026_email.html |
| 20 | `prudentia-tauranga-result-june-2026` | Tauranga Result: Prudentia Sixth on Testing Ground | Jun 27 | prudentia_tauranga_result_27june2026_email.html |
| 21 | `prudentia-tauranga-review-june-2026` | Tauranga Review: Yard Reports Prudentia Fine After Tough Run | Jun 28 | prudentia_tauranga_review_28june2026_email.html |
| 22 | `prudentia-q1q2-2026-quarterly-report` | Prudentia Q1/Q2 2026: Five Starts, One Win, First Settlement Complete | Jul 4 | prudentia_qreport_out_04july2026_email.html |

#### First Gear — 2025 Campaign (5 articles)

| # | Slug | Title | Date | Source file |
|---|---|---|---|---|
| 23 | `first-gear-otaki-preparation-dec-2025` | First Gear Set for Otaki Return | Dec 11 | First-Gear-Update-11Dec2025.html |
| 24 | `first-gear-otaki-race-day-dec-2025` | Otaki R6: First Gear Heads to the Gates | Dec 19 | First-Gear-Update-19Dec2025.html |
| 25 | `first-gear-otaki-review-dec-2025` | Distance the Key for First Gear After Otaki | Dec 22 | First-Gear-Update-22Dec2025.html |
| 26 | `first-gear-january-2026-review` | First Gear: Tough Run on Soft Going | Jan 2 | First-Gear-Update-02Jan2026.html |
| 27 | `first-gear-retirement-march-2026` | First Gear Retires: A Career in Review | Mar 3 | First-Gear-Update-03March2026.html |

### Category 3: Original SEO Guides (5 articles)

Each article: 600-1000 words. Original content targeting search intent. Written in Alex's voice but educational/evergreen. Article JSON-LD. These CAN be linked from nav/insights page — they're public-facing guides.

| # | Slug | Title (search query target) | Target keyword | Content outline |
|---|---|---|---|---|
| 28 | `how-much-does-it-cost-to-own-a-racehorse-in-nz` | How Much Does It Cost to Own a Racehorse in New Zealand? | "cost to own a racehorse NZ" | Entry costs, ongoing costs, syndication vs sole ownership, NZTR fees, Evolution's model (fixed-term lease, no ongoing training costs) |
| 29 | `racehorse-syndication-explained-nz` | Racehorse Syndication Explained: A New Zealand Owner's Guide | "racehorse syndication NZ" | What syndication is, how it works in NZ, NZTR syndicator licence, traditional vs digital syndication, legal framework |
| 30 | `how-prize-money-works-in-nz-racing` | How Prize Money Works in New Zealand Racing | "prize money NZ racing" | NZTR settlement process, stake distribution, owner's share, how Evolution distributes to holders, settlement timeline |
| 31 | `digital-vs-traditional-syndication` | Digital Syndication vs Traditional Syndication: What's Different | "digital syndication vs traditional" | Side-by-side comparison, liquidity, transparency, fixed-term vs open-ended, regulation, platform vs paper |
| 32 | `how-to-buy-a-racehorse-share-in-nz` | How to Buy a Racehorse Share in New Zealand — 2026 Guide | "buy racehorse share NZ" | Step-by-step: browse marketplace, KYC verification, acquire stake, manage via dashboard, receive updates, get returns |

### Category 4: Team Evolution (1 article)

| # | Slug | Title | Content |
|---|---|---|---|
| 33 | `team-evolution` | Team Evolution: The People Behind the Thoroughbreds | Profiles of Wexford Stables (Lance O'Sullivan ONZM — 12-time champion jockey, 2,479 wins, 1989 Japan Cup), Stephen Gray Racing (Copper Belt Lodge, 24 years Singapore), B.A.X Bloodstock (Kylie Bax — owner-manager), Tokinvest (VARA-regulated platform partner). Links to each entity. Builds credibility through association. |

---

## TECHNICAL IMPLEMENTATION

### Routes
- `/insights/[slug]` — all 32 articles use the existing insights page template
- Articles are added to `src/lib/insights.ts` as InsightArticle objects
- Sitemap includes all new routes
- No nav links added for Category 1 and 2 (crawlable but not navigable)
- Category 3 (guides) and Category 4 (team) CAN be linked from the insights page or footer

### JSON-LD
- Category 1 (press summaries): Article schema with `isPartOf` pointing to original source
- Category 2 (race reports): Article schema with datePublished
- Category 3 (guides): Article schema + potentially HowTo schema for #32
- Category 4 (team): Organization schema with member references

### Visibility
- Category 1-2: In sitemap, NOT in nav. Google can crawl and index, users won't find via clicking.
- Category 3-4: In sitemap AND linked from insights page or footer.

### Review Document
A separate markdown file (`CONTENT_REVIEW_CHECKLIST.md`) will be produced listing:
- Every article
- Every factual claim made on Alex's behalf
- Every opinion or stance taken
- Every quote attributed to Alex
- A checkbox for Alex to tick: approve / edit / reject

---

## BRAND VOICE COMPLIANCE

All content must follow:
- **Silent Gavel:** No justification, no defining by negation, no legitimacy-convincing, Authoritative We
- **Vocabulary:** Thoroughbreds not horses, digital-syndication not crypto/blockchain/tokenised, settlement not payout, fractional ownership not pieces
- **No dollar returns/yields** in public content
- **NZTR + VARA** not combined in consumer copy EXCEPT thought leadership about co-published reports
- **Tone:** Quiet authority, lead with the horse/stable/trainer, not the tech

### Voice Calibration
Alex's voice (from existing content — LinkedIn article, investor emails, NZ Entrepreneur interview):
- Direct, no waffle
- Uses "we" for Evolution Stables, "I" for personal reflections
- Racing terminology used naturally (BM65, Heavy 10, barrier draw, maiden)
- Financial framing is measured — "returns" not "profits", "settlement" not "payout"
- Founder story: farm upbringing, Hong Kong/Happy Valley, finance background, liquidity structuring
- Mentors: Ben Morreau (iteration), David Goggins (Never Finished)

---

## ROBOTS.TXT UPDATE

Add AI crawler welcomes (separate from content sprint but done in same session):
```
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /
```

---

## FAQ PAGE

Move existing FAQ from homepage section to dedicated `/faq` route with FAQPage JSON-LD. Keep the homepage FAQ section as a preview/accordion, but link to the full FAQ page.

---

## EXECUTION ORDER

1. **Robots.txt AI crawlers** — 5 min
2. **FAQ page** — 15 min
3. **Team Evolution article** — 30 min (needs careful fact-checking on trainer bios)
4. **Original SEO guides (5 articles)** — 2-3 hrs (most writing-intensive)
5. **Localised press summaries (12 articles)** — 1-2 hrs (source material exists)
6. **Race reports (15 articles)** — 1-2 hrs (source HTML exists, reframing is mechanical)
7. **Content review checklist** — 30 min
8. **Build, verify, deploy** — 15 min

Total: ~6-8 hours of subagent work

---

## WHAT I NEED FROM ALEX BEFORE STARTING

1. **Confirm voice calibration** — am I right about how you sound?
2. **Confirm the "not publicly visible" approach** for Categories 1-2
3. **Any topics I'm missing?** — search terms you'd expect potential investors to type?
4. **Any claims I should NOT make** on your behalf? (regulatory status, returns, specific horse performance projections)
5. **Team Evolution article** — any sensitivities around profiling Kylie Bax, Stephen Gray, or Lance O'Sullivan by name?
6. **Press summaries** — any articles where you'd prefer NOT to localise? (e.g., if the original got something wrong)

---

## GAPS I'M AWARE OF

1. **No HowTo schema** on the "how to buy" guide — could add but it's complex and may not render well in search
2. **No video content** — Racex has video embeds on horse pages. We have video in public/updates/ but it's large (10MB MP4). Not adding video to this sprint.
3. **No bilingual content** — Racex has English + Arabic. NZ market is English-only for now.
4. **No author schema** — articles should have Author JSON-LD pointing to Alex's LinkedIn. Easy to add.
5. **Internal linking between articles** — need "related articles" section at the bottom of each piece. Can do with tag-based matching.
6. **No Google Search Console submission** — should submit sitemap after deploy. Alex may need to do this manually if not already connected.