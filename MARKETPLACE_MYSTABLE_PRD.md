# Marketplace & MyStable — PRD

## Goal

Two pages that turn site visitors into token holders and give holders a dashboard to track their investments and communications.

---

## Data Flow (Built)

```
SSOT_Build/data/horses/*.json   → horses.json (identity, URLs, pedigree)
SSOT_Build/data/hlt/LSE-*.json  → hlts.json (pricing, lease terms, shares)
SSOT_Build/data/leases/LSE-*.json → (lease pricing cross-ref)
SSOT_Build/data/trainers/*.json → trainers.json (bios, social, contact)
SSOT_Build/data/owners/OWN-*.json → owners.json (contact, email)
      │
      │  python3 scripts/sync_inventory.py
      ▼
src/data/*.json (local static data)
      │
      ▼  Next.js build (SSG)
/marketplace reads hlts.json + horses.json
/marketplace/[slug] reads hlts.json + horses.json (+ image folder for gallery)
/marketplace/[slug]/purchase reads hlts.json + horses.json + local PDFs
      │
      ▼  Stripe Checkout
      ▼  webhook writes to holdings
sync_inventory.py → rebuild → holding appears in /mystable
```

No Google Sheet middleman. One source of truth: SSOT_Build JSON → sync → website JSON → build.

---

## User Journey

```
/marketplace → grid of horses with status badges (publicly browseable)
  ↓ click horse (triggers authentication redirect if not logged in)
/marketplace/[slug] → horse detail (story, pedigree, trainer, recent starts, gallery)
  ↓ "View Investment Terms" → popup/modal (price, lease terms, returns, length)
  ↓ "Acquire" CTA in popup → check KYC status
      ├─► KYC Verified ────► /marketplace/[slug]/purchase (purchase workflow)
      └─► KYC Unverified ──► Stripe Identity Flow (with fallback lead capture)
```

Purchase workflow:
```
/marketplace/[slug]/purchase (multi-step form on one page)
  Step 1: amount selector (how many shares)
  Step 2: summary (amount, % of horse, returns on stakes won, length of ownership)
  Step 3: T&C agreement (scroll PDS & SA PDF to bottom, checkbox)
  Step 4: Stripe Checkout
  Step 5: return to confirmation page
/marketplace/[slug]/confirm → confirmation + welcome note
```

Existing holder journey:
```
/mystable → log in → holdings list, onboarding tracker
```

---

## Status System (Built)

Four lifecycle states shown as badges on marketplace cards and detail pages.

| Badge | When | Grid | Detail page | Buy flow |
|---|---|---|---|---|
| Coming Soon | `listing_status: draft` | Teaser card — name, image, no price | Minimal info. CTA: "Register Interest" | None |
| Become An Owner | `listing_status: active`, shares available | Full card — image, name, trainer, % subscribed | Full detail. CTA: "View Investment Terms" → Modal → "Acquire" | Active |
| Fully Subscribed | `shares_sold >= shares_total` | Greyed card — "Fully Subscribed" badge | Full detail. CTA: "Join Waitlist" | None |
| Term Completed | `listing_status: retired` | Archive card — "Term Completed" badge | Read-only archive | None |

### Status logic
```
if listing_status == "retired" → Term Completed
else if shares_sold >= shares_total → Fully Subscribed
else if listing_status == "active" && shares_available > 0 → Become An Owner
else if listing_status == "draft" → Coming Soon
```

### Display (Built)
- Marketplace card: "0% subscribed" / "100% subscribed" (not raw unit counts)
- Detail page: same — % subscribed
- Purchase flow: "X% of the horse" (not "total stake")
- No progress bar. 0% = Coming Soon, 100% = Fully Subscribed.

### Current marketplace state

| Horse | Shares | % Subscribed | Badge |
|---|---|---|---|
| First Gear | 20/20 | 100% | Term Completed (retired) |
| Prudentia | 20/20 | 100% | Fully Subscribed |
| Hottathanafantasy | 20/20 | 100% | Fully Subscribed |
| I Stole A Manolo | 0/20 | 0% | Coming Soon |
| Nellie | 0/20 | 0% | Coming Soon |
| TLM x Yearn | 0/20 | 0% | Coming Soon |

---

## Horse Registration Tiers

| Tier | Example | breeding_url | performance_profile_url | Display name |
|---|---|---|---|---|
| Registered + raced | Prudentia, First Gear, I Stole A Manolo | ✅ | ✅ | Registered name |
| Registered + not raced | Hottathanafantasy | ✅ | ❌ | Registered name |
| Not registered | Nellie, TLM x Yearn | ❌ | ❌ | Nickname or Sire x Dam |

Unregistered horses are known by sire x dam until officially registered. May be given a nickname (e.g. "Nellie") before registration. Pedigree can still be built from sire and dam. When registered, they get a loveracing_id, breeding_url, and registered name replaces the nickname.

---

## Trainer Display (Built)

Public-facing: stable name as primary, contact names as subtitle.

| Stable (public) | Contact names (subtitle) |
|---|---|
| Wexford Stables | Lance O'Sullivan & Andrew Scott |
| Stephen Gray Racing | Stephen Gray & Bridget Gray |

Copper Belt Lodge is the physical location, NOT public-facing. It does not appear as a stable name anywhere on the website.

---

## Marketplace Grid (`/marketplace`)

Reads `hlts.json`, shows all visible horses. Each card:
- Horse image (cover)
- Name
- Status badge
- % subscribed (not raw unit count)
- Trainer + stable
- Story (short)
- Pedigree
- No price on the card

---

## Horse Detail Page (`/marketplace/[slug]`)

Two columns. Left = narrative. Right = action panel.

### Left column sections:
1. Cover image + gallery (auto-rendered from `/public/images/content/horses/[slug]/`)
2. Pedigree & specifications (from `horses.json`)
3. The story (from `hlts.json`)
4. Trainer profile (stable name + contact names + location)
5. Recent starts (wins/placed/next_up from `hlts.json` + deep links to loveracing.nz)
6. Registry information (microchip, life number, breeder)

### Right column (action panel):
- Status badge
- % subscribed (if Become An Owner)
- "View Investment Terms" CTA → opens modal
- Breeding Record link (if `breeding_url` exists)
- Full NZTR Record link (if `performance_profile_url` exists)
- No links shown for unregistered horses

### Investment Terms popup:
- Price per share (NZD)
- Total lease percentage
- Lease period (months)
- Lease start date
- Investor return %
- Total shares / shares available
- "No Capital Calls" note
- "Acquire" CTA → navigates to purchase flow

---

## Purchase Flow (`/marketplace/[slug]/purchase`)

Multi-step form on one page.

1. **Amount selector** — stepper 1 to shares_available. Shows total price + "X% of the horse"
2. **Summary** — shares, total NZD, % stake, return %, lease duration
3. **T&C agreement** — PDS + SA in scrollable modals, scroll-to-bottom enables checkbox, both must be checked
4. **Stripe Checkout** — redirect with client_reference_id
5. **Confirmation page** — "You're now an owner" + what happens next + link to MyStable

---

## MyStable (`/mystable`)

| State | What renders |
|---|---|
| Not logged in | Blurred preview + sign-in overlay |
| Logged in, no holdings | Empty state + "Go to Marketplace" CTA |
| Logged in, KYC pending | OnboardingFlow shows step 2 |
| Logged in, has holdings | Dashboard |

Dashboard: My Horses (holdings list), OnboardingFlow (3-step tracker: Create Account → Verify Identity → Acquire First Horse).

---

## Documents

| Horse | PDS | SA | Status |
|---|---|---|---|
| Prudentia | ✅ pds.pdf | ✅ syndicate-agreement.pdf | Ready |
| Hottathanafantasy | ✅ pds.pdf | ✅ syndicate-agreement.pdf | Ready |
| First Gear | ❌ | ❌ | Placeholder needed |
| I Stole A Manolo | ❌ | ❌ | Placeholder needed |

PDFs at `/public/documents/[slug]/pds.pdf` and `/public/documents/[slug]/syndicate-agreement.pdf`.

---

## What's Built ✅

- ✅ Status system (4 badges — all 4 live with real data)
- ✅ Investment Terms popup/modal
- ✅ Purchase flow page (multi-step → Stripe)
- ✅ Confirmation page
- ✅ DetailTabs with real breeding/performance URLs from SSOT
- ✅ MyStable dashboard (auth-gated, holdings list, onboarding flow)
- ✅ OnboardingFlow (3-step tracker)
- ✅ Stripe Checkout integration (create-session route + webhook)
- ✅ Firebase Auth (email + Google)
- ✅ KYC flow (Stripe Identity)
- ✅ SSOT → website sync pipeline (`sync_inventory.py`)
- ✅ % subscribed display (not raw units)
- ✅ Trainer display (stable name + contact names, Copper Belt Lodge hidden)
- ✅ 6 SSOT horse files (4 registered + 2 unregistered)
- ✅ PDS + SA for Prudentia and Hottathanafantasy
- ✅ JSON data files (horses, hlts, trainers, owners — synced from SSOT)

## What's Not Built ❌

- ❌ PDS + SA for First Gear and I Stole A Manolo (placeholder PDFs needed)
- ❌ Gallery images (3-4 per horse) — only mock placeholders
- ❌ Welcome email template + admin notification
- ❌ Holdings seeded with real investor data
- ❌ Stripe secret key in Vercel env vars
- ❌ Investor Inbox / communications tab
- ❌ Documents section in MyStable

## Out of Scope (Phase 1)

- Admin panel (dormant)
- Real-time price updates
- Secondary market / trading
- Stable Logs & Feed content
- Ownership experience / hype reel
- Update preferences (email / Telegram / none)
- Automated loveracing.nz race data scraping