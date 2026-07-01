# Content Brief — Marketplace Gallery Page (`/marketplace`)
# Version: 1.1.0
# Status: Active — tone direction locked, ready for build
# Updated: 2026-06-21

## Session Notes (2026-06-21)

### Decisions Locked
- **Direction B: Story with substance.** Not pure atmosphere (too opaque for new visitors), not a pitch (violates Fight Club). Founder voice — plain, calm, "this is what we do and why."
- **No live purchases.** Per-horse page (/marketplace/{id}) replaces Stripe checkout with an apply/enquire model. A form that triggers an email to Alex for follow-up. CTA copy TBD — we know it's there, don't get bogged down in wording yet.
- **Focus: marketplace page first**, then per-horse page.
- **Core principle: storytelling over selling.** The balance and tone of content matters more than the mechanics.

### Tone Critique of v1.0.0 Brief
The v1.0.0 brief had the right STRUCTURE (hero → nuggets → image strip → exit) but the COPY was still half-pitching:
- "Regulated digital-syndication for racehorse ownership" = fintech pitch language
- "Evolution introduces a regulated, transparent, and accessible framework" = product explainer
- "Traditional syndicates remain opaque, illiquid, and relationship-gated" = competitive positioning

These should be rewritten in founder voice — journal entry, not term sheet. Same ideas, different voice. Product mechanics belong on /model or /how-it-works, not on the gallery.

### What Needs To Happen Next
1. **Rewrite the marketplace page copy** in the brief — shift from pitch to story. Keep structure, change voice.
2. **Build the marketplace page** to match the rewritten brief (replacing the current shopping-grid ListingGrid).
3. **Then design the per-horse page** — two-column layout (narrative left, enquiry form right). No Stripe. Apply/enquire sends email to Alex.
4. **Static data model** — mock campaigns stay as the data source. No backend wiring needed yet.

## The Rule
This brief is the single source of truth for what the `/marketplace` gallery page must say and do.
Every component, animation, and line of copy pulls from here. If it's not in this brief, it doesn't ship.

---

## 1. Page Job

**Primary job:** Welcome the visitor into the *feeling* of racehorse ownership.
**Secondary job:** Present active syndications as elite athletes, not retail products.
**Tertiary job:** Create the "perhaps" — the moment a visitor thinks "I could do this."

This is NOT a comparison-shopping grid. It is an immersive editorial gallery where each asset is a story.

---

## 2. Narrative Arc (Scroll Order)

### Section A: Hero — The Invitation (Scroll-Pinned)
**Position:** Full viewport height. Pinned until user scrolls past.
**Pillars served:** Innovation + Access

**Elements:**
- Eyebrow: "Evolution Stables" (11px, tracked-[0.28em], white/30)
- Headline: "Ownership, evolved." (clamp 36–64px, light weight, tracking-tight, serif or refined sans)
- Subhead: "Regulated digital-syndication for racehorse ownership in New Zealand. The moments. The access. The stable." (16px, leading-relaxed, white/50, max-w-2xl)
- CTA: "Enter the stable" → smooth scroll to Section B
- Background: Deep black, very faint architectural/stable silhouette in lower-left (barely visible, atmospheric)

**Motion:** Text fades in on load (opacity 0→1, 800ms). No parallax. No carousel. Page holds until scroll intent.

---

### Section B: The Nuggets — Scroll-Locked Vertical Reveal
**Position:** Below hero. Sequence of full-viewport panels, each locking in place as the user scrolls through.
**Pillars served:** Trust + Access + Experience

**Mechanic:** Each nugget is a `position: sticky; top: 0; height: 100vh` panel. The user scrolls down, Panel 1 locks, Panel 2 slides UP over Panel 1 (like a deck of cards), Panel 3 slides up over Panel 2, etc. No horizontal movement. Pure vertical stacking with scroll-lock.

**Nugget 1: The Model**
- Label: "The model" (11px, tracked, white/30)
- Headline: "Racing ownership has been a closed shop for centuries." (clamp 24–40px, light, tracking-tight, centred)
- Body: "Traditional syndicates remain opaque, illiquid, and relationship-gated. Evolution introduces a regulated, transparent, and accessible framework." (14px, white/50, max-w-xl, centred)

**Nugget 2: Fixed Priced. Fixed Return.**
- No label.
- Headline line 1: "Fixed priced." (clamp 40–72px, light, tracking-tight, white, centred)
- Headline line 2: "Fixed return." (same treatment, white/70, centred)
- Sub-line (14px, white/40, max-w-md, centred): "No hidden fees. No monthly surprises. What you see is what you own."
- Optional: very faint background image of a horse in training, 8% opacity, full-bleed.

**Nugget 3: Authorised. Regulated.**
- Label: "Trust" (11px, tracked, white/30)
- Headline: "Authorised under New Zealand's governing body." (clamp 24–40px, light, tracking-tight, centred)
- Body: "Evolution Stables is an authorised syndicator, operating within the regulatory framework that protects owners. Every campaign is documented. Every transaction is recorded." (14px, white/50, max-w-xl, centred)
- Sub-line: "NZTR Authorised Syndicator · FMA Equine Exemptions" (10px, tracked, white/30, centred)

**Nugget 4: Taste the Thrill**
- Label: "Experience" (11px, tracked, white/30)
- Headline: "Taste the thrill of ownership." (clamp 32–56px, light, tracking-tight, centred)
- Body: "A level of commitment and risk that suits you. From a single share to a significant stake — ownership is no longer reserved for the few." (14px, white/50, max-w-xl, centred)
- CTA whisper: "Meet the stable →" (11px, tracked, white/40, hover white/70, no box, thin underline, centred)

**Scroll-lock rules:**
- Each nugget panel: `position: sticky; top: 0; height: 100vh;`.
- Parent container: tall enough to allow scroll-through (e.g., `height: 500vh` for 5 nuggets, allowing ~100vh scroll per nugget).
- As user scrolls, the next nugget slides up from below, covering the previous. Previous nugget stays pinned until pushed out.
- No progress dots. No page numbers. The scroll itself is the navigation.
- Pure monochrome. No gold. No green.

**Motion:**
- Each nugget text block fades in as it reaches centre-view (`opacity 0→1, translateY 20px→0, 600ms ease-out`).
- Background (if present) is static. No parallax.
- Transition between nuggets: natural scroll, no snap.

---

### Section C: Meet the Stable — Horizontal Image Carousel
**Position:** After the nuggets release. Full viewport, pinned while scrolling.
**Pillars served:** Experience + Access

**Mechanic:** Same horizontal-scroll-on-vertical-scroll pattern as the old carousel mechanic, but purely for images. `position: sticky; top: 0; height: 100vh`. The user scrolls down; the strip of horse images moves left.

**Strip layout:** 5 panels, each 100vw wide, edge-to-edge. Total strip width ≈ 500vw.

**Panel 1: Horse 1**
- Full-bleed image, 16:9 ratio, object-fit: cover.
- No text. No overlay. No vignette. Just the horse.

**Panel 2: Horse 2**
- Same treatment.

**Panel 3: Horse 3**
- Same treatment.

**Panel 4: Horse 4**
- Same treatment.

**Panel 5: The Black Tile**
- Background: pure black (#000000).
- Centred text block:
  - Headline: "Meet the stable" (clamp 24–40px, light, tracking-tight, white)
  - CTA: "View the whole stable →" (11px, tracked, white/40, hover white/70, thin underline)
  - Link: `/stables`
- This is the exit. No additional exit section needed after this.

**Image rules:**
- 16:9 cinema-ratio, edge-to-edge within each panel.
- Grayscale by default. Optional: transition to subtle colour as panel reaches centre-view.
- No borders. No rounded corners. Full bleed. The horse IS the panel.
- No text on images. No horse names. No status badges. No hover effects.

**Carousel rules:**
- No progress dots. No scroll indicators. The scroll itself is the navigation.
- Smooth continuous scroll. No snap-to-panel.
- Strip translates via `transform: translateX(-{progress * maxDelta}px)`.
- `requestAnimationFrame` throttle.
- Panel 5 (black tile) fades in gently (`opacity 0→1, 800ms`) as it enters view.

**Data needed:** 4 hero images from GCS `horse/{microchip}/hero.jpg`

---

### Section D: Footer Transition
Standard footer. No additional content block before it.

---

## 3. Visual & Motion Rules

**Frame:** max-w-4xl for all text sections. Grid section: max-w-5xl or full-bleed with generous padding.

**Colour:**
- Background: pure black (#000000)
- Text: white, white/70, white/50, white/30 (no other neutrals)
- Gold (#d4a964): NOT used on this page. This page is pure monochrome. Gold is reserved for the dossier (transaction layer).

**Typography:**
- Hero headline: Refined serif or ultra-light sans, clamp 36–64px, tracking-tight
- Sound bite: Same font family, clamp 40–80px, weight 300
- Labels: 10–11px, uppercase, tracking-[0.2em], white/30
- Body/sub-lines: Inter Tight, 300 weight, 14–16px

**Motion — Scroll-Pinned Sections (A & B):**
- Section pins at `position: sticky; top: 0; height: 100vh`.
- Inner content scales down or fades out as user scrolls past the section threshold.
- No progress bars, no dots, no page indicators. The scroll itself is the navigation.
- Transition between pinned sections: content A fades, content B fades in. Overlap of ~100px for smooth handoff.

**Motion — Image Grid (Section C):**
- Images start at `opacity: 0; transform: scale(0.98)`.
- Reveal triggered by IntersectionObserver at `threshold: 0.3`.
- Transition: `opacity 0→1, scale 0.98→1, duration 600ms, ease-out`.
- Stagger: natural — each image reveals as it enters viewport. No artificial delay.
- No hover effects. No click-to-expand. The images are the content.

**Motion — Exit (Section D):**
- Fades in after the last grid image is fully visible (`opacity 0→1, 600ms`).

---

## 4. Content Sources (Backend Data)

| Field | Source | Required? |
|-------|--------|-----------|
| Horse hero image | GCS `horse/{microchip}/hero.jpg` | Yes |
| Horse name | SSOT `/horses/{microchip}` | Yes |
| Age / Sex / Sire / Dam | SSOT `/horses/{microchip}` | Yes |
| Campaign status | SSOT `/hlts/{id}` | Yes |
| Shares total / sold | SSOT `/hlts/{id}` | Yes |
| Share price (cents) | SSOT `/hlts/{id}` | Yes |
| Fractional interest % | SSOT `/hlts/{id}` | Yes |
| Trainer name | SSOT `/trainers/{id}` | Yes |
| Trainer stable + location | SSOT `/trainers/{id}` | Yes |
| Aggregate stats (owners, wins) | SSOT `/system/aggregates` | No — can hide if missing |

---

## 5. What This Page Does NOT Do

- ❌ No prices. No availability counts. No "buy" CTAs on this page. Fight Club rules.
- ❌ No filters, no search, no sort. The grid is curated, not browsed.
- ❌ No horse names on the image cards. Names live below the grid only.
- ❌ No badges, status pills, or ownership data on images.
- ❌ No hover effects on images. Scroll is the interaction.
- ❌ No carousel. No auto-play. No ticker. No theme flips.
- ❌ No progress bars or scroll indicators. The scroll itself is the navigation.
- ❌ No social proof blocks (testimonials, star ratings).
- ❌ No FAQ section on this page. `/how-it-works` owns that.
- ❌ No gold accents. Pure monochrome. Gold is for the dossier.

---

## 6. Success Metrics

- Time on page > 90 seconds (indicates immersion, not bounce)
- Scroll depth > 75% (indicates narrative engagement)
- Click-through rate to dossier > 15% (indicates "perhaps" activation)
- Zero complaints about "can't find prices" (price is visible but not dominant)

---

## 7. Related Briefs

- `ASSET_DOSSIER.md` — the `/marketplace/{id}` page brief (transaction + compliance layer)
- `HOMEPAGE.md` — the `/` page brief (promise + hook)
- `HOW_IT_WORKS.md` — the `/how-it-works` page brief (model + compliance)

---

## Context Chain
<- inherits from: evo_01/_shared/dna/brand/ (slim central brand atoms — in progress); legacy full: /home/evo/workspace/DNA/brand/BRAND_NARRATIVE.md and BRAND_SYSTEM.md
-> overrides by: none
-> used by: 02_website build
-> next: ASSET_DOSSIER.md (the dossier page)
