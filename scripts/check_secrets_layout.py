#!/usr/bin/env python3
"""
Fail if secret dumps reappear at 02_website root.

Allowed at root:
  .env                 (optional tiny non-secret project flags)
  .env.local           (active local secrets)
  .env.local.example   (template only)

Everything else env/key-like at the website root is a violation.
Dumps belong under .secrets/archive/ (gitignored).

Usage:
  python3 scripts/check_secrets_layout.py
  just secrets-check
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

ALLOWED_ENV = {
    ".env",
    ".env.local",
    ".env.local.example",
}

# Filenames that must never sit at website root
FORBIDDEN_EXACT = {
    "vercel-env.json",
    "temp_key.json",
    "website-api-key.json",
    "firebase-service-account.json",
    "client-secret.json",
    "token.json",
    "service-account.json",
}

FORBIDDEN_ENV_PREFIXES = (
    ".env.production",
    ".env.vercel",
    ".env.review",
    ".env.stripe",
    ".env.prod",
    ".env.development",
    ".env.test",
    ".env.option",
)

KEY_JSON = re.compile(r"(?i)(api-key|service-account|client-secret|firebase.*\.json$|credentials)")


def main() -> int:
    bad: list[str] = []

    for p in sorted(ROOT.iterdir()):
        if not p.is_file():
            continue
        name = p.name

        if name.startswith(".env"):
            if name not in ALLOWED_ENV:
                bad.append(name)
            continue

        if name in FORBIDDEN_EXACT:
            bad.append(name)
            continue

        if any(name.startswith(pref) for pref in FORBIDDEN_ENV_PREFIXES):
            bad.append(name)
            continue

        if name.endswith(".json") and KEY_JSON.search(name):
            bad.append(name)

    if bad:
        print("SECRETS LAYOUT VIOLATION — files at 02_website/ root that should not be here:\n")
        for b in bad:
            print(f"  • {b}")
        print(
            "\nAllowed: .env, .env.local, .env.local.example only.\n"
            "Move dumps to .secrets/archive/YYYY-MM-DD/\n"
            "Prod secrets: Vercel env only. See .secrets/README.md and AGENTS.md law 8."
        )
        return 1

    print("OK — secrets layout clean (.env.local + Vercel only; no root dumps).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
