#!/usr/bin/env python3
"""
sync_inventory.py — Commercial State & HLT Inventory Sync

Reads exported sidecars (horse_meta_export.json, lease_export.json) from 01_evolution/mission-control/admin/
and generates website src/data/hlts.json.

Usage:
    python3 scripts/sync_inventory.py
"""

import json
import sys
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).resolve().parent
WEBSITE_DIR = SCRIPT_DIR.parent
DATA_DIR = WEBSITE_DIR / "src" / "data"
TOOLS_ADMIN_DIR = WEBSITE_DIR.parent / "01_evolution" / "mission-control" / "admin"

HORSE_META_PATH = TOOLS_ADMIN_DIR / "horse_meta_export.json"
LEASE_EXPORT_PATH = TOOLS_ADMIN_DIR / "lease_export.json"
HLTS_JSON_PATH = DATA_DIR / "hlts.json"

# Ensure data dir exists
DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_json(path: Path) -> list | dict:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_json(filename: str, data: list[dict]) -> None:
    path = DATA_DIR / filename
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  ✅ {path.name} — {len(data)} records")


def sync_hlts() -> list[dict]:
    """Sync HLTs from Mission Control sidecars → src/data/hlts.json."""
    print("Syncing HLTs...")
    
    horse_meta_list = load_json(HORSE_META_PATH) if HORSE_META_PATH.exists() else []
    lease_list = load_json(LEASE_EXPORT_PATH) if LEASE_EXPORT_PATH.exists() else []
    existing_hlts = load_json(HLTS_JSON_PATH) if HLTS_JSON_PATH.exists() else []
    
    # Map lease by horse_slug
    lease_by_slug = {}
    if isinstance(lease_list, list):
        for l in lease_list:
            slug = l.get("horse_slug")
            if slug:
                lease_by_slug[slug] = l

    # Map existing HLT by horse_slug for live shares_sold preservation
    existing_by_slug = {}
    if isinstance(existing_hlts, list):
        for h in existing_hlts:
            slug = h.get("horse_slug") or h.get("id", "").replace("hlt-", "")
            if slug:
                existing_by_slug[slug] = h

    results = []
    if isinstance(horse_meta_list, list):
        for meta in horse_meta_list:
            slug = meta.get("slug") or meta.get("horse_slug") or ""
            if not slug:
                continue

            existing_h = existing_by_slug.get(slug, {})
            lease = lease_by_slug.get(slug, {})

            # Commercial terms precedence
            shares_total = int(lease.get("token_count") or existing_h.get("shares_total") or 20)
            
            # Preserve shares_sold from existing website inventory (no hardcoded slug overrides)
            shares_sold = int(existing_h.get("shares_sold") or 0)

            price_per_share = float(lease.get("token_price_nzd") or existing_h.get("price_per_share_nzd") or 250.0)
            leasehold_stake = float(lease.get("percent_leased") or existing_h.get("leasehold_stake_pct") or 5.0)
            investor_return = int(lease.get("investor_share_percent") or existing_h.get("investor_return_pct") or 75)
            lease_months = int(lease.get("duration_months") or existing_h.get("lease_period_months") or 12)
            lease_start = str(lease.get("start_date") or existing_h.get("lease_start_date") or "2026-01-01")
            lease_end = str(lease.get("end_date") or existing_h.get("lease_end_date") or "2027-06-30")

            listing_status = meta.get("status") or existing_h.get("listing_status") or "active"
            marketplace_visible = listing_status in ("active", "listed", "live")

            hlt_record = {
                "id": f"hlt-{slug}",
                "horse_slug": slug,
                "horse_name": meta.get("display_name") or meta.get("name") or slug.replace("-", " ").title(),
                "horse_microchip": meta.get("microchip") or "",
                "owner_name": existing_h.get("owner_name") or "B.A.X Bloodstock",
                "owner_id": existing_h.get("owner_id") or "OWN-001",
                "trainer_name": meta.get("trainer_name") or "Wexford Stables",
                "trainer_stable": meta.get("trainer_stable") or "Wexford Stables",
                "trainer_location": meta.get("trainer_location") or "Matamata NZ",
                "trainer_id": meta.get("trainer_id") or "TRN-001",
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
                "image_path": meta.get("image_path") or f"/images/content/horses/{slug}-BG.png",
                "story": meta.get("story") or "",
                "pedigree": f"{(meta.get('sex') or 'filly').capitalize()} / {meta.get('sire_name', '')} x {meta.get('dam_name', '')}",
                "wins": str(meta.get("wins", "0")),
                "placed": str(meta.get("placed", "0")),
                "next_up": meta.get("next_up") or "TBD",
            }
            results.append(hlt_record)

    write_json("hlts.json", results)
    return results


if __name__ == "__main__":
    print("🔄 Syncing website commercial inventory...")
    sync_hlts()
    print("✅ Sync complete.")