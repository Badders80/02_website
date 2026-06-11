# Content Brief — Asset Profile Dossier (`/marketplace/{id}`)
# Version: 1.0.0
# Status: Active
# Updated: 2026-06-09

## The Rule
This brief is the single source of truth for what the Asset Profile Dossier page must say and do.
Every component, data panel, and line of copy pulls from here. If it's not in this brief, it doesn't ship.

---

## 1. Page Job

**Primary job:** Convert the "perhaps" into a decision. Present the horse as an elite athlete whose ownership stake is available for acquisition.
**Secondary job:** Deliver transactional clarity and compliance data without clutter.
**Tertiary job:** Make the acquisition flow feel like an extension of a private banking desk — institutional, calm, decisive.

This is the ONLY page where ownership mechanics, pricing, and compliance are visible. The gallery (`/marketplace`) whispers. The dossier speaks.

---

## 2. The Two-Column Architecture

**Desktop:** Side-by-side, top-aligned horizontal baseline. Narrative left (1.6fr), Transaction right (1fr).
**Tablet:** Stacks vertically — narrative first, transaction second.
**Mobile:** Single column, touch-friendly. Purchase widget pins or becomes a bottom sheet.

The layout anticipates Firebase Auth, Stripe KYC identity session loops, and secure document uploads. Compliance milestones feel natural, not bolted-on.

---

## 3. Left Column — Narrative Layer (The Athlete)

### Section A: Cover Media
**Position:** Top of left column, full column width.

**Elements:**
- Single hero image, 16:10 ratio, rounded-2xl, border-white/[0.06]
- High-resolution, cinema-grade photography
- Permanent vignette fade overlay at bottom (gradient: transparent → black 80%)
- No carousel by default. If multi-angle training images exist, they slide under the vignette as a subtle horizontal scroll with dot indicators.
- Priority load (above the fold)

**Data needed:** `horse.image_url` (hero) + `horse.training_images[]` (optional multi-angle)

---

### Section B: Pedigree & Specifications
**Position:** Below cover media.

**Elements:**
- Four-column grid (2-col on mobile): Sex, Colour, Sire, Dam
- Treatment: 10px uppercase label (white/30), 14px medium value (white)
- Thin border container: rounded-2xl, bg-white/[0.01], border-white/[0.06]
- No story here. Just facts. The story comes next.

**Data needed:** `horse.sex`, `horse.colour`, `horse.sire_name`, `horse.dam_name`

---

### Section C: The Story
**Position:** Below pedigree. This is the emotional anchor.

**Elements:**
- Label: "The story" (11px, tracked, white/30)
- Headline: Horse name only. "Prudentia." (24px, light, tracking-tight)
- Body: 2–4 paragraphs of plain text. Trainer voice where possible. No HTML, no links.
  - Training philosophy
  - Preparation routines
  - Race targets (if public)
  - Owner moments (if any)
- Tone: Calm, operational, measured. British English. Active voice.
- No exclamation marks. No hype.

**Data needed:** `horse.story` (text block from backend or content team)

---

### Section D: Trainer Profile
**Position:** Below story. Human trust layer.

**Elements:**
- Avatar: 64px circle, initials fallback, bg-white/[0.04], border-white/[0.06]
- Name: 16px medium, white
- Subtitle: Stable name · Location (11px, white/40)
- License badge: "NZTR Licensed (#LIC-12345)" if available (10px, tracked, white/30)
- Bio: 2–3 sentences max. Same tone as brand narrative.

**Data needed:** `trainer.name`, `trainer.stable_name`, `trainer.location`, `trainer.nztr_license_number`, `trainer.bio`

---

### Section E: Registry Information
**Position:** Below trainer. Compliance as trust signal.

**Elements:**
- Label: "Registry" (11px, tracked, white/30)
- Two-column grid of key-value pairs, thin border-bottom separators:
  - Microchip (15-digit, monospace)
  - Life Number (monospace)
  - Left Shoulder Brand (if present)
  - Right Shoulder Brand (if present)
  - Breeder (if present)
- Font: 12px light, white/50. Values in white/70.
- This section says "documented" without saying it.

**Data needed:** `horse.microchip`, `horse.life_number`, `horse.left_shoulder_brand`, `horse.right_shoulder_brand`, `horse.breeder`

---

## 4. Right Column — Transaction Layer (The Acquisition)

**Position:** Sticky on desktop (top: 7rem). Scrolls naturally on mobile.

### Section F: Campaign Specifications
**Position:** Top of right column. The terms, clearly.

**Elements:**
- Container: rounded-2xl, border-white/[0.06], bg-white/[0.01], p-8
- Headline: "Campaign" (16px, light, white)
- Stacked rows, border-bottom separators:
  - Total Lease Percentage → `100%`
  - Lease Period → `36 Months`
  - Lease Start Date → `2026-07-01`
  - Investor Returns → `80% of prize money` (colour: #34D399 — the only green on the page)
- Font: 13px light. Values in 13px medium, white.

**Data needed:** `leasehold_stake_percentage`, `lease_period_months`, `lease_start_date`, `investor_return_percentage`

---

### Section G: The Purchase Widget
**Position:** Below campaign specs. The action.

**Elements:**
- Container: same treatment as specs, separated by 2rem gap
- Unit price: displayed as `$1,500 NZD` (15px, medium, gold #d4a964)
- Availability: `77 / 100 units` (13px, white/50)
- Input: quantity selector (1–max available). Touch-friendly on mobile.
- Total: live-calculated, gold accent.
- CTA button: "Acquire stake" (not "Buy now", not "Purchase", not "Add to cart")
  - Treatment: full-width, rounded-full, bg-white text-black, 12px uppercase tracked
  - Hover: bg-white/90
  - Disabled state (sold out): border-white/10, text-white/30, "Fully subscribed"
- Microcopy below CTA: "All acquisitions are subject to NZTR syndication rules and FMA equine exemptions." (10px, white/20)

**Flow:**
1. User selects quantity
2. CTA triggers Firebase Auth check (if not logged in → redirect to auth)
3. Post-auth → Stripe KYC identity session
4. Post-KYC → Stripe checkout session
5. Post-payment → redirect to `/mystable` with confirmation toast

**Data needed:** `share_price_cents`, `shares_total`, `shares_sold`, `status` (only `published` enables CTA)

---

## 5. Breadcrumb & Navigation

**Position:** Above both columns, full width.

**Elements:**
- "Marketplace" → link back to `/marketplace` (11px, tracked, white/30, hover white/60)
- Separator: " / "
- Horse name (current page): white/60, no link

No other navigation distractions. The journey is: Gallery → Dossier → Acquisition. One way.

---

## 6. Visual & Motion Rules

**Frame:** max-w-6xl mx-auto. px-6 sm:px-10 lg:px-12.

**Colour:**
- Background: pure black (#000000)
- Text: white, white/70, white/50, white/30, white/20
- Gold (#d4a964): unit price, total calculation, primary CTA
- Green (#34D399): investor returns percentage ONLY. No other greens.

**Typography:**
- Headlines: Inter Tight, 300–400 weight, tracking-tight
- Body: Inter Tight, 300 weight, leading-[1.85]
- Labels: 10–11px, uppercase, tracking-[0.2em]
- Monospace values: font-mono, 12px, white/70

**Motion:**
- Page load: static. No entrance animations. The user chose to enter; don't make them wait.
- Image hover (if multi-angle): subtle scale 1.02 on training image scroll. No auto-play.
- Purchase widget: live total update on quantity change, 150ms fade.
- No confetti, no success animation, no celebratory colour flashes. Acquisition is calm. Institutional.

---

## 7. Responsive Breakpoints

| Viewport | Layout | Purchase Widget |
|----------|--------|---------------|
| Desktop (≥1024px) | Side-by-side 1.6fr:1fr | Sticky top-28 |
| Tablet (768–1023px) | Stacked vertical | Static, between narrative and footer |
| Mobile (<768px) | Single column | Bottom sheet or expanded inline, touch-friendly |

**Mobile specifics:**
- Cover media: full width, 16:10 maintained
- Pedigree grid: 2 columns
- Purchase widget: quantity selector as + / − stepper, min touch 44px
- CTA: full-width, pinned above keyboard if possible

---

## 8. Content Sources (Backend Data)

See `BACKEND_DATA_MAP.md` for full API contract. Key fields for this page:

| Field | Source | Used In |
|-------|--------|---------|
| `horse.image_url` | GCS | Cover media |
| `horse.training_images[]` | GCS (optional) | Multi-angle scroll |
| `horse.name` | SSOT | Headline, breadcrumb |
| `horse.story` | SSOT | The Story section |
| `horse.sex/colour/sire/dam` | SSOT | Pedigree grid |
| `horse.microchip/life_number/brands/breeder` | SSOT | Registry |
| `trainer.*` | SSOT | Trainer profile |
| `share_price_cents` | SSOT | Purchase widget |
| `shares_total/sold` | SSOT | Availability |
| `fractional_interest_per_share` | SSOT | Unit detail |
| `leasehold_stake_percentage` | SSOT | Campaign specs |
| `lease_period_months` | SSOT | Campaign specs |
| `lease_start_date` | SSOT | Campaign specs |
| `investor_return_percentage` | SSOT | Campaign specs |
| `status` | SSOT | CTA enabled/disabled |

---

## 9. What This Page Does NOT Do

- ❌ No social sharing buttons. Ownership acquisition is private.
- ❌ No "similar horses" or "you may also like". No upsell.
- ❌ No race record or form guide on this page. That lives in `/stables/{horse}` or MyStable.
- ❌ No chat widget or live support. The design should answer every question.
- ❌ No countdown timers, "only 3 left" urgency, or scarcity messaging. Availability is factual, not manipulative.
- ❌ No video autoplay. User controls all media.
- ❌ No external links in the story body. Keep the user in the flow.

---

## 10. Compliance & Legal Layer

**Visible on page:**
- NZTR licence number in trainer profile (if available)
- Registry information (microchip, life number)
- FMA exemption microcopy below CTA
- Campaign terms (lease period, returns percentage)

**Linked but not displayed inline:**
- Full syndication agreement (PDF)
- Terms of acquisition
- Privacy policy (required for Stripe KYC)

**All links:** Open in new tab, 11px, tracked, white/30. Never interrupt the acquisition flow.

---

## 11. Error & Edge States

| State | Treatment |
|-------|-----------|
| Horse not found | 404 page — "This campaign is no longer active." CTA to `/marketplace` |
| Campaign not published | Render page but disable CTA. "This campaign is not yet open for acquisition." |
| Sold out | Disable CTA. "Fully subscribed." Optional: "Join waitlist" inline form. |
| API failure (partial) | Render available sections. Hide broken sections. No skeleton loaders — use "—" for missing values. |
| Image load failure | Placeholder div: "Photo incoming", bg-zinc-900, centred text white/20 |

---

## 12. Success Metrics

- Conversion rate (CTA click → completed acquisition) > 8%
- Time on page: 60–120 seconds (indicates reading, not bouncing)
- Scroll depth on left column > 80% (indicates narrative engagement)
- Zero support tickets asking "how do I buy?" (indicates clarity)
- Stripe KYC completion rate > 70% (indicates flow trust)

---

## 13. Related Briefs

- `MARKETPLACE_GALLERY.md` — the `/marketplace` page (atmosphere + curiosity)
- `BACKEND_DATA_MAP.md` — API contracts for both pages
- `MYSTABLE_DASHBOARD.md` — post-acquisition destination (not yet written)

---

## Context Chain
<- inherits from: /home/evo/workspace/DNA/brand/BRAND_NARRATIVE.md
<- inherits from: /home/evo/workspace/DNA/brand/BRAND_SYSTEM.md
<- inherits from: MARKETPLACE_GALLERY.md
-> overrides by: none
-> used by: 02_website build
-> next: MYSTABLE_DASHBOARD.md (the post-acquisition experience)
