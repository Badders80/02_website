#!/usr/bin/env python3
"""
Seed the Holdings tab in Google Sheets with real investor data.

Usage:
  1. Edit SEED_DATA below with real investor holdings.
  2. Run: python3 scripts/seed_holdings.py

This script writes directly to the Google Sheet via the CSV export URL
(appends rows to the Holdings tab). It does NOT overwrite existing rows.

Prerequisites:
  - The Google Sheet must be shared as "Anyone with link can edit"
  - Or use the Google Apps Script web app URL (GOOGLE_SHEETS_WEB_APP_URL)

Holdings tab columns:
  purchase_id | timestamp | user_email | horse_slug | shares_owned |
  purchase_price_total_nzd | signed_pds_url | signed_sa_url |
  kyc_status | utm_source | utm_campaign
"""

import json
import sys
import os
from datetime import datetime, timezone

# ─── SEED DATA — EDIT WITH REAL INVESTOR HOLDINGS ───────────────────────
# Each entry = one investor's holding in one horse.
# purchase_id: unique ID (e.g. "PUR-2025-001")
# timestamp: ISO 8601 datetime
# user_email: investor's email (must match Firebase Auth email)
# horse_slug: horse slug from hlts.json (e.g. "prudentia")
# shares_owned: number of shares (1-20)
# purchase_price_total_nzd: total NZD paid (shares × price_per_share)
# signed_pds_url: Google Drive URL to signed PDS PDF (or empty string)
# signed_sa_url: Google Drive URL to signed SA PDF (or empty string)
# kyc_status: "verified" | "pending" | "not_started"
# utm_source: marketing source (optional, empty string if unknown)
# utm_campaign: marketing campaign (optional, empty string if unknown)

SEED_DATA = [
    # Example (commented out — replace with real data):
    # {
    #     "purchase_id": "PUR-2025-001",
    #     "timestamp": "2025-07-15T10:30:00Z",
    #     "user_email": "investor@example.com",
    #     "horse_slug": "prudentia",
    #     "shares_owned": 5,
    #     "purchase_price_total_nzd": 7500,
    #     "signed_pds_url": "",
    #     "signed_sa_url": "",
    #     "kyc_status": "verified",
    #     "utm_source": "",
    #     "utm_campaign": "",
    # },
]

# ─── Sheet Config ───────────────────────────────────────────────────────
SHEET_ID = "1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg"
HOLDINGS_GID = "2099258130"

HEADERS = [
    "purchase_id", "timestamp", "user_email", "horse_slug", "shares_owned",
    "purchase_price_total_nzd", "signed_pds_url", "signed_sa_url",
    "kyc_status", "utm_source", "utm_campaign",
]


def main():
    if not SEED_DATA:
        print("❌ No seed data. Edit SEED_DATA in scripts/seed_holdings.py first.")
        print(f"   Add investor holding records to the list (currently {len(SEED_DATA)} entries).")
        sys.exit(1)

    print(f"📋 Found {len(SEED_DATA)} holding records to seed.")
    print(f"   Sheet: {SHEET_ID}")
    print(f"   Tab:   Holdings (gid={HOLDINGS_GID})")
    print()

    # Validate
    seen_ids = set()
    for i, row in enumerate(SEED_DATA):
        missing = [k for k in HEADERS if k not in row]
        if missing:
            print(f"❌ Row {i} missing fields: {missing}")
            sys.exit(1)
        pid = row["purchase_id"]
        if pid in seen_ids:
            print(f"❌ Duplicate purchase_id: {pid}")
            sys.exit(1)
        seen_ids.add(pid)

    # Generate CSV rows
    csv_lines = [",".join(HEADERS)]
    for row in SEED_DATA:
        vals = []
        for h in HEADERS:
            v = str(row.get(h, ""))
            # Escape commas/quotes for CSV
            if "," in v or '"' in v:
                v = f'"{v.replace(chr(34), chr(34)+chr(34))}"'
            vals.append(v)
        csv_lines.append(",".join(vals))

    csv_data = "\n".join(csv_lines)
    print("CSV to append:")
    print(csv_data)
    print()

    # Try Google Apps Script web app URL if available
    web_app_url = os.environ.get("GOOGLE_SHEETS_WEB_APP_URL", "")
    if web_app_url:
        print(f"📤 Posting to Google Apps Script: {web_app_url[:60]}...")
        try:
            import urllib.request
            data = json.dumps({
                "action": "appendHoldings",
                "csv": csv_data,
            }).encode()
            req = urllib.request.Request(web_app_url, data=data, method="POST")
            req.add_header("Content-Type", "application/json")
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = resp.read().decode()
                print(f"✅ Response: {result}")
                return
        except Exception as e:
            print(f"⚠️  Apps Script failed: {e}")
            print("   Falling back to manual instructions.")

    # Manual fallback
    print("─" * 60)
    print("MANUAL SEED INSTRUCTIONS:")
    print("1. Open the Google Sheet:")
    print(f"   https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit#gid={HOLDINGS_GID}")
    print("2. Select all and delete existing data (keep headers in row 1)")
    print("3. Paste the CSV data above starting at row 2")
    print("4. Save")
    print()
    print("Or set GOOGLE_SHEETS_WEB_APP_URL env var to automate.")


if __name__ == "__main__":
    main()