# Relay Plan — SEO Phase 1 Fixes + llms.txt + /learn/returns + Guide Deepening

**Created:** 2026-07-13  
**Author:** Hermes (GLM) → Kimi K2.7 Code relay  
**Workdir:** `/home/evo/evo_01/02_website`  
**Branch:** create `seo-phase1-content` from current `main`

---

## Context

The live site (https://www.evolutionstables.nz) has 34 insights, 6 horse pages, FAQ, schema, AI bot allows — but a Jul 13 audit found crawl-signal conflicts and content depth gaps that block growth. PH Digital's Jan 2026 pitch diagnosed "invisible website" — we've built the foundation but haven't fixed the wiring.

This relay does 3 things in order:
1. **Phase 1 crawl fixes** (~2 hrs code) — host unify, sitemap prune, FAQ scope, title doubles
2. **AI visibility** (~30 min) — llms.txt  
3. **Content: /learn/returns + guide deepening** — new returns explainer page + expand 5 guides to 900-1200 words

---

## Part 1 — Crawl fixes (engineering, 5 changes)

### 1.1 Host unify to www

**Problem:** `metadataBase` is `https://evolutionstables.nz` (apex) but live host 307-redirects to `https://www.evolutionstables.nz`. Sitemap, canonicals, JSON-LD, OG all use apex. Split signals for Google.

**Fix:**
- `src/app/layout.tsx:16` — change `metadataBase` to `new URL("https://www.evolutionstables.nz")`
- `src/app/layout.tsx:41` — change OG `url` to `https://www.evolutionstables.nz`
- `src/app/sitemap.ts` — change `baseUrl` to `https://www.evolutionstables.nz`
- `src/components/seo/StructuredData.tsx` — any hardcoded `evolutionstables.nz` URLs → `www.evolutionstables.nz`
- `src/app/marketplace/[id]/page.tsx:143` — Product schema `url` field → `https://www.evolutionstables.nz/marketplace/${hltRecord.id}`
- `src/app/robots.ts` (or robots output) — sitemap directive → `https://www.evolutionstables.nz/sitemap.xml`

**Verify:** `grep -r "evolutionstables.nz" src/ --include="*.ts" --include="*.tsx" | grep -v "www\." | grep -v node_modules` — should show zero bare-apex URLs in SEO-relevant fields.

### 1.2 Sitemap prune

**Problem:** `/mystable` is in sitemap but `robots.txt` disallows it. `/brand-guidelines` is an internal brand asset that shouldn't compete in organic.

**Fix in `src/app/sitemap.ts`:**
- Remove the `/mystable` entry (around line 48)
- Remove the `/brand-guidelines` entry (around line 42)

**Verify:** Build and check `/sitemap.xml` — neither URL should appear.

### 1.3 FAQ schema scope

**Problem:** `<FAQStructuredData>` is rendered in root `layout.tsx:99`, injecting FAQPage JSON-LD on every page including marketplace, horse pages, press, etc. Wrong scope.

**Fix in `src/app/layout.tsx`:**
- Remove the `<FAQStructuredData items={faqItems} />` line (~line 99)
- Remove the `import { FAQStructuredData }` line (~line 8)
- Remove the `import { faqItems }` line (~line 10) if not used elsewhere in layout
- **Keep** `FAQStructuredData` on `/faq` page (`src/app/faq/page.tsx:32`) — that's the correct scope
- **Optional:** Add FAQ schema to homepage only if there's a visible FAQ section in the homepage body. Check `src/app/page.tsx` — if it renders FAQ content, add `<FAQStructuredData>` there.

**Verify:** View-source on `/marketplace/prudentia` — no `FAQPage` JSON-LD block. View-source on `/faq` — `FAQPage` present.

### 1.4 Title template double-brand fix

**Problem:** `layout.tsx:19` has `template: "%s | Evolution Stables"`. Pages like `press/page.tsx` set `title: 'Press & Media | Evolution Stables'`. Result: `Press & Media | Evolution Stables | Evolution Stables` in SERP.

**Fix:** Strip `| Evolution Stables` from all page-level title strings. The template handles it.

**Files to fix (remove trailing `| Evolution Stables` from title):**
- `src/app/press/page.tsx` — 3 occurrences (lines 37, 48, 62)
- `src/app/marketplace/page.tsx` — 3 occurrences (lines 18, 29, 43)
- `src/app/faq/page.tsx` — 2 occurrences (lines 15, 23)
- `src/app/brand-guidelines/page.tsx` — 1 occurrence (line 8)
- `src/app/insights/page.tsx` — 2 occurrences (lines 15, 23)
- `src/app/sandbox/marketplace/page.tsx` — 1 occurrence (line 8)
- `src/app/marketplace/[id]/page.tsx` — check lines 85 and 95 — `${horseName} | Evolution Stables Marketplace` and `${horseName} | Evolution Stables` → should become `${horseName} | Marketplace` and `${horseName}` respectively (template adds `| Evolution Stables`)

**Verify:** Build and check `<title>` tags in HTML output — no `| Evolution Stables | Evolution Stables` anywhere.

### 1.5 Absolute URLs in Organization JSON-LD

**Problem:** `StructuredData.tsx:66` passes `article.url` directly as `subjectOf.url` — these are relative paths like `/insights/...`.

**Fix in `src/components/seo/StructuredData.tsx`:**
- Prefix `article.url` with the site origin: `url: \`https://www.evolutionstables.nz${article.url}\``
- Also check for any `/updates/*.html` references — if dead, remove them from the press articles array in `src/lib/press-articles.ts`

**Verify:** Rich Results Test or view-source — all `subjectOf.url` fields are absolute `https://www.evolutionstables.nz/...` URLs.

---

## Part 2 — llms.txt (30 min)

Create `public/llms.txt` with:

```text
# Evolution Stables

Evolution Stables is an NZTR-authorised digital racehorse syndicator based in New Zealand. We offer fractional, digital-syndication ownership of thoroughbred racehorses — accessible, transparent, and regulated under the New Zealand Financial Markets Conduct Act. Settlement and ownership records are managed through Tokinvest, a VARA-licensed platform.

## What we are
- NZTR authorised syndicator (Bloodstock Syndicator Code of Practice)
- Digital-syndication platform for thoroughbred ownership
- Regulated real-world asset (RWA) investment in racehorses
- Partnered with Wexford Stables, Stephen Gray Racing, B.A.X Bloodstock, Tokinvest

## What we are not
- Not a cryptocurrency or tokenisation scheme
- Not guaranteed returns — racehorse investment carries risk
- Not a betting platform

## Key URLs
- Homepage: https://www.evolutionstables.nz
- Marketplace: https://www.evolutionstables.nz/marketplace
- How to buy a racehorse share in NZ: https://www.evolutionstables.nz/insights/how-to-buy-a-racehorse-share-in-nz
- Cost of racehorse ownership in NZ: https://www.evolutionstables.nz/insights/how-much-does-it-cost-to-own-a-racehorse-in-nz
- Racehorse syndication explained: https://www.evolutionstables.nz/insights/racehorse-syndication-explained-nz
- Digital vs traditional syndication: https://www.evolutionstables.nz/insights/digital-vs-traditional-syndication
- How prize money works in NZ racing: https://www.evolutionstables.nz/insights/how-prize-money-works-in-nz-racing
- FAQ: https://www.evolutionstables.nz/faq
- Press & Media: https://www.evolutionstables.nz/press
- Team Evolution: https://www.evolutionstables.nz/insights/team-evolution

## Contact
- Email: alex@evolutionstables.nz
- LinkedIn: https://www.linkedin.com/company/evolution-stables
- X (Twitter): https://twitter.com/EvolutionStables
- Instagram: https://www.instagram.com/evolutionstables
```

**Verify:** `curl https://www.evolutionstables.nz/llms.txt` returns 200 with this content.

---

## Part 3 — /learn/returns page (new route)

**Problem:** `InvestmentTermsModal.tsx:281` links to `/learn/returns` but no page exists. TODO comment on line 279.

**Build:** `src/app/learn/returns/page.tsx`

This is both a user-facing explainer AND an SEO content page. It should:
- Explain how racehorse ownership returns work in NZ (stakes/prize money → syndicate → pro-rata distribution)
- Cover: NZTR prize money structure, stake percentages, settlement cadence (quarterly), pro-rata calculation, what owners receive, tax treatment basics (disclaimer: not financial advice)
- Reference Evolution Stables' model specifically: 75% gross stakes to investors, quarterly distribution after settlement
- Include the `InvestmentTermsModal` context (why the link exists — "learn more about how returns work")
- 800-1000 words minimum
- Unique meta title/description
- Article JSON-LD schema
- Internal links to: `/insights/how-prize-money-works-in-nz-racing`, `/insights/racehorse-syndication-explained-nz`, `/marketplace`
- Add to sitemap

**Brand rules:** thoroughbreds not horses, digital-syndication not tokenised, settlement not payout, no dollar returns in public, no guaranteed returns language.

**Meta:**
- Title: `How Racehorse Ownership Returns Work | Evolution Stables` (before template fix — after fix just `How Racehorse Ownership Returns Work`)
- Description: `How prize money and stakes flow back to digital syndicate members in NZ thoroughbred ownership. Pro-rata distribution, settlement cadence, and what to expect.`

---

## Part 4 — Guide deepening (content, 5 articles)

Expand these 5 guides in `src/lib/insights.ts` to 900-1200 words each. Add comparison tables, cost scenarios, step-by-step processes, trade-offs, and proof points. The goal per PH Digital: "content that survives summarisation" — a ChatGPT query should get a complete answer from the page.

### 4.1 `how-to-buy-a-racehorse-share-in-nz` (currently ~384 words → target 1200+)

Add:
- Step-by-step process (browse → KYC → select lot → purchase → onboarding → ownership)
- KYC/identity verification explanation (Stripe Identity, why it's required, AML)
- Costs breakdown (monthly rate, lot size, term length, what's included)
- Timeline expectations (from signup to first race update)
- What you actually receive as an owner (updates, access, distributions)
- Comparison: Evolution's digital model vs traditional syndicate signup
- Risk disclosure (racehorse investment is speculative, no guaranteed returns)
- CTA: link to `/marketplace`

### 4.2 `how-much-does-it-cost-to-own-a-racehorse-in-nz` (currently ~528 words → target 1200+)

Add:
- Full cost table: training fees, agistment, vet, farrier, transport, race entries, insurance
- Monthly cost ranges for NZ racing (Low/Mid/High scenarios)
- How Evolution's pricing model works (owner rate × lot × months)
- Worked example: 0.25% of a horse at $75/mo for 12 months = $225 total
- What's included vs what's not (training, vet, race costs included; transport to transport sometimes separate)
- Comparison: traditional syndicate costs (upfront lump sum) vs Evolution (monthly, fractional)
- Hidden costs traditional syndicates don't mention
- CTA: link to `/marketplace`

### 4.3 `digital-vs-traditional-syndication` (currently ~351 words → target 1000+)

Add:
- Side-by-side comparison table (structure, minimum buy-in, liquidity, transparency, access, reporting cadence)
- Traditional syndicate model: how it works in NZ (NZTR authorised syndicator, Bloodstock Syndicator Code)
- Digital syndication model: how Evolution works (fractional lots, monthly, digital onboarding, Tokinvest settlement)
- Trade-offs: liquidity vs commitment, transparency vs trust, accessibility vs exclusivity
- When traditional makes sense vs when digital makes sense
- Regulatory framing: both are NZTR-governed; digital adds platform layer
- CTA: link to `/marketplace` and `/learn/returns`

### 4.4 `racehorse-syndication-explained-nz` (currently ~427 words → target 1000+)

Add:
- What syndication is (shared ownership of a thoroughbred)
- NZ regulatory framework: NZTR authorised syndicator, Bloodstock Syndicator Code of Practice, Financial Markets Conduct Act exemption pathway
- What an authorised syndicator must do (disclosure statements, compliance, reporting)
- Types of syndicate structures in NZ (racing partnerships, leasing, digital)
- How owners participate (race day access, trainer updates, voting rights where applicable)
- Tax treatment basics (disclaimer: not financial advice, consult accountant)
- Common myths about syndication (only for the wealthy, you don't really own anything, it's gambling)
- CTA: link to `/marketplace` and `/insights/team-evolution`

### 4.5 `how-prize-money-works-in-nz-racing` (currently ~330 words → target 900+)

Add:
- NZTR prize money structure (metropolitan vs provincial vs rural meetings)
- Stake distribution percentages (1st through to last place)
- How prize money flows: club → NZTR → syndicate → pro-rata to owners
- Evolution's model: 75% gross stakes to investors, quarterly distribution
- Worked example: a $20,000 race, 5% stake, 75% to investors = calculation
- Added stakes money (ASB, bonus schemes) where applicable
- What affects prize money (race grade, number of runners, sponsorship)
- CTA: link to `/learn/returns` and `/marketplace`

---

## Execution order

1. **Branch:** `git checkout -b seo-phase1-content`
2. **Part 1** (crawl fixes) — all 5 changes, build, verify
3. **Part 2** (llms.txt) — create file, verify route
4. **Part 3** (/learn/returns) — new page, add to sitemap, build
5. **Part 4** (guide deepening) — expand 5 articles in `insights.ts`, build
6. **Full build:** `npm run build` — zero errors
7. **Commit:** `feat(seo): Phase 1 crawl fixes + llms.txt + /learn/returns + guide deepening`
8. **Do NOT deploy** — Alex reviews diff first

## Brand compliance (banned words)

- ❌ tokenised/tokenization → ✅ digital-syndication
- ❌ blockchain → ✅ regulated platform / settlement infrastructure
- ❌ crypto → ✅ (remove entirely)
- ❌ payout → ✅ settlement / distribution
- ❌ horses → ✅ thoroughbreds
- ❌ guaranteed return / profit → ✅ (remove entirely, add risk disclaimers)

## Do not

- Deploy without Alex's review
- Touch marketplace checkout / payment / KYC code
- Change `PURCHASES_ENABLED`
- Modify horse data or pricing logic
- Remove or alter existing article slugs (URL stability)
- Add FAQ rich result schema for Google (retired May 2026)

## Key files

| What | Path |
|------|------|
| metadataBase + FAQ scope | `src/app/layout.tsx` |
| Sitemap | `src/app/sitemap.ts` |
| Robots | `src/app/robots.ts` or `public/robots.txt` |
| Structured data | `src/components/seo/StructuredData.tsx` |
| Horse page schema | `src/app/marketplace/[id]/page.tsx` |
| FAQ component (keep on /faq) | `src/components/seo/FAQStructuredData.tsx` |
| Insights content | `src/lib/insights.ts` |
| Returns modal link | `src/components/marketplace/InvestmentTermsModal.tsx:281` |
| Press articles (subjectOf) | `src/lib/press-articles.ts` |
| llms.txt (new) | `public/llms.txt` |
| /learn/returns (new) | `src/app/learn/returns/page.tsx` |

## Verification checklist (before reporting done)

- [ ] `metadataBase` = `https://www.evolutionstables.nz`
- [ ] Sitemap uses `www.evolutionstables.nz` as baseUrl
- [ ] `/mystable` not in sitemap
- [ ] `/brand-guidelines` not in sitemap
- [ ] No `FAQPage` JSON-LD on `/marketplace/*` pages
- [ ] `FAQPage` JSON-LD still on `/faq`
- [ ] No `| Evolution Stables | Evolution Stables` in any title
- [ ] All `subjectOf.url` in JSON-LD are absolute `https://www.evolutionstables.nz/...`
- [ ] `/llms.txt` returns 200
- [ ] `/learn/returns` renders with 800+ words
- [ ] 5 guides each 900+ words
- [ ] `npm run build` — zero errors
- [ ] No banned words in new/modified content