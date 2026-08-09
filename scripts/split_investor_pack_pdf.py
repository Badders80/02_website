#!/usr/bin/env python3
"""
Split a combined Investor Pack PDF into pds.pdf + syndicate-agreement.pdf
for the checkout e-sign steps (PDS once, SA once).

Usage:
  python3 scripts/split_investor_pack_pdf.py nellie
  python3 scripts/split_investor_pack_pdf.py nellie --source path/to/pack.pdf
"""

from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path

from pypdf import PdfReader, PdfWriter

WEB_DOCS = Path(__file__).resolve().parent.parent / "public" / "documents"
EVO_MAP = {
    "nellie": "almanzor-x-night-danza",
    "tml-x-yearn": "turn-me-loose-x-yearn",
    "i-stole-a-manolo": "i-stole-a-manolo",
    "first-gear": "first-gear",
    "hottathanafantasy": "hottathanafantasy",
    "prudentia": "prudentia",
}
ASSETS = Path(__file__).resolve().parents[2] / "_assets" / "horses"


def find_sa_start(reader: PdfReader) -> int:
    for i, page in enumerate(reader.pages):
        t = re.sub(r"\s+", " ", page.extract_text() or "")
        if re.search(r"PART\s*B", t) and re.search(r"Syndicate\s+Agreement", t):
            return i
    # fallback: last third
    return max(1, (len(reader.pages) * 2) // 3)


def write_range(reader: PdfReader, path: Path, start: int, end: int) -> None:
    w = PdfWriter()
    for i in range(start, end):
        w.add_page(reader.pages[i])
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as f:
        w.write(f)
    print(f"  {path}  pages {start + 1}-{end} ({end - start})")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("slug", help="website horse slug e.g. nellie")
    ap.add_argument("--source", help="combined pack PDF (default: public/documents/{slug}/investor-pack.pdf)")
    args = ap.parse_args()

    web_dir = WEB_DOCS / args.slug
    source = Path(args.source) if args.source else web_dir / "investor-pack.pdf"
    if not source.is_file():
        live = web_dir / f"Investor-Pack-{args.slug}-LIVE.pdf"
        if live.is_file():
            source = live
        else:
            raise SystemExit(f"Source not found: {source}")

    reader = PdfReader(str(source))
    n = len(reader.pages)
    sa = find_sa_start(reader)
    print(f"{args.slug}: {n} pages, SA starts at page {sa + 1}")

    write_range(reader, web_dir / "pds.pdf", 0, sa)
    write_range(reader, web_dir / "syndicate-agreement.pdf", sa, n)
    write_range(reader, web_dir / "sa.pdf", sa, n)

    # keep full pack
    if source.resolve() != (web_dir / "investor-pack.pdf").resolve():
        shutil.copy2(source, web_dir / "investor-pack.pdf")

    evo = EVO_MAP.get(args.slug, args.slug)
    assets = ASSETS / evo / "documents" / "investor-packs"
    write_range(reader, assets / "pds.pdf", 0, sa)
    write_range(reader, assets / "syndicate-agreement.pdf", sa, n)
    write_range(reader, assets / "sa.pdf", sa, n)
    print("done")


if __name__ == "__main__":
    main()
