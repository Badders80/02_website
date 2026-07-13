# Inventory freeze — ops note (updated 2026-07-13)

**Spreadsheet:** `1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg`  
**Tab:** `Inventory` (runtime ops tab — not Horses / HLTs sync tabs)

**Status:** Apply manually in Google Sheets UI (no service-account write from this machine).

**Slug fix:** `tlm-x-yearn` → **`tml-x-yearn`** (Turn Me Loose = **TML**, not TLM).  
If the sheet still has slug `tlm-x-yearn`, rename the cell to `tml-x-yearn` (and display name **TML x Yearn**).

---

## Target freeze (founder truth)

### Not listed yet — Coming Soon (0/20, 5% syndicate)

| slug | listing_status | shares_total | shares_sold | leasehold_stake_pct | notes |
|------|----------------|--------------|-------------|---------------------|-------|
| **i-stole-a-manolo** | `draft` | **20** | **0** | **5** | not listed |
| **nellie** | `draft` | **20** | **0** | **5** | not listed |
| **tml-x-yearn** | `draft` | **20** | **0** | **5** | was `tlm-x-yearn` / TLM — fix spelling |

### Fully subscribed / term done (still freeze sheet fiction)

| slug | listing_status | shares_total | shares_sold | leasehold_stake_pct | notes |
|------|----------------|--------------|-------------|---------------------|-------|
| **prudentia** | `draft` | **20** | **20** | **5** | sold out 20/20 of 5% |
| **hottathanafantasy** | `draft` | **20** | **20** | **5** | sold out 20/20 of 5% |
| **first-gear** | `retired` | **20** | **20** | **10** | sold out 20/20 of 10%, term completed |

Use actual header names on the tab (`listing_status`, `shares_total`, `shares_sold`, `leasehold_stake_pct` / equivalent).

**Do not** set any row to `listing_status = active` until intentional open-SKU.

---

## Local website data (already aligned)

`src/data/hlts.json` — manolo / nellie / tml-x-yearn: draft, 0/20, 5% stake.  
Slug rename + image path + redirect `/marketplace/tlm-x-yearn` → `/marketplace/tml-x-yearn`.

Code still returns `purchasable: false` while `PURCHASES_ENABLED` unset — freeze is ops hygiene + commercial truth.

---

## Verify after manual freeze

```bash
curl -sS "https://www.evolutionstables.nz/api/inventory/i-stole-a-manolo" | python3 -m json.tool
curl -sS "https://www.evolutionstables.nz/api/inventory/nellie" | python3 -m json.tool
curl -sS "https://www.evolutionstables.nz/api/inventory/tml-x-yearn" | python3 -m json.tool
```

Expect: `purchasable: false`, `listing_status: draft`, `shares_total: 20`, `shares_sold: 0` (for the three pipeline horses).
