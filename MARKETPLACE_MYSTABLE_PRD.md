# Marketplace & MyStable — PRD

## Goal

Two pages that turn site visitors into token holders and give holders a dashboard to track their investments.

---

## User Journey

```
/marketplace → grid of horses with status badges
  ↓ click horse
/marketplace/[slug] → horse detail (story, pedigree, trainer, recent starts, gallery)
  ↓ "View Investment Terms" → popup/modal (price, lease terms, returns, length)
  ↓ "Acquire" CTA in popup
/marketplace/[slug]/purchase → purchase workflow
  Step 1: amount selector (how many shares)
  Step 2: summary (amount, % stake, returns on stakes won, length of ownership)
  Step 3: T&C agreement (PDS + SA in popups, scroll to bottom, "I have read and agree")
  Step 4: Stripe Checkout
  Step 5: return to confirmation page
/marketplace/[slug]/confirm → confirmation + welcome note
```

Existing holder journey:
```
/mystable → log in → holdings list, horse details, stable logs, financial summary
```

---

## Status System

Four lifecycle states shown as badges on marketplace cards and detail pages.

| Badge | When | Grid | Detail page | Buy flow |
|---|---|---|---|---|
| Coming Soon | `listing_status: draft`, not yet listed | Teaser card — name, image, no price | Minimal info — story, pedigree, "Coming Soon" notice | None |
| Become An Owner | `listing_status: active`, shares available | Full card — image, name, story, pedigree, trainer, shares remaining | Full detail — story, gallery, pedigree, trainer, recent starts, terms popup | Active |
| Fully Subscribed | `shares_sold >= shares_total`, horse still racing | Greyed card — full info, "Fully Subscribed" badge | Full detail, read-only — no purchase CTA | None |
| Term Completed | `listing_status: retired`, lease ended | Archive card — social proof, "Term Completed" badge | Read-only archive — full history, no purchase | None |

### Status logic
```
if listing_status == "retired" → Term Completed
else if shares_sold >= shares_total → Fully Subscribed
else if listing_status == "active" && shares_available > 0 → Become An Owner
else if listing_status == "draft" → Coming Soon
```

---

## Marketplace (`/marketplace`)

### Grid
Reads `hlts.json`, shows all horses (all statuses). Each card:

- Horse image (cover)
- Name
- Status badge (Coming Soon / Become An Owner / Fully Subscribed / Term Completed)
- Story (short)
- Pedigree (sex / colour / sire x dam)
- Trainer + stable location
- Shares remaining (if Become An Owner only)
- No price on the card — emotional entry, not financial

### Marketplace hero
Optional — reserved section above the grid for a "what is digital syndication" intro. Not built in phase 1. Grid renders directly for now.

---

## Horse Detail Page (`/marketplace/[slug]`)

### Layout: two columns
Left column (narrative) — the horse, the story, the people.
Right column (action) — status badge, shares remaining, "View Investment Terms" CTA.

### Sections (left column, top to bottom)

1. **Cover image + gallery**
   - Cover: first image from `/images/content/horses/[slug]/` folder
   - Gallery: 3-4 images, auto-rendered from same folder
   - Folder structure: drop photos in `/public/images/content/horses/[slug]/`, page renders them at build time
   - No JSON field needed — just files in the folder

2. **Pedigree & specifications**
   - Grid: sex, colour, sire, dam
   - Sourced from `horses.json` (cross-referenced by slug)

3. **The story**
   - Horse narrative — `story` field from `hlts.json`
   - Can contain multiple paragraphs (split on `\n\n`)

4. **Trainer profile**
   - Trainer name, stable, location
   - From `hlts.json` (trainer_name, trainer_stable, trainer_location)

5. **Recent starts**
   - Summary stats: wins, placings, next race (`wins`, `placed`, `next_up` from `hlts.json`)
   - Deep link to loveracing.nz full race record (if horse ID available)
   - No race-by-race data stored locally — just summary + external link

6. **Ownership experience** (reserved — not built in phase 1)
   - Placeholder section for hype reel / owner content / video
   - Built after the core flow works end to end

7. **Registry information**
   - Microchip, life number, breeder
   - From `horses.json`

### Right column (action panel)

- Status badge
- Shares remaining (if Become An Owner)
- "View Investment Terms" CTA → opens popup/modal

### Investment Terms popup

Modal overlay on the detail page. Shows:

- Price per share (NZD)
- Total lease percentage
- Lease period (months)
- Lease start date
- Investor return % (of prize money)
- Total shares / shares available
- No capital calls note
- "Acquire" CTA → navigates to `/marketplace/[slug]/purchase`

Not shown on the popup: dollar totals, ROI projections, yield. Just the structural terms.

---

## Purchase Flow (`/marketplace/[slug]/purchase`)

Separate URL. Multi-step form on one page (not separate routes per step).

### Step 1 — Amount selector
- Slider or stepper: how many shares (1 to shares_available)
- Live calculation: total cost = shares × price_per_share_nzd
- "Continue" button

### Step 2 — Summary
- Shares selected
- Total purchase amount (NZD)
- Percentage stake (shares / total shares × leasehold_stake_pct)
- Return on stakes won (investor_return_pct)
- Length of ownership (lease_period_months)
- "Continue" button

### Step 3 — T&C agreement
- Two document popups: PDS and Syndicate Agreement
- Each opens in a modal, user must scroll to bottom
- After scrolling to bottom, "I have read the Product Disclosure Statement" checkbox enables
- After scrolling to bottom, "I have read the Syndicate Agreement" checkbox enables
- Both checkboxes must be checked to continue
- Agreement recorded in Stripe checkout metadata (timestamp, doc version) for audit trail
- "Continue to Payment" button

### Step 4 — Stripe Checkout
- Redirect to Stripe Checkout
- `client_reference_id` ties checkout to user + holding info
- Success URL: `/marketplace/[slug]/confirm?success=true`
- Cancel URL: `/marketplace/[slug]/purchase`

### Step 5 — Confirmation page (`/marketplace/[slug]/confirm`)
- "You're now an owner" message
- Holding summary: shares, stake %, horse name
- What happens next (welcome note)
- Link to `/mystable`
- Later: update preferences (email / Telegram / none)

---

## Documents

### Source
PDS and Syndicate Agreement PDFs scraped from Tokinvest portal, stored locally.

### Current inventory

| Horse | PDS | SA | Status |
|---|---|---|---|
| Prudentia | ✅ `prudentia-10__pds.pdf` (19pp) | ✅ `prudentia-10__syndicate-agreement.pdf` (5pp) | Ready |
| Hottathanafantasy | ✅ `hottathanafantasy-11__pds.pdf` (15pp) | ✅ `hottathanafantasy-11__syndicate-agreement.pdf` (5pp) | Ready |
| First Gear | ❌ | ❌ | Placeholder needed |
| I Stole A Manolo | ❌ | ❌ | Placeholder needed |

### Storage
- PDFs copied to `/public/documents/[slug]/pds.pdf` and `/public/documents/[slug]/syndicate-agreement.pdf`
- Placeholder PDF for horses without docs (generic "Documents being prepared" notice)
- Long-term: Google Drive → sync script downloads to same paths

### In the purchase flow
- PDS and SA open in modal popups (embedded PDF viewer or iframe)
- User must scroll to bottom to enable the agreement checkbox
- Not a real e-signature — documented consent (standard for this type of offering)

---

## MyStable (`/mystable`)

### What it shows
Authenticated user's personal dashboard for post-purchase management.

### States

| State | What renders |
|---|---|
| Not logged in | Blurred preview + sign-in overlay (current behaviour) |
| Logged in, no holdings | Empty state + "Go to Marketplace" CTA |
| Logged in, KYC pending | OnboardingFlow shows step 2 (verify identity) |
| Logged in, has holdings | Dashboard |

### Dashboard sections

**My Horses** — holdings list from `holdings.json` filtered by user email + `kyc_status: verified`. Each row:
- Horse image, name, sex, trainer
- Stake %
- Acquisition price
- Sourced from: `holdings.json` → `hlts.json` (campaign data) → `horses.json` (pedigree)

**Stable Logs & Feed** — timeline of content updates.
- Data source TBD — not built in phase 1
- Reserved section, shows "No updates yet" for now

**Financial summary (right column):**
- Total Valuation — sum of acquisition prices. No fake ROI. Remove the "+8.2% indicative" placeholder.
- Stakes Earnings — real data from distribution records when available, or remove section entirely until then
- Registry Actions — quick links (browse campaigns, view stable yards, syndicate agreement)

**OnboardingFlow** — 3-step tracker: Create Account → Verify Identity → Acquire First Horse. Already built. Stays.

---

## Confirmations

### After successful purchase:

1. **Holder: welcome email** (TODO)
   - Holding confirmed
   - What happens next (reporting cycle, how to track)
   - Sent via gws/gmail

2. **Admin notification** (TODO)
   - New purchase alert
   - Investor details, horse, share count, amount
   - Sent to alex@evolutionstables.nz

3. **Update preferences** (LATER)
   - Holder chooses: email / Telegram / none
   - Stored in holdings.json or user profile

---

## Data Flow

```
Google Sheets (inventory)
  ↓ sync_inventory.py
src/data/*.json
  ↓ Next.js build (SSG)
/marketplace reads hlts.json (+ horses.json for pedigree cross-ref)
/marketplace/[slug] reads hlts.json + horses.json (+ image folder for gallery)
/marketplace/[slug]/purchase reads hlts.json + horses.json + local PDFs
  ↓ Stripe Checkout
  ↓ webhook writes to Google Sheet
sync_inventory.py → rebuild → holding appears in /mystable
```

### JSON files

| File | Contents | Key fields |
|---|---|---|
| `hlts.json` | Campaign/lease data | horse_slug, horse_name, trainer_*, shares_total, shares_sold, price_per_share_nzd, listing_status, marketplace_visible, image_path, story, pedigree, wins, placed, next_up, lease_period_months, leasehold_stake_pct, investor_return_pct, lease_start_date |
| `horses.json` | Horse identity/pedigree | slug, name, microchip, life_number, sex, colour, sire_name, dam_name, breeder, foaling_date, image_path |
| `holdings.json` | User holdings | user_email, hlt_id, shares_owned, purchase_date, kyc_status |

### New fields needed in hlts.json
- `loveracing_id` — for the deep link to race record (optional, only if we have it)

### Image folder structure
```
/public/images/content/horses/[slug]/
  ├── 01-cover.jpg (first image = cover)
  ├── 02-gallery.jpg
  ├── 03-gallery.jpg
  └── 04-gallery.jpg
```
Page auto-renders all images in the folder. First image is cover, rest are gallery. No JSON field needed.

### Document storage
```
/public/documents/[slug]/
  ├── pds.pdf
  └── syndicate-agreement.pdf
```

---

## What We Have

- ✅ Marketplace grid page (reads hlts.json, filters by marketplace_visible)
- ✅ Horse detail page (cover image, pedigree, story, trainer, registry, campaign specs)
- ✅ MyStable dashboard (auth-gated, holdings list, onboarding flow)
- ✅ OnboardingFlow component (3-step tracker)
- ✅ Stripe Checkout integration (create-session route + webhook)
- ✅ Firebase Auth (email + Google)
- ✅ KYC flow (Stripe Identity)
- ✅ gws CLI (Google Drive, Sheets, Gmail — authenticated and working)
- ✅ PDS + SA PDFs for Prudentia and Hottathanafantasy (scraped from Tokinvest)
- ✅ VARA issuer declarations + risk disclosures + whitepapers for all 4 horses
- ✅ Tokinvest listing content (overview text for each horse)
- ✅ Sync script (sync_inventory.py — reads Google Sheets, writes JSON)
- ✅ JSON data files (hlts.json, horses.json, holdings.json — seeded)

## What We Don't Have

- ❌ Status badge system (Coming Soon / Become An Owner / Fully Subscribed / Term Completed)
- ❌ Investment Terms popup/modal on detail page
- ❌ Purchase flow page (`/marketplace/[slug]/purchase`)
- ❌ Confirmation page (`/marketplace/[slug]/confirm`)
- ❌ PDS + SA for First Gear and I Stole A Manolo (placeholders needed)
- ❌ Gallery images (3-4 per horse) — only single cover images exist
- ❌ Loveracing.nz horse IDs for race record deep links (some may be in horses.json)
- ❌ Google Sheet created (sync script exists but sheet not set up)
- ❌ Stripe secret key in Vercel env vars
- ❌ Welcome email template + admin notification template
- ❌ Holdings seeded with real Prudentia investor data
- ❌ Documents copied to `/public/documents/`
- ❌ Term Completed status handling in hlts.json (no retired listings yet)
- ❌ Ownership experience section (hype reel — phase 2)

---

## Out of Scope (Phase 1)

- Admin panel (dormant)
- GCP backend (retired)
- Real-time price updates
- Secondary market / trading
- Stable Logs & Feed content (reserved section, empty state for now)
- Ownership experience / hype reel content (reserved section, built in phase 2)
- Update preferences (email / Telegram / none — phase 2)
- Automated loveracing.nz race data scraping (just deep links for now)