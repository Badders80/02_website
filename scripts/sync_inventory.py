#!/usr/bin/env python3
"""
sync_inventory.py — Replay script: reads Google Sheets, writes src/data/*.json

Usage:
    python scripts/sync_inventory.py                    # sync all sheets
    python scripts/sync_inventory.py --sheet horses     # sync one sheet
    python scripts/sync_inventory.py --seed              # seed from existing mock data

The script exports each Google Sheet as CSV, transforms to JSON,
and writes to src/data/. The site reads these at build time.

Sheet IDs are configured in scripts/sheets_config.json.
If no config exists, use --seed to generate initial JSON from existing mock data.
"""

import argparse
import csv
import json
import os
import sys
import urllib.request
from pathlib import Path
from datetime import datetime

# Paths
SCRIPT_DIR = Path(__file__).parent
WEBSITE_DIR = SCRIPT_DIR.parent
DATA_DIR = WEBSITE_DIR / "src" / "data"
CONFIG_FILE = SCRIPT_DIR / "sheets_config.json"

# Ensure data dir exists
DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_config():
    """Load sheet IDs from config file."""
    if not CONFIG_FILE.exists():
        return None
    with open(CONFIG_FILE) as f:
        return json.load(f)


def fetch_sheet_csv(sheet_id, gid="0"):
    """Fetch a Google Sheet as CSV."""
    url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}"
    response = urllib.request.urlopen(url)
    data = response.read().decode("utf-8")
    return data


def csv_to_json(csv_text):
    """Convert CSV text to list of dicts."""
    reader = csv.DictReader(csv_text.splitlines())
    return list(reader)


def write_json(filename, data):
    """Write JSON to src/data/."""
    path = DATA_DIR / filename
    with open(path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  ✅ {path.name} — {len(data)} records")


def transform_hlts(records):
    """Transform raw HLTS CSV rows (strings) to the structure the site expects."""
    transformed = []
    for rec in records:
        r = dict(rec)  # copy
        # Convert numeric fields to int
        for field in [
            "lease_period_months",
            "leasehold_stake_pct",
            "investor_return_pct",
            "syndicate_price_nzd",
            "shares_total",
            "shares_sold",
            "price_per_share_nzd",
        ]:
            if field in r and r[field] != "":
                try:
                    r[field] = int(r[field])
                except (ValueError, TypeError):
                    pass
        # Convert marketplace_visible: "TRUE"/"true"/"1" → true, else false
        mv = str(r.get("marketplace_visible", "")).strip().upper()
        r["marketplace_visible"] = mv in ("TRUE", "true", "1")
        # Build stats object from flat CSV columns, remove the flat keys
        stats = {
            "wins": r.pop("wins", "0") or "0",
            "placed": r.pop("placed", "0") or "0",
            "next_up": r.pop("next_up", "TBD") or "TBD",
        }
        r["stats"] = stats
        # Add id field: "hlt-" + horse_slug (if no id present)
        if not r.get("id"):
            slug = r.get("horse_slug", "")
            if slug:
                r["id"] = "hlt-" + slug
        transformed.append(r)
    return transformed


def transform_horses(records):
    """Transform raw horses CSV rows (strings) to the structure the site expects."""
    transformed = []
    for rec in records:
        r = dict(rec)  # copy
        # Convert loveracing_id to int
        if "loveracing_id" in r and r["loveracing_id"] != "":
            try:
                r["loveracing_id"] = int(r["loveracing_id"])
            except (ValueError, TypeError):
                pass
        # Add id field from slug if missing
        if not r.get("id"):
            slug = r.get("slug", "")
            if slug:
                r["id"] = slug
        # Build stats object from flat CSV columns (same as hlts), remove flat keys
        stats = {
            "wins": r.pop("wins", "0") or "0",
            "placed": r.pop("placed", "0") or "0",
            "next_up": r.pop("next_up", "TBD") or "TBD",
        }
        r["stats"] = stats
        transformed.append(r)
    return transformed


def sync_from_sheets(config):
    """Sync all sheets from Google Sheets."""
    sheets = config.get("sheets", {})
    for name, sheet_info in sheets.items():
        sheet_id = sheet_info["id"]
        gid = sheet_info.get("gid", "0")
        print(f"Syncing {name}...")
        try:
            csv_text = fetch_sheet_csv(sheet_id, gid)
            records = csv_to_json(csv_text)
            if name == "hlts":
                records = transform_hlts(records)
            elif name == "horses":
                records = transform_horses(records)
            # trainers, owners, holdings: pass through as-is
            write_json(f"{name}.json", records)
        except Exception as e:
            print(f"  ❌ {name}: {e}")


def seed_horses():
    """Seed horses.json from existing HORSES.csv + marketplace mock data."""
    horses = [
        {
            "id": "prudentia",
            "name": "Prudentia",
            "name_slug": "prudentia",
            "microchip": "985125000126462",
            "life_number": "NZ00427416",
            "loveracing_id": 427416,
            "foaling_date": "2021-11-01",
            "sex": "mare",
            "colour": "Bay",
            "sire_name": "Proisir (AUS) 2009",
            "dam_name": "Little Bit Irish (NZ) 2012",
            "breeder": "Goldeye Trust",
            "status": "active",
            "image_path": "/images/content/stables/prudentia-action.png",
            "story": "An exciting filly that has already returned returns to investors. Much more to come from her this winter.",
            "trainer_name": "Lance O'Sullivan & Andrew Scott",
            "trainer_stable": "Wexford Stables",
            "trainer_location": "Matamata, NZ",
            "stats": {"wins": "2", "placed": "4", "next_up": "23 June"},
        },
        {
            "id": "hottathanafantasy",
            "name": "Hottathanafantasy",
            "name_slug": "hottathanafantasy",
            "microchip": "985125000139165",
            "life_number": "NZ00452052",
            "loveracing_id": 452052,
            "foaling_date": "2022-11-01",
            "sex": "filly",
            "colour": "Bay",
            "sire_name": "Contributer",
            "dam_name": "Whiffle",
            "breeder": "Goldeye Trust",
            "status": "active",
            "image_path": "/images/content/horses/Hottathan-BG.png",
            "story": "An elite international pedigree showing immense maturity in pre-training. A sharp sprinter in the making.",
            "trainer_name": "Lance O'Sullivan & Andrew Scott",
            "trainer_stable": "Wexford Stables",
            "trainer_location": "Matamata, NZ",
            "stats": {"wins": "0", "placed": "0", "next_up": "TBD"},
        },
        {
            "id": "first-gear",
            "name": "First Gear",
            "name_slug": "first-gear",
            "microchip": "985125000126713",
            "life_number": "NZ00428364",
            "loveracing_id": 428364,
            "foaling_date": "2020-11-01",
            "sex": "gelding",
            "colour": "Bay",
            "sire_name": "Derryn",
            "dam_name": "A'Guin Ace",
            "breeder": "Stephen Grey Racing",
            "status": "active",
            "image_path": "/images/content/horses/FirstGear-BG.png",
            "story": "An impressive pedigree showing great progress in early education. Currently in pre-training under Stephen Gray.",
            "trainer_name": "Stephen Gray",
            "trainer_stable": "Stephen Gray Racing",
            "trainer_location": "Palmerston North, NZ",
            "stats": {"wins": "0", "placed": "0", "next_up": "TBD"},
        },
        {
            "id": "i-stole-a-manolo",
            "name": "I Stole A Manolo",
            "name_slug": "i-stole-a-manolo",
            "microchip": "985125000139219",
            "life_number": "NZ00451442",
            "loveracing_id": 451442,
            "foaling_date": "2022-11-01",
            "sex": "filly",
            "colour": "Grey",
            "sire_name": "Satono Aladdin",
            "dam_name": "Canuhandleajandal",
            "breeder": "Goldeye Trust",
            "status": "active",
            "image_path": "/images/content/horses/IStole-BG.png",
            "story": "A stylish grey filly with a pedigree suggesting middle-distance strength. Currently spelling after early breaking-in.",
            "trainer_name": "Lance O'Sullivan & Andrew Scott",
            "trainer_stable": "Wexford Stables",
            "trainer_location": "Matamata, NZ",
            "stats": {"wins": "0", "placed": "0", "next_up": "Trial (Sep)"},
        },
    ]
    write_json("horses.json", horses)


def seed_hlts():
    """Seed hlts.json from marketplace mock data."""
    hlts = [
        {
            "id": "hlt-prudentia",
            "horse_microchip": "985125000126462",
            "horse_name": "Prudentia",
            "horse_slug": "prudentia",
            "owner_name": "B.A.X Bloodstock",
            "trainer_name": "Lance O'Sullivan & Andrew Scott",
            "trainer_stable": "Wexford Stables",
            "trainer_location": "Matamata, NZ",
            "lease_period_months": 36,
            "lease_start_date": "2024-12-01",
            "leasehold_stake_pct": 100,
            "investor_return_pct": 80,
            "syndicate_price_nzd": 150000,
            "shares_total": 100,
            "shares_sold": 23,
            "price_per_share_nzd": 1500,
            "listing_status": "active",
            "marketplace_visible": True,
            "image_path": "/images/content/stables/prudentia-action.png",
            "story": "An exciting filly that has already returned returns to investors. Much more to come from her this winter.",
            "pedigree": "Mare / Bay / Proisir (AUS) x Little Bit Irish (NZ)",
            "stats": {"wins": "2", "placed": "4", "next_up": "23 June"},
        },
        {
            "id": "hlt-hottathanafantasy",
            "horse_microchip": "985125000139165",
            "horse_name": "Hottathanafantasy",
            "horse_slug": "hottathanafantasy",
            "owner_name": "B.A.X Bloodstock",
            "trainer_name": "Lance O'Sullivan & Andrew Scott",
            "trainer_stable": "Wexford Stables",
            "trainer_location": "Matamata, NZ",
            "lease_period_months": 36,
            "lease_start_date": "2025-06-01",
            "leasehold_stake_pct": 100,
            "investor_return_pct": 80,
            "syndicate_price_nzd": 150000,
            "shares_total": 100,
            "shares_sold": 0,
            "price_per_share_nzd": 1500,
            "listing_status": "draft",
            "marketplace_visible": False,
            "image_path": "/images/content/horses/Hottathan-BG.png",
            "story": "An elite international pedigree showing immense maturity in pre-training. A sharp sprinter in the making.",
            "pedigree": "Filly / Bay / Contributer x Whiffle",
            "stats": {"wins": "0", "placed": "0", "next_up": "TBD"},
        },
        {
            "id": "hlt-first-gear",
            "horse_microchip": "985125000126713",
            "horse_name": "First Gear",
            "horse_slug": "first-gear",
            "owner_name": "Stephen Grey Racing",
            "trainer_name": "Stephen Gray",
            "trainer_stable": "Stephen Gray Racing",
            "trainer_location": "Palmerston North, NZ",
            "lease_period_months": 36,
            "lease_start_date": "2025-06-01",
            "leasehold_stake_pct": 100,
            "investor_return_pct": 80,
            "syndicate_price_nzd": 150000,
            "shares_total": 100,
            "shares_sold": 0,
            "price_per_share_nzd": 1500,
            "listing_status": "draft",
            "marketplace_visible": False,
            "image_path": "/images/content/horses/FirstGear-BG.png",
            "story": "An impressive pedigree showing great progress in early education. Currently in pre-training under Stephen Gray.",
            "pedigree": "Gelding / Bay / Derryn x A'Guin Ace",
            "stats": {"wins": "0", "placed": "0", "next_up": "TBD"},
        },
        {
            "id": "hlt-i-stole-a-manolo",
            "horse_microchip": "985125000139219",
            "horse_name": "I Stole A Manolo",
            "horse_slug": "i-stole-a-manolo",
            "owner_name": "B.A.X Bloodstock",
            "trainer_name": "Lance O'Sullivan & Andrew Scott",
            "trainer_stable": "Wexford Stables",
            "trainer_location": "Matamata, NZ",
            "lease_period_months": 36,
            "lease_start_date": "2025-06-01",
            "leasehold_stake_pct": 100,
            "investor_return_pct": 80,
            "syndicate_price_nzd": 150000,
            "shares_total": 100,
            "shares_sold": 0,
            "price_per_share_nzd": 1500,
            "listing_status": "draft",
            "marketplace_visible": False,
            "image_path": "/images/content/horses/IStole-BG.png",
            "story": "A stylish grey filly with a pedigree suggesting middle-distance strength. Currently spelling after early breaking-in.",
            "pedigree": "Filly / Grey / Satono Aladdin x Canuhandleajandal",
            "stats": {"wins": "0", "placed": "0", "next_up": "Trial (Sep)"},
        },
    ]
    write_json("hlts.json", hlts)


def seed_trainers():
    """Seed trainers.json."""
    trainers = [
        {
            "id": "trainer-sam-spratt",
            "name": "Lance O'Sullivan & Andrew Scott",
            "stable_name": "Wexford Stables",
            "location": "Matamata, NZ",
            "email": "",
        },
        {
            "id": "trainer-stephen-gray",
            "name": "Stephen Gray",
            "stable_name": "Stephen Gray Racing",
            "location": "Palmerston North, NZ",
            "email": "",
        },
    ]
    write_json("trainers.json", trainers)


def seed_owners():
    """Seed owners.json."""
    owners = [
        {
            "id": "owner-goldeye-trust",
            "name": "B.A.X Bloodstock",
            "email": "",
            "type": "syndicate",
        },
        {
            "id": "owner-mw-rose",
            "name": "Stephen Grey Racing",
            "email": "",
            "type": "individual",
        },
    ]
    write_json("owners.json", owners)


def seed_holdings():
    """Seed holdings.json — empty for now (no active investors in sheet yet)."""
    holdings = []
    write_json("holdings.json", holdings)


def seed_all():
    """Seed all JSON files from existing mock data."""
    print("🌱 Seeding src/data/ from existing mock data...")
    seed_horses()
    seed_hlts()
    seed_trainers()
    seed_owners()
    seed_holdings()
    print(f"\n✅ Seed complete. Files in {DATA_DIR}")


def main():
    parser = argparse.ArgumentParser(description="Sync inventory from Google Sheets to src/data/*.json")
    parser.add_argument("--sheet", help="Sync a single sheet by name")
    parser.add_argument("--seed", action="store_true", help="Seed from existing mock data (no Google Sheets needed)")
    args = parser.parse_args()

    if args.seed:
        seed_all()
        return

    config = load_config()
    if not config:
        print("❌ No sheets_config.json found. Run with --seed to generate initial data.")
        print(f"   Expected config at: {CONFIG_FILE}")
        sys.exit(1)

    if args.sheet:
        sheet_info = config.get("sheets", {}).get(args.sheet)
        if not sheet_info:
            print(f"❌ Sheet '{args.sheet}' not in config.")
            sys.exit(1)
        print(f"Syncing {args.sheet}...")
        try:
            csv_text = fetch_sheet_csv(sheet_info["id"], sheet_info.get("gid", "0"))
            records = csv_to_json(csv_text)
            if args.sheet == "hlts":
                records = transform_hlts(records)
            elif args.sheet == "horses":
                records = transform_horses(records)
            # trainers, owners, holdings: pass through as-is
            write_json(f"{args.sheet}.json", records)
        except Exception as e:
            print(f"  ❌ {args.sheet}: {e}")
    else:
        print("Syncing all sheets...")
        sync_from_sheets(config)

    print(f"\n✅ Sync complete. Files in {DATA_DIR}")


if __name__ == "__main__":
    main()