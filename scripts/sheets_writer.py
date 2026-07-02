#!/usr/bin/env python3
"""
sheets_writer.py — OAuth-authenticated Google Sheets read/write tool.

Usage:
    # Update specific cells
    python3 scripts/sheets_writer.py --sheet hlts --update "D2=B.A.X Bloodstock,D3=B.A.X Bloodstock"

    # Append a row
    python3 scripts/sheets_writer.py --sheet hlts --append "val1,val2,val3,..."

    # Read all data (debug)
    python3 scripts/sheets_writer.py --sheet hlts --read

First run will print a URL — visit it, authorize, paste the code back.
Token is cached in scripts/token.json for subsequent runs.
"""

import argparse
import json
import os
import sys
from pathlib import Path

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import gspread

SCRIPT_DIR = Path(__file__).parent
CLIENT_SECRET = SCRIPT_DIR / "client-secret.json"
TOKEN_FILE = SCRIPT_DIR / "token.json"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
SHEET_ID = "1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg"


def get_credentials():
    """Load cached token or run OAuth flow."""
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            with open(TOKEN_FILE, "w") as f:
                f.write(creds.to_json())
        else:
            if not CLIENT_SECRET.exists():
                print(f"❌ No client-secret.json at {CLIENT_SECRET}")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET), SCOPES)
            flow.redirect_uri = "urn:ietf:wg:oauth:2.0:oob"
            auth_url, _ = flow.authorization_url(prompt="consent")
            print(f"\nVisit this URL to authorize:\n{auth_url}\n")
            code = input("Paste the authorization code here: ").strip()
            creds = flow.fetch_token(code=code)
            with open(TOKEN_FILE, "w") as f:
                f.write(creds.to_json())
            print(f"✅ Token saved to {TOKEN_FILE}")

    return creds


def get_sheet(sheet_name):
    """Connect to Google Sheets and return the worksheet by name."""
    creds = get_credentials()
    gc = gspread.authorize(creds)
    spreadsheet = gc.open_by_key(SHEET_ID)
    return spreadsheet.worksheet(sheet_name)


def update_cells(sheet_name, updates_str):
    """Update cells from 'A1=val,B2=val2' format."""
    worksheet = get_sheet(sheet_name)
    updates = updates_str.split(",")
    for u in updates:
        cell, _, value = u.partition("=")
        cell = cell.strip()
        value = value.strip()
        if not cell:
            continue
        worksheet.update_acell(cell, value)
        print(f"  ✅ {cell} = {value}")


def append_row(sheet_name, row_str):
    """Append a row from comma-separated values."""
    worksheet = get_sheet(sheet_name)
    row = [v.strip() for v in row_str.split(",")]
    worksheet.append_row(row)
    print(f"  ✅ Appended {len(row)} values to {sheet_name}")


def read_sheet(sheet_name):
    """Print all data from the sheet."""
    worksheet = get_sheet(sheet_name)
    data = worksheet.get_all_records()
    print(json.dumps(data, indent=2, ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser(description="Read/write Google Sheets via OAuth")
    parser.add_argument("--sheet", required=True, help="Sheet tab name (e.g. hlts)")
    parser.add_argument("--update", help="Update cells: 'A1=val,B2=val2'")
    parser.add_argument("--append", help="Append row: 'val1,val2,val3'")
    parser.add_argument("--read", action="store_true", help="Print all data")
    args = parser.parse_args()

    try:
        if args.update:
            print(f"Updating cells in '{args.sheet}'...")
            update_cells(args.sheet, args.update)
            print("Done.")
        elif args.append:
            print(f"Appending to '{args.sheet}'...")
            append_row(args.sheet, args.append)
            print("Done.")
        elif args.read:
            read_sheet(args.sheet)
        else:
            parser.print_help()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()