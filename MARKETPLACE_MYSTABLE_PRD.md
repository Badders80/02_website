# Marketplace & MyStable — PRD

## Goal

Two pages that turn site visitors into token holders and give holders a dashboard to track their investments.

---

## User Journey

```
Visitor → /marketplace → clicks listing → /marketplace/[slug] → reviews details
  → clicks "Acquire" → Stripe KYC + Checkout → /mystable (holding appears)
```

```
Existing holder → /mystable → logs in → sees holdings, horse details, stable logs
```

---

## Marketplace (`/marketplace`)

### What it shows
Grid of campaign cards from `hlts.json` where `marketplace_visible: TRUE` and `listing_status: active`.

Each card: horse image, name, story, pedigree, trainer/stable, price per share, shares remaining, wins/placed, next race.

### States
| State | What renders |
|---|---|
| Active listings available | Grid of cards |
| All shares sold | Card shows "Fully Subscribed" — no buy button |
| No listings | Empty state: "No open campaigns. Check back soon." |
| Draft listings | Hidden (marketplace_visible: FALSE) |

### Detail page (`/marketplace/[slug]`)
Tabs: Details, Trainer, Race Record. Documents tab removed (GCS retired — no doc URLs).

**Details tab:** Story, pedigree, stats (wins/placed/next), lease terms (duration, investor return %, no capital calls), price per share, shares remaining.

**Trainer tab:** Trainer name, stable, location.

**Race Record tab:** Wins, placings, next race. Sourced from hlts.json fields. Loveracing.nz link if we have the horse ID.

### Buy flow
"Acquire" CTA → if not logged in, redirect to `/auth/login?redirect=/marketplace/[slug]` → if not KYC verified, redirect to KYC flow → if verified, Stripe Checkout → success redirect to `/mystable`.

---

## MyStable (`/mystable`)

### What it shows
Authenticated user's personal dashboard.

### States
| State | What renders |
|---|---|
| Not logged in | Blurred preview + sign-in overlay (current behaviour) |
| Logged in, no holdings | Empty state + "Go to Marketplace" CTA (current behaviour) |
| Logged in, has holdings | Dashboard with holdings list, horse details, stable logs |
| Logged in, KYC pending | OnboardingFlow shows step 2 (verify identity) |

### Dashboard sections

**My Horses** — list of holdings from `holdings.json` filtered by user email + kyc_status: verified. Each row: horse image, name, sex, trainer, stake %, acquisition price.

**Stable Logs & Feed** — timeline of content updates. Data source TBD (see Open Questions).

**Right column:**
- Total Valuation — sum of acquisition prices. No fake ROI. Remove the "+8.2% indicative" placeholder.
- Stakes Earnings — real data from distribution records when available, or remove the section entirely until then.
- Registry Actions — quick links (browse campaigns, view stable yards, syndicate agreement).

### OnboardingFlow
3-step tracker: Create Account → Verify Identity → Acquire First Horse. Already built. Stays.

---

## Data Flow

```
Google Sheets (inventory)
  ↓ sync_inventory.py
src/data/*.json
  ↓ Next.js build (SSG)
/marketplace reads hlts.json (+ horses.json for pedigree cross-ref)
/mystable reads holdings.json (+ hlts.json + horses.json for campaign/horse data)
  ↓
Stripe Checkout (buy flow)
  ↓ webhook writes to Google Sheet
sync_inventory.py → rebuild → holding appears in /mystable
```

### JSON files
| File | Contents | Key fields |
|---|---|---|
| `hlts.json` | Campaign/lease data | horse_slug, horse_name, trainer_*, shares_total, shares_sold, price_per_share_nzd, listing_status, marketplace_visible, image_path, story, pedigree, wins, placed, next_up |
| `horses.json` | Horse identity/pedigree | slug, name, microchip, sex, colour, sire_name, dam_name, breeder, image_path |
| `holdings.json` | User holdings | user_email, hlt_id, shares_owned, purchase_date, kyc_status |

---

## Open Questions

1. **Stable Logs & Feed** — where do content updates live? Options: (a) add a `content_updates.json` file managed via Google Sheet, (b) remove the section for now, (c) wire it to existing email update HTML files in `/updates/`.

2. **Holdings seeding** — Prudentia has 23 shares sold. Do we seed `holdings.json` with real investor data now, or does it only populate via Stripe webhook + sync?

3. **Race Record data** — currently `wins`/`placed`/`next_up` are manual fields in hlts.json. Do we want to pull from loveracing.nz automatically, or keep manual?

4. **Stakes Earnings section** — remove entirely until we have real distribution data, or show $0 with "Awaiting first distribution"?

5. **Documents** — remove the tab from the detail page, or wire to local PDF files (PDS, SA, term sheet) stored in `/public/documents/`?

---

## Out of Scope

- Admin panel (dormant)
- GCP backend (retired)
- Real-time price updates
- Secondary market / trading
- Email notifications