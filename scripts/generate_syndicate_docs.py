#!/usr/bin/env python3
"""
Generate PDS + Syndicate Agreement field packs and markdown drafts
from website static data (horses.json + hlts.json).

Usage:
  python3 scripts/generate_syndicate_docs.py tml-x-yearn
  python3 scripts/generate_syndicate_docs.py nellie
  python3 scripts/generate_syndicate_docs.py --pack-only i-stole-a-manolo

Outputs under public/documents/{slug}/_generated/
Does NOT set has_terms_sheet or write final PDFs.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "src" / "data"
DOCS = ROOT / "public" / "documents"
# Monorepo: 01_evolution horse authoring (optional enrichment)
EVO_HORSES = ROOT.parent / "01_evolution" / "horses"

# Website marketplace slug → 01_evolution folder slug
EVO_SLUG_MAP = {
    "tml-x-yearn": "turn-me-loose-x-yearn",
    "nellie": "almanzor-x-night-danza",
    "i-stole-a-manolo": "i-stole-a-manolo",
    "hottathanafantasy": "hottathanafantasy",
    "first-gear": "first-gear",
    "prudentia": "prudentia",
}

ISSUER = {
    "promoter": "Evolution Stables Ltd",
    "nzbn": "9429050177875",
    "manager": "Evolution Stables",
    "contact_email": "alex@evolutionstables.nz",
    "contact_phone": "+64 21 0828 0901",
    "site": "https://www.evolutionstables.nz",
    "digital_partner": "Tokinvest (VARA, Dubai)",
    "regulatory": "NZTR Bloodstock Syndication Code of Practice",
}


def load_json(name: str):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def load_evolution_enrichment(web_slug: str) -> dict:
    """Pull legal name + long profile narrative from 01_evolution when present."""
    evo_slug = EVO_SLUG_MAP.get(web_slug, web_slug)
    folder = EVO_HORSES / evo_slug
    out: dict = {"evo_slug": evo_slug, "legal_name": "", "about": "", "pedigree_notes": ""}
    if not folder.is_dir():
        return out

    ped_path = folder / "pedigree.json"
    if ped_path.exists():
        try:
            ped = json.loads(ped_path.read_text(encoding="utf-8"))
            out["legal_name"] = (ped.get("horse_name") or "").strip()
            if ped.get("sire", {}).get("name") and ped.get("dam", {}).get("name"):
                out["pedigree_notes"] = (
                    f"Sire: {ped['sire']['name']}. Dam: {ped['dam']['name']}."
                )
        except Exception:
            pass

    profile = folder / "profile.md"
    if profile.exists():
        text = profile.read_text(encoding="utf-8")
        # Drop YAML front matter
        if text.startswith("---"):
            parts = text.split("---", 2)
            body = parts[2] if len(parts) >= 3 else text
        else:
            body = text
        # Prefer ## Profile section, else full body without first H1
        about = ""
        if "## Profile" in body:
            chunk = body.split("## Profile", 1)[1]
            # until next ## or end
            about = chunk.split("\n## ", 1)[0].strip()
        if not about:
            lines = [ln for ln in body.splitlines() if not ln.startswith("# ")]
            about = "\n".join(lines).strip()[:2500]
        out["about"] = about
    return out


def pedigree_legal_name(horse: dict, hlt: dict) -> str:
    sire = (horse.get("sire_name") or "").strip()
    dam = (horse.get("dam_name") or "").strip()
    if sire and dam:
        # strip dam parenthetical for cleaner legal line e.g. "Night Danza (by Danzero)" → keep as-is if short
        return f"{sire} x {dam}"
    return (hlt.get("horse_name") or horse.get("name") or "").strip()


def add_months(start: str, months: int) -> str:
    """Approximate end date = start + months - 1 day calendar-ish (first of month style)."""
    if not start or start.upper() == "TBD":
        return ""
    y, m, d = [int(x) for x in start.split("-")]
    m0 = m - 1 + months
    y += m0 // 12
    m = m0 % 12 + 1
    # last day of prior month as end-of-term label (simple)
    if m == 1:
        ey, em = y - 1, 12
    else:
        ey, em = y, m - 1
    # use day 28-safe
    return f"{ey:04d}-{em:02d}-{min(d, 28):02d}"


def build_pack(slug: str) -> dict:
    horses = {h["slug"]: h for h in load_json("horses.json")}
    hlts = {h["horse_slug"]: h for h in load_json("hlts.json")}
    if slug not in hlts:
        raise SystemExit(f"Unknown horse_slug in hlts.json: {slug}")
    hlt = hlts[slug]
    horse = horses.get(slug, {})
    evo = load_evolution_enrichment(slug)

    stake = float(hlt.get("leasehold_stake_pct") or 0)
    shares = int(hlt.get("shares_total") or 0)
    lot_pct = (stake / shares) if shares else 0
    months = int(hlt.get("lease_period_months") or 0)
    start = hlt.get("lease_start_date") or ""
    end = add_months(start, months) if start and months else ""

    display = (
        horse.get("display_name") or hlt.get("horse_name") or horse.get("name") or slug
    )
    legal = (
        evo.get("legal_name")
        or pedigree_legal_name(horse, hlt)
        or display
    )
    # Nickname vs legal (e.g. Nellie vs Almanzor x Night Danza)
    if display and legal and display.lower() not in legal.lower() and legal.lower() not in display.lower():
        # keep both
        pass

    short_story = hlt.get("story") or horse.get("story") or ""
    about = evo.get("about") or short_story
    next_up = hlt.get("next_up") or horse.get("next_up") or ""
    if next_up.lower() in ("", "pre-training"):
        race_expectation = (
            "Early education / pre-training. Syndicate members receive updates via "
            "Evolution channels as the horse progresses toward trials and racing."
        )
    else:
        race_expectation = next_up

    gaps = []
    if not horse.get("microchip"):
        gaps.append("microchip / NZTR identity pending")
    if not start or str(start).upper() == "TBD":
        gaps.append("lease_start_date")
    if not hlt.get("price_per_share_nzd"):
        gaps.append("price_per_share_nzd")
    if horse.get("identity_status") == "unregistered":
        gaps.append("identity_status unregistered — use nickname + sire x dam honestly")
    if not about or len(about) < 80:
        gaps.append("thin narrative — expand about_horse before legal PDF")
    if hlt.get("has_terms_sheet") is not True:
        gaps.append("has_terms_sheet false until final PDF published")

    pack = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "document_date": date.today().isoformat(),
        "is_placeholder": True,
        "gaps": gaps,
        "sources": {
            "website_slug": slug,
            "evolution_slug": evo.get("evo_slug"),
            "evolution_profile_used": bool(evo.get("about")),
        },
        "issuer": ISSUER,
        "identity": {
            "slug": slug,
            "legal_horse_name": legal,
            "display_name": display,
            "sex": horse.get("sex"),
            "colour": horse.get("colour"),
            "foaling_date": horse.get("foaling_date"),
            "sire_name": horse.get("sire_name"),
            "dam_name": horse.get("dam_name"),
            "microchip": horse.get("microchip") or hlt.get("horse_microchip") or "",
            "life_number": horse.get("life_number") or "",
            "loveracing_id": horse.get("loveracing_id") or "",
            "breeder": horse.get("breeder") or "",
            "identity_status": horse.get("identity_status") or "unknown",
            "breeding_url": horse.get("breeding_url") or "",
            "performance_profile_url": horse.get("performance_profile_url") or "",
            "trainer_name": hlt.get("trainer_name") or horse.get("trainer_name") or "",
            "trainer_stable": hlt.get("trainer_stable") or horse.get("trainer_stable") or "",
            "trainer_location": hlt.get("trainer_location") or horse.get("trainer_location") or "",
            "story": short_story,
            "pedigree": hlt.get("pedigree") or evo.get("pedigree_notes") or "",
            "next_up": next_up,
        },
        "commercial": {
            "owner_name": hlt.get("owner_name") or "",
            "leasehold_stake_pct": stake,
            "shares_total": shares,
            "shares_sold": int(hlt.get("shares_sold") or 0),
            "lot_pct": lot_pct,
            "lease_period_months": months,
            "lease_start_date": start,
            "lease_end_date": end,
            "owner_rate_per_1pct_month": hlt.get("owner_rate_per_1pct_month"),
            "platform_fee_pct": hlt.get("platform_fee_pct"),
            "price_per_share_nzd": hlt.get("price_per_share_nzd"),
            "investor_return_pct": hlt.get("investor_return_pct"),
            "campaign_status": hlt.get("campaign_status"),
            "listing_status": hlt.get("listing_status"),
            "has_terms_sheet": hlt.get("has_terms_sheet"),
        },
        "narrative": {
            "about_horse": about,
            "race_schedule_expectation": race_expectation,
            "risks_extra": "",
        },
    }
    return pack


def render_pds(pack: dict) -> str:
    idn = pack["identity"]
    com = pack["commercial"]
    iss = pack["issuer"]
    name = idn["display_name"]
    legal = idn["legal_horse_name"]
    stake = com["leasehold_stake_pct"]
    shares = com["shares_total"]
    lot = com["lot_pct"]
    price = com["price_per_share_nzd"]
    ret = com["investor_return_pct"]
    start = com["lease_start_date"]
    end = com["lease_end_date"]
    months = com["lease_period_months"]
    gaps = pack["gaps"]

    gap_block = ""
    if gaps:
        gap_block = "\n".join(f"- {g}" for g in gaps)
        gap_block = f"\n> **Draft gaps (not final legal):**\n{gap_block}\n"

    nickname_line = ""
    if name and legal and name.strip().lower() != legal.strip().lower():
        nickname_line = f"\n**Public name / nickname:** {name}  \n**Pedigree / legal description:** {legal}\n"

    return f"""# Product Disclosure Statement

**{name} Syndicate**  
{stake:g}% Leasehold Stake in {legal} (NZ)  
Evolution Stables – NZTR Authorised Syndicator  

**Date:** {pack["document_date"]}  
**Status:** DRAFT — `{"PLACEHOLDER" if pack["is_placeholder"] else "REVIEW"}`  
{iss["contact_email"]} | {iss["contact_phone"]} | {iss["site"]}
{nickname_line}{gap_block}

---

## A New Way to Own

Evolution Stables is a New Zealand–based, NZTR-authorised syndicator offering fractional, fixed-term digital leasehold interests in thoroughbreds. We partner with owners and trainers to make ownership simpler and more accessible.

Digital issuance and compliance infrastructure is provided in partnership with {iss["digital_partner"]}.

**{iss["promoter"]}** (NZBN: {iss["nzbn"]})  
Alex Baddeley, Founder

---

## Key Information Summary

### What is this?
This Product Disclosure Statement outlines a {months}-month leasehold interest in **{legal}** (marketed as **{name}**). Evolution Stables has secured a **{stake:g}%** leasehold stake and is making fractional participation available through its digital-syndication model.

### Who is this for?
Individuals seeking exposure to racehorse ownership in a simplified digital format — no prior experience required.

### How does it work?
You lease a share of our {stake:g}% stake in {name}. Your one-time fee covers costs for the term as disclosed. You receive **{ret}%** of revenue generated from racing and related commercial activity attributable to the syndicate stake, proportional to your share (subject to the Syndicate Agreement).

### Structure
The {stake:g}% leasehold interest is:
- Split into **{shares}** digital lots (each representing **{lot:g}%** of the horse)
- Fixed for the term **{start}** to **{end or "(end TBD)"}** ({months} months)
- Managed by Evolution Stables
- Digitally administered via Tokinvest where applicable

### Fees / price (provisional until legal sign-off)
- **{price} NZD** per lot (see also owner rate / platform fee in field pack)
- Platform fee on list rate: **{com.get("platform_fee_pct")}%**
- Owner rate: **{com.get("owner_rate_per_1pct_month")}** NZD / month / 1%

### Returns
Returns are variable. There are no guarantees. You may not recover your original investment.

### Risks
The horse may underperform, suffer injury, or be retired early. Liquidity is limited. You could lose the full amount of your investment.

### How to invest
Applications via Evolution Stables / the marketplace. Identity verification may be required under AML/CFT laws. Purchases only when the campaign is `listed` and the site kill-switch allows charging.

### Manager
{iss["promoter"]} (NZBN: {iss["nzbn"]}) — authorised NZTR syndicator.

---

## The horse

| | |
|--|--|
| Display name | {name} |
| Legal / pedigree name | {legal} |
| Sex / colour | {idn.get("sex") or "—"} / {idn.get("colour") or "—"} |
| Foaled | {idn.get("foaling_date") or "—"} |
| Sire / Dam | {idn.get("sire_name") or "—"} × {idn.get("dam_name") or "—"} |
| Microchip | {idn.get("microchip") or "Pending registration"} |
| Life number | {idn.get("life_number") or "—"} |
| loveracing.nz | {idn.get("loveracing_id") or "—"} |
| Breeder | {idn.get("breeder") or "—"} |
| Trainer | {idn.get("trainer_name")} — {idn.get("trainer_location")} |
| Lessor / owner | {com.get("owner_name")} |

### Narrative
{pack["narrative"]["about_horse"] or "_Add horse narrative._"}

### Programme / expectation
{pack["narrative"]["race_schedule_expectation"]}

---

## Important

This document was **auto-generated** from website static data for drafting. It is **not** a final PDS until legal/founder review and PDF publication under `public/documents/{idn["slug"]}/`.

Generated: {pack["generated_at"]}
"""


def render_sa(pack: dict) -> str:
    idn = pack["identity"]
    com = pack["commercial"]
    iss = pack["issuer"]
    name = idn["display_name"]
    legal = idn["legal_horse_name"]
    stake = com["leasehold_stake_pct"]
    shares = com["shares_total"]
    lot = com["lot_pct"]
    ret = com["investor_return_pct"]
    start = com["lease_start_date"]
    end = com["lease_end_date"]
    months = com["lease_period_months"]

    return f"""# Syndicate Agreement

**Evolution Stables – {legal} (NZ)**  
NZTR Authorised Syndicator  
**Date:** {pack["document_date"]}  
**Status:** DRAFT — PLACEHOLDER until legal sign-off

## 1. Formation
A Syndicate is formed under the New Zealand Thoroughbred Racing Inc. ("NZTR") Bloodstock Syndication Code of Practice ("COP"), in accordance with Clause 3.1, by the Promoter as set out in the attached Product Disclosure Statement ("the Syndicate").

## 2. Object
The object of the Syndicate is to lease and race **{legal}** as a recreational pursuit, with all syndicate members holding digital leasehold shares for a fixed **{months}-month** term, as described in the Product Disclosure Statement.

## 3. Agreement and Parties
This Agreement is binding on the Promoter ({iss["promoter"]}), the Syndicate Manager ({iss["manager"]}), and each Shareholder as defined in the Product Disclosure Statement. By applying (including digitally), each Shareholder agrees to be bound by this Agreement and the PDS. This Agreement may only be altered by special resolution (75% of shareholding) and must not increase a Shareholder’s liability beyond what is disclosed in the PDS.

## 4. Syndicate Shares
The Syndicate is divided into **{shares}** digital shares of **{lot:g}%** each, representing a **{stake:g}%** leasehold interest in {legal} for the Lease Term. Each Shareholder’s rights and obligations are proportional to their shareholding.

## 5. Lease Duration
The lease term is fixed at **{months} months**, commencing **{start}** and ending **{end or "TBD"}**. Renewal or extension is at the Manager’s and Lessor’s discretion, with terms disclosed prior to renewal.

## 6. Manager’s Powers and Duties
The Manager is responsible for lease administration and NZTR compliance, including communication with shareholders and coordination with licensed professionals. The Manager may make day-to-day racing and welfare decisions, appoint trainers in consultation with the lessor/racing manager, deduct disclosed fees, and provide updates when the horse is in work.

## 7. Financial Contributions and Fees
All costs are covered by the one-time upfront lease fee detailed in the PDS, unless the lease is renewed. No invented fee schedules beyond the field pack / PDS numbers.

## 8. Revenue Streams and Distribution
Token holders are entitled to a share of revenue generated by {name} during the lease period attributable to the syndicate stake, proportional to their leased stake. Default disclosed split: **{ret}%** to syndicate participants, remainder to lessor/structure as in the PDS.

Potential streams include race winnings, sponsorship, media, merchandising, and other verifiable income attributable to the horse during the lease (subject to PDS).

## 9. Draft notice
This SA was auto-generated from website static data. It is **not** executed legal text until reviewed and published as `sa.pdf` / `syndicate-agreement.pdf`.

Generated: {pack["generated_at"]}  
Slug: `{idn["slug"]}`
"""


def main():
    ap = argparse.ArgumentParser(description="Generate PDS/SA drafts from static data")
    ap.add_argument("slug", help="horse_slug e.g. tml-x-yearn, nellie")
    ap.add_argument("--pack-only", action="store_true", help="Write field-pack.json only")
    args = ap.parse_args()

    pack = build_pack(args.slug)
    out_dir = DOCS / args.slug / "_generated"
    out_dir.mkdir(parents=True, exist_ok=True)

    pack_path = out_dir / "field-pack.json"
    pack_path.write_text(json.dumps(pack, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {pack_path.relative_to(ROOT)}")
    if pack["gaps"]:
        print("Gaps:", "; ".join(pack["gaps"]))

    if args.pack_only:
        return

    pds_path = out_dir / "pds.md"
    sa_path = out_dir / "sa.md"
    pds_path.write_text(render_pds(pack), encoding="utf-8")
    sa_path.write_text(render_sa(pack), encoding="utf-8")
    print(f"Wrote {pds_path.relative_to(ROOT)}")
    print(f"Wrote {sa_path.relative_to(ROOT)}")
    print("Next: human review → PDF → public/documents/{slug}/pds.pdf + sa.pdf")


if __name__ == "__main__":
    main()
