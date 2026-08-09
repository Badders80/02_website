# PDS / SA review checklist — TML + Nellie

**Status:** Drafts only (`is_placeholder: true`). Not final legal.  
**Soft-list does not require finished PDFs.** Hard list / money does.

## Generated files

| Horse | Field pack | PDS | SA |
|-------|------------|-----|-----|
| TML x Yearn | `tml-x-yearn/_generated/field-pack.json` | `…/pds.md` | `…/sa.md` |
| Nellie | `nellie/_generated/field-pack.json` | `…/pds.md` | `…/sa.md` |

Regenerate after data changes:

```bash
cd 02_website
python3 scripts/generate_syndicate_docs.py tml-x-yearn
python3 scripts/generate_syndicate_docs.py nellie
```

## Confirm commercial (both)

- [ ] Lease start **2026-09-01**, term **36** months  
- [ ] Stake **5%** / **20** lots / **0.25%** per lot  
- [ ] Owner rate **$70**/1%/mo · fee **5%** · list lot **$661.50** (or update static + regenerate)  
- [ ] Investor return **75%**  
- [ ] Lessor **B.A.X Bloodstock**  

## Confirm identity

### TML (`tml-x-yearn`)
- [ ] Legal name line OK (sire × dam / evolution name)  
- [ ] Microchip `985125000128426` · Life `NZ00460867` · LR `460867`  
- [ ] Trainer Stephen Gray / Copper Belt / PN  
- [ ] Narrative from evolution profile OK for draft  

### Nellie (`nellie`)
- [ ] Public nickname **Nellie** + legal **Almanzor × Night Danza**  
- [ ] Unregistered / microchip pending — honest in docs  
- [ ] Trainer Logan Racing · Cambridge  
- [ ] Narrative OK or expand  

## Before PDF / `has_terms_sheet: true`

- [ ] Founder / counsel review of PDS + SA  
- [ ] Export PDF → `public/documents/{slug}/pds.pdf` + `sa.pdf`  
- [ ] Set `has_terms_sheet: true` on Sheet + static  
- [ ] Never treat `_generated/*.md` alone as executed legal  

## Parked (site down)

- Live inventory smoke  
- Soft flip `coming_soon`  
