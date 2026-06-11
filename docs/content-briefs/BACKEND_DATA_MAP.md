# Backend Data Map — Marketplace Functions
# Version: 1.0.0
# Status: Active
# Updated: 2026-06-09

## Purpose
What the backend must expose so the `/marketplace` gallery and `/marketplace/{id}` dossier can execute their two distinct jobs:
1. Gallery = emotional welcome + immersion
2. Dossier = transactional clarity + compliance

---

## 1. Gallery Feed (`GET /ssot/hlts?status=published&resolve=true`)

**Job:** Populate the Syndications Gallery cards.

### Required Response Shape
```json
{
  "hlts": [
    {
      "id": "hlt_abc123",
      "status": "published",
      "shares_total": 100,
      "shares_sold": 23,
      "share_price_cents": 150000,
      "fractional_interest_per_share": 1.0,
      "horse_microchip": "982000123456789",
      "horse": {
        "name": "Prudentia",
        "age": 3,
        "sex": "Mare",
        "colour": "Bay",
        "sire_name": "Proisir (AUS)",
        "dam_name": "Prudent (NZ)",
        "image_url": "https://assets.evolutionstables.nz/horse/982000123456789/hero.jpg"
      },
      "trainer": {
        "name": "Mark Walker",
        "stable_name": "Te Akau Racing",
        "location": "Matamata, NZ"
      }
    }
  ]
}
```

### Field Requirements
| Field | Type | Why |
|-------|------|-----|
| `id` | string | Dossier route param |
| `status` | enum | Filter: `published`, `publish_ready` only |
| `shares_total` | int | Availability denominator |
| `shares_sold` | int | Availability numerator |
| `share_price_cents` | int | Convert to `$1,500 NZD` display |
| `fractional_interest_per_share` | float | Badge: `1.0% per unit` |
| `horse_microchip` | string | Asset path key |
| `horse.name` | string | Card headline |
| `horse.age` | int | Card subtitle |
| `horse.sex` | string | Card subtitle |
| `horse.sire_name` | string | Card subtitle |
| `horse.dam_name` | string | Card subtitle |
| `horse.image_url` | URL | Cinema-ratio hero image. MUST be 16:9 or crop-friendly. |
| `trainer.name` | string | Card footer |
| `trainer.stable_name` | string | Card footer |
| `trainer.location` | string | Card footer |

### Empty-State Handling
- Empty array → render "No active campaigns" with waitlist CTA.
- Missing `horse.image_url` → render placeholder `Photo incoming` (never broken image).
- Missing `trainer` → render "Unassigned" (never null crash).

---

## 2. Dossier Feed (`GET /ssot/hlts/{id}?resolve=true`)

**Job:** Power the Asset Profile Dossier page.

### Required Response Shape
```json
{
  "id": "hlt_abc123",
  "status": "published",
  "shares_total": 100,
  "shares_sold": 23,
  "share_price_cents": 150000,
  "fractional_interest_per_share": 1.0,
  "leasehold_stake_percentage": 100,
  "lease_period_months": 36,
  "lease_start_date": "2026-07-01",
  "investor_return_percentage": 80,
  "horse_microchip": "982000123456789",
  "horse": {
    "name": "Prudentia",
    "age": 3,
    "sex": "Mare",
    "colour": "Bay",
    "sire_name": "Proisir (AUS)",
    "dam_name": "Prudent (NZ)",
    "image_url": "https://assets.evolutionstables.nz/horse/982000123456789/hero.jpg",
    "story": "Prudentia is a high-potential 3-year-old filly...",
    "microchip": "982000123456789",
    "life_number": "L12345",
    "left_shoulder_brand": "TK-1",
    "right_shoulder_brand": null,
    "breeder": "Waikato Stud"
  },
  "trainer": {
    "name": "Mark Walker",
    "stable_name": "Te Akau Racing",
    "location": "Matamata, NZ",
    "nztr_license_number": "LIC-12345",
    "bio": "Leveraging decade-long pedigree preparation..."
  },
  "owner": {
    "name": "Evolution Stables"
  }
}
```

### Field Requirements — Narrative Layer (Left Column)
| Field | Type | Why |
|-------|------|-----|
| `horse.image_url` | URL | Cover photo. 16:10 ratio. High res. |
| `horse.story` | text | "The Story" section. Plain text, no HTML. |
| `horse.microchip` | string | Registry section |
| `horse.life_number` | string | Registry section |
| `horse.left_shoulder_brand` | string | Registry section (nullable) |
| `horse.right_shoulder_brand` | string | Registry section (nullable) |
| `horse.breeder` | string | Registry section (nullable) |
| `trainer.name` | string | Trainer profile header |
| `trainer.stable_name` | string | Trainer subtitle |
| `trainer.location` | string | Trainer subtitle |
| `trainer.nztr_license_number` | string | Trust signal. "NZTR Licensed (#LIC-12345)." |
| `trainer.bio` | text | Trainer voice. 2–3 sentences max. |

### Field Requirements — Transaction Layer (Right Column)
| Field | Type | Why |
|-------|------|-----|
| `shares_total` | int | Purchase widget denominator |
| `shares_sold` | int | Purchase widget numerator + availability |
| `share_price_cents` | int | Purchase widget unit price |
| `fractional_interest_per_share` | float | What the buyer owns per unit |
| `leasehold_stake_percentage` | int | Total lease being syndicated |
| `lease_period_months` | int | Lease duration |
| `lease_start_date` | ISO date | Lease commencement |
| `investor_return_percentage` | int | "80% of prize money" |

### Field Requirements — Compliance / Purchase
| Field | Type | Why |
|-------|------|-----|
| `owner.name` | string | Syndicator identity |
| `status` | enum | Only `published` allows purchase. Others = disabled CTA. |

---

## 3. Aggregate Stats Feed (`GET /ssot/system/aggregates`)

**Job:** Section B (Philosophy) optional stat block.

### Required Response Shape
```json
{
  "total_owners": 38,
  "total_campaigns": 3,
  "total_wins": 1,
  "total_starts": 14,
  "total_places": 6,
  "total_earnings_nzd": 45000
}
```

**Fallback:** If endpoint missing or error, hide the stat block entirely. No placeholder numbers.

---

## 4. Image Asset Spec

**Source:** GCS bucket `assets.evolutionstables.nz`

**Path convention:**
- Hero/gallery: `horse/{microchip}/hero.jpg` — 16:9, min 1920x1080, compressed WebP preferred with JPG fallback
- Dossier cover: same asset, rendered at 16:10
- Trainer avatar: `trainer/{trainer_id}/avatar.jpg` — 1:1, 512x512 (optional; initials fallback built in)
- Multi-angle training: `horse/{microchip}/training_{n}.jpg` — 3:2, for future carousel under vignette overlay

**Delivery:** Signed URL or public-read bucket. Frontend never uploads.

---

## 5. API Contract Rules

1. **Resolve flag:** `?resolve=true` must inline `horse`, `trainer`, and `owner` objects. Frontend makes ONE call per page.
2. **Missing relations:** Return `null` for `horse`/`trainer`/`owner` if reference broken. Frontend renders gracefully.
3. **Cents discipline:** All monetary values in integer cents. Frontend divides by 100.
4. **Status filter:** Gallery only shows `published` and `publish_ready`. `draft`, `archived`, `sold_out` excluded.
5. **Rate limit:** Cache gallery feed for 60 seconds. Dossier feed cache 30 seconds. Not real-time trading.

---

## 6. Future Fields (Not Required Now)

| Field | When Needed | Page |
|-------|-------------|------|
| `horse.pedigree_url` | Pedigree section expansion | Dossier |
| `horse.training_videos[]` | Multi-media dossier | Dossier |
| `horse.race_record[]` | Results timeline | Dossier / MyStable |
| `owner.kyc_status` | Gated purchase | PurchaseForm |
| `stripe_price_id` | Live checkout | PurchaseForm |

---

## 7. Frontend → Backend Checklist

- [ ] `GET /ssot/hlts?status=published&resolve=true` returns array with inlined horse + trainer
- [ ] `GET /ssot/hlts/{id}?resolve=true` returns full dossier payload
- [ ] `GET /ssot/system/aggregates` returns stats (optional)
- [ ] GCS paths match `horse/{microchip}/hero.jpg` convention
- [ ] All image URLs are reachable from frontend domain (CORS if cross-origin)
- [ ] Cents discipline enforced — no float dollars anywhere in API

---

## Context Chain
<- inherits from: MARKETPLACE_GALLERY.md
<- inherits from: 01_evolution API spec
-> overrides by: none
-> used by: 02_website build, 01_evolution API development
-> next: ASSET_DOSSIER.md (dossier page content brief)
