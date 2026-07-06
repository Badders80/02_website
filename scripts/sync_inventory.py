#!/usr/bin/env python3
"""
sync_inventory.py — SSOT → Website JSON sync

Reads canonical data from SSOT_Build/data/ and generates website src/data/*.json.
Merges with existing website JSON to preserve website-only fields (story, image_path,
wins, placed, next_up, shares_sold) that aren't in SSOT.

Usage:
    python3 scripts/sync_inventory.py          # sync from SSOT
    python3 scripts/sync_inventory.py --seed    # legacy seed (hardcoded mock data)

Data flow:
    SSOT_Build/data/horses/*.json   → src/data/horses.json
    SSOT_Build/data/hlt/LSE-*.json  → src/data/hlts.json (merged with leases/)
    SSOT_Build/data/trainers/*.json → src/data/trainers.json
    SSOT_Build/data/owners/*.json   → src/data/owners.json
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
WEBSITE_DIR = SCRIPT_DIR.parent
DATA_DIR = WEBSITE_DIR / "src" / "data"
SSOT_DIR = Path("/home/evo/workspace/projects/SSOT_Build/data")

# Ensure data dir exists
DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def load_json_list(glob_pattern: str, base_dir: Path) -> list[dict]:
    """Load all JSON files matching glob pattern from base_dir, sorted."""
    results = []
    for f in sorted(base_dir.glob(glob_pattern)):
        results.append(load_json(f))
    return results


def load_existing_website_json(filename: str) -> list[dict]:
    """Load existing website JSON for merging website-only fields."""
    path = DATA_DIR / filename
    if not path.exists():
        return []
    return load_json(path)


def write_json(filename: str, data: list[dict]) -> None:
    path = DATA_DIR / filename
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  ✅ {path.name} — {len(data)} records")


# ─── Horse sync ───────────────────────────────────────────────────────────────

# Slug mapping: SSOT horse_name → website slug (for URL stability)
HORSE_SLUG_MAP = {
    "Prudentia": "prudentia",
    "First Gear": "first-gear",
    "Hottathanafantasy": "hottathanafantasy",
    "I Stole A Manolo": "i-stole-a-manolo",
    "Nellie": "nellie",
    "TLM x Yearn": "tlm-x-yearn",
}


def sync_horses() -> list[dict]:
    """Sync horses from SSOT → src/data/horses.json."""
    print("Syncing horses...")
    ssot_horses = load_json_list("*.json", SSOT_DIR / "horses")
    existing = load_existing_website_json("horses.json")
    existing_map = {h.get("slug") or h.get("name_slug") or h.get("id", ""): h for h in existing}

    # Load trainers for trainer info
    trainers = load_json_list("*.json", SSOT_DIR / "trainers")
    trainer_map = {}
    for t in trainers:
        slug = t.get("_meta", {}).get("description", "").lower().replace(" ", "-")
        # Use trainer_id as key
        tid = t.get("trainer_id", "")
        if tid:
            trainer_map[tid] = t
        # Also map by trainer_slug (filename)
        trainer_map[t.get("trainer_name", "").lower()] = t

    results = []
    for ssot_h in ssot_horses:
        identity = ssot_h.get("identity", {})
        pedigree = ssot_h.get("pedigree", {})
        horse_name = identity.get("horse_name", "")
        slug = HORSE_SLUG_MAP.get(horse_name, horse_name.lower().replace(" ", "-"))

        # Get trainer info from trainer_slug
        trainer_slug = ssot_h.get("trainer_slug")
        trainer = None
        if trainer_slug:
            trainer_path = SSOT_DIR / "trainers" / f"{trainer_slug}.json"
            if trainer_path.exists():
                trainer = load_json(trainer_path)

        # Merge with existing website data for website-only fields
        existing_h = existing_map.get(slug, {})

        # Determine display name
        if identity.get("identity_status") == "unregistered":
            display_name = identity.get("display_name") or identity.get("sire_x_dam") or horse_name
        else:
            display_name = horse_name

        # Trainer display: stable_name is public-facing, contact_name is the people
        trainer_name = ""
        trainer_stable = ""
        trainer_location = ""
        trainer_contact_name = ""
        if trainer:
            # For Stephen Gray: public-facing is "Stephen Gray Racing", NOT "Copper Belt Lodge"
            if "stephen-gray" in (trainer_slug or "").lower():
                trainer_name = "Stephen Gray"
                trainer_stable = "Stephen Gray Racing"
                trainer_location = "Palmerston North NZ"
            else:
                trainer_name = trainer.get("trainer_name", "")
                trainer_stable = trainer.get("stable_name", trainer_name)
                trainer_location = trainer.get("location", "").replace(", New Zealand", " NZ").replace("Matamata", "Matamata NZ")
            trainer_contact_name = trainer.get("contact_name", "")

        # Fallback to existing website data if SSOT didn't provide trainer
        if not trainer_name:
            trainer_name = existing_h.get("trainer_name", "")
            trainer_stable = existing_h.get("trainer_stable", "")
            trainer_location = existing_h.get("trainer_location", "")

        horse = {
            "name": horse_name,
            "display_name": display_name,
            "slug": slug,
            "microchip": identity.get("microchip_number") or "",
            "life_number": identity.get("nztr_life_number") or "",
            "loveracing_id": str(identity.get("loveracing_id") or "") if identity.get("loveracing_id") else "",
            "foaling_date": identity.get("foaling_date") or "",
            "sex": (identity.get("sex") or "").lower(),
            "colour": identity.get("colour") or existing_h.get("colour", ""),
            "sire_name": pedigree.get("sire_name") or existing_h.get("sire_name", ""),
            "dam_name": pedigree.get("dam_name") or existing_h.get("dam_name", ""),
            "breeder": existing_h.get("breeder", ""),
            "status": "active" if identity.get("horse_status") == "active" else existing_h.get("status", "active"),
            "image_path": existing_h.get("image_path", f"/images/content/horses/{slug}.png"),
            "story": existing_h.get("story", ""),
            "trainer_name": trainer_name,
            "trainer_stable": trainer_stable,
            "trainer_location": trainer_location,
            "trainer_contact_name": trainer_contact_name,
            "wins": existing_h.get("wins", "0"),
            "placed": existing_h.get("placed", "0"),
            "next_up": existing_h.get("next_up", "TBD"),
            "breeding_url": identity.get("breeding_url"),
            "performance_profile_url": identity.get("performance_profile_url"),
            "identity_status": identity.get("identity_status", "verified"),
        }
        results.append(horse)

    write_json("horses.json", results)
    return results


# ─── HLT sync ──────────────────────────────────────────────────────────────────

def sync_hlts(horses: list[dict]) -> list[dict]:
    """Sync HLTs from SSOT → src/data/hlts.json."""
    print("Syncing HLTs...")
    ssot_hlts = load_json_list("LSE-*.json", SSOT_DIR / "hlt")
    ssot_leases = load_json_list("LSE-*.json", SSOT_DIR / "leases")
    lease_map = {l.get("lease_id"): l for l in ssot_leases}

    existing = load_existing_website_json("hlts.json")
    existing_map = {}
    for h in existing:
        slug = h.get("horse_slug") or h.get("id", "")
        existing_map[slug] = h

    # Build microchip → horse slug map
    microchip_to_slug = {}
    slug_to_horse = {}
    for h in horses:
        if h.get("microchip"):
            microchip_to_slug[h["microchip"]] = h["slug"]
        slug_to_horse[h["slug"]] = h

    # Load trainers for display mapping
    trainers = load_json_list("*.json", SSOT_DIR / "trainers")
    trainer_by_id = {}
    for t in trainers:
        tid = t.get("trainer_id", "")
        if tid:
            trainer_by_id[tid] = t

    results = []
    for ssot_hlt in ssot_hlts:
        lease_id = ssot_hlt.get("lease_id", "")
        horse_microchip = ssot_hlt.get("horse_microchip", "")
        horse_slug = microchip_to_slug.get(horse_microchip, "")
        horse_name = ssot_hlt.get("horse_name", "")
        horse = slug_to_horse.get(horse_slug, {})

        # Get lease pricing
        lease = lease_map.get(lease_id, {})

        # Trainer display
        trainer_id = ssot_hlt.get("trainer_id", "")
        trainer = trainer_by_id.get(trainer_id, {})
        if "stephen-gray" in (trainer.get("trainer_name", "") + trainer_id).lower():
            trainer_stable = "Stephen Gray Racing"
            trainer_location = "Palmerston North NZ"
        else:
            trainer_stable = ssot_hlt.get("trainer_name", trainer.get("stable_name", ""))
            trainer_location = horse.get("trainer_location", "")

        # Merge with existing for website-only fields
        existing_hlt = existing_map.get(horse_slug, {})

        # Determine listing status
        # SSOT "status" reflects document workflow, not marketplace visibility
        # Horses with sold shares should be active on the marketplace
        # (getCampaignStatus will show "Fully Subscribed" when shares_sold >= shares_total)
        hlt_status = ssot_hlt.get("status", "draft")
        listing_status = existing_hlt.get("listing_status") or ("active" if hlt_status in ("complete", "published") else "draft")
        # Override: if this horse has been sold before (shares_sold > 0 in existing), keep it active
        if int(existing_hlt.get("shares_sold") or 0) > 0:
            listing_status = "active"
        marketplace_visible = listing_status == "active"

        # Shares: preserve from existing for website-only fields
        # SSOT num_tokens is the token count, but website may use a different share count
        shares_total = int(existing_hlt.get("shares_total") or ssot_hlt.get("num_tokens") or 100)
        shares_sold = int(existing_hlt.get("shares_sold") or 0)
        # Prudentia correction: fully subscribed
        if horse_slug == "prudentia":
            shares_sold = shares_total  # Fully sold out

        # Pricing from lease
        price_per_share = float(lease.get("token_price_nzd") or ssot_hlt.get("token_price_nzd") or existing_hlt.get("price_per_share_nzd") or 0)

        # Lease terms
        leasehold_stake = float(ssot_hlt.get("percentage_leased") or lease.get("percent_leased") or 0)
        investor_return = int(ssot_hlt.get("investor_stakes_split") or lease.get("investor_share_percent") or 0)
        lease_months = int(ssot_hlt.get("lease_length_months") or lease.get("duration_months") or 0)
        lease_start = ssot_hlt.get("lease_start_date") or lease.get("start_date") or ""
        lease_end = ssot_hlt.get("lease_end_date") or lease.get("end_date") or ""

        hlt = {
            "id": f"hlt-{horse_slug}",
            "horse_slug": horse_slug,
            "horse_name": horse_name,
            "horse_microchip": horse_microchip,
            "owner_name": ssot_hlt.get("owner_name", ""),
            "owner_id": ssot_hlt.get("owner_id", ""),
            "trainer_name": horse.get("trainer_name", ""),
            "trainer_stable": trainer_stable,
            "trainer_location": trainer_location,
            "trainer_id": trainer_id,
            "lease_period_months": lease_months,
            "lease_start_date": lease_start,
            "lease_end_date": lease_end,
            "leasehold_stake_pct": leasehold_stake,
            "investor_return_pct": investor_return,
            "shares_total": shares_total,
            "shares_sold": shares_sold,
            "price_per_share_nzd": price_per_share,
            "listing_status": listing_status,
            "marketplace_visible": marketplace_visible,
            "image_path": horse.get("image_path", existing_hlt.get("image_path", "")),
            "story": horse.get("story", existing_hlt.get("story", "")),
            "pedigree": existing_hlt.get("pedigree", f"{horse.get('sex', '')} / {horse.get('colour', '')} / {horse.get('sire_name', '')} x {horse.get('dam_name', '')}"),
            "wins": horse.get("wins", "0"),
            "placed": horse.get("placed", "0"),
            "next_up": horse.get("next_up", "TBD"),
        }
        results.append(hlt)

    # Add unregistered horses (Nellie, TLM x Yearn) as draft HLTs from existing data
    for slug, existing_hlt in existing_map.items():
        if slug not in [r["horse_slug"] for r in results]:
            # Preserve existing entry for horses without SSOT HLT records
            hlt = dict(existing_hlt)
            hlt["listing_status"] = "draft"
            hlt["marketplace_visible"] = False
            results.append(hlt)

    write_json("hlts.json", results)
    return results


# ─── Trainer sync ──────────────────────────────────────────────────────────────

def sync_trainers() -> list[dict]:
    """Sync trainers from SSOT → src/data/trainers.json."""
    print("Syncing trainers...")
    ssot_trainers = load_json_list("*.json", SSOT_DIR / "trainers")

    results = []
    for t in ssot_trainers:
        social = t.get("social_links", {})

        # Public-facing stable name: Stephen Gray Racing, NOT Copper Belt Lodge
        stable_name = t.get("stable_name", "")
        if "copper belt" in stable_name.lower():
            stable_name = "Stephen Gray Racing"

        trainer = {
            "id": t.get("trainer_id", ""),
            "name": t.get("trainer_name", ""),
            "stable_name": stable_name,
            "contact_name": t.get("contact_name", ""),
            "location": t.get("location", "").replace(", New Zealand", " NZ"),
            "bio": t.get("bio", ""),
            "website": t.get("website", ""),
            "x_url": social.get("x_url", ""),
            "instagram_url": social.get("instagram_url", ""),
            "facebook_url": social.get("facebook_url", ""),
            "notable_wins": t.get("notable_wins", []),
            "email": t.get("email", ""),
            "phone": t.get("phone", ""),
        }
        results.append(trainer)

    write_json("trainers.json", results)
    return results


# ─── Owner sync ────────────────────────────────────────────────────────────────

def sync_owners() -> list[dict]:
    """Sync owners from SSOT → src/data/owners.json."""
    print("Syncing owners...")
    ssot_owners = load_json_list("OWN-*.json", SSOT_DIR / "owners")

    results = []
    for o in ssot_owners:
        owner = {
            "id": o.get("owner_id", ""),
            "name": o.get("owner_name", ""),
            "entity_type": o.get("entity_type", ""),
            "contact_name": o.get("contact_name", ""),
            "email": o.get("email", ""),
            "phone": o.get("phone", ""),
            "website": o.get("website", ""),
            "x_url": o.get("x_url", ""),
            "instagram_url": o.get("instagram_url", ""),
            "facebook_url": o.get("facebook_url", ""),
        }
        results.append(owner)

    write_json("owners.json", results)
    return results


# ─── Main ──────────────────────────────────────────────────────────────────────

def sync_all():
    """Sync all data from SSOT → website."""
    print("🔄 Syncing from SSOT_Build → src/data/...")
    if not SSOT_DIR.exists():
        print(f"❌ SSOT directory not found: {SSOT_DIR}")
        sys.exit(1)

    horses = sync_horses()
    sync_hlts(horses)
    sync_trainers()
    sync_owners()

    print(f"\n✅ Sync complete. Files in {DATA_DIR}")


def seed_all():
    """Legacy seed from hardcoded mock data (deprecated)."""
    print("⚠️  --seed is deprecated. Use SSOT sync (default) instead.")
    print("Running legacy seed...")
    # Import the old seed functions from the previous version
    # This is kept for backwards compatibility only
    sync_all()  # Just run the SSOT sync instead


def main():
    parser = argparse.ArgumentParser(description="Sync inventory from SSOT_Build to src/data/*.json")
    parser.add_argument("--seed", action="store_true", help="Legacy seed mode (deprecated — use SSOT sync instead)")
    args = parser.parse_args()

    if args.seed:
        seed_all()
    else:
        sync_all()


if __name__ == "__main__":
    main()