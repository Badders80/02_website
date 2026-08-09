# CTA lead modal & campaign links

How the homepage email popup works, and how to create tracked links (LinkedIn, X, email, etc.).

**Code:** `src/components/CtaLeadModal.tsx` · `src/app/api/subscribe/route.ts` · home `src/app/page.tsx`  
**Live base:** `https://www.evolutionstables.nz`

---

## Behaviour

| Visit type | URL example | When CTA opens |
|------------|-------------|----------------|
| **Organic** | `/` | ~4.5s after load (hero lands first) |
| **Campaign click** | `/?source=linkedin` | **Immediately** (in first paint) |

Dismiss only via **×** (or Escape) or **email submit**. Backdrop click does **not** close. Page **scrolls behind** the fixed card.

Persistence:

- Submit → `localStorage.es_cta_submitted` (won’t show again on that browser)
- Dismiss × → `sessionStorage.es_cta_dismissed` (won’t show again this tab session)

---

## Creating a tracked link

### Pattern

```
https://www.evolutionstables.nz/?source=<key>
```

`<key>` is lowercased, alphanumeric + `_` / `-` only (sanitized server-side). Use a short slug per post or channel.

### Query params (any one is enough)

| Param | Use |
|-------|-----|
| `source` | Preferred for channel (e.g. `linkedin`) |
| `utm_source` | Same idea (UTM-style) |
| `campaign` / `campaign_key` / `utm_campaign` | Optional finer key |

If both exist, **campaign** fields win for `campaignKey`; **source** / `utm_source` set `source`.  
If only `source=linkedin`, both sheet columns become `linkedin`.

### Examples

| Channel / post | Link |
|----------------|------|
| LinkedIn (current) | `https://www.evolutionstables.nz/?source=linkedin` |
| Another LinkedIn post | `https://www.evolutionstables.nz/?source=linkedin&campaign=linkedin_nellie_mulan` |
| X / Twitter | `https://www.evolutionstables.nz/?source=x` |
| Email newsletter | `https://www.evolutionstables.nz/?source=email&campaign=owner_update_aug` |
| Instagram bio | `https://www.evolutionstables.nz/?source=instagram` |

Attribution is stored in `sessionStorage` on landing, so the user can scroll before submitting and the tag still applies.

---

## What hits the spreadsheet

`POST /api/subscribe` with:

```json
{ "email": "…", "campaign_key": "linkedin", "source": "linkedin" }
```

### Primary sheet (intended)

**Interest Signups** → tab **Sheet1**  
https://docs.google.com/spreadsheets/d/1r1tLSTKIrcjxfn6NPGIfnmmj9GGebKXat8EZXMTHEyk/edit

| Column | Homepage CTA value |
|--------|--------------------|
| created_at | timestamp |
| last_sign_in | timestamp |
| email | address |
| name / image / providerAccountId | empty |
| provider | `email` |
| campaignKey | e.g. `linkedin` or `about_join_evolution` (organic) |
| source | e.g. `linkedin` or `about` (organic) |

### Fallback

If the service account **cannot write** the primary sheet, rows go to legacy inventory **Waitlist**:  
`1WENj4ZCcjRIyHiVdP2lP7YkpFGc9i_Yy5tYFzysCXhg` (Email, Timestamp, Horse slug).

API response includes `sheetTarget` so you can see which path ran:

- `leads:1r1tLSTK…/Sheet1` — primary OK  
- `legacy_waitlist:1WENj4Z…` — fallback  

### Unlock primary writes

Share **Editor** on Interest Signups with:

```
evolution-web-admin@evolution-engine.iam.gserviceaccount.com
```

Env override (optional): `LEADS_SPREADSHEET_ID`, `LEADS_SHEET_TAB` (default `Sheet1`).

---

## Organic default keys

No query string:

- `campaignKey` = `about_join_evolution`
- `source` = `about`

Marketplace horse waitlist (if used): `marketplace_<slug>` / `marketplace`.

---

## Checklist for a new post

1. Pick a key: e.g. `linkedin`, `linkedin_q3`, `x_thread_1`.
2. Build URL: `https://www.evolutionstables.nz/?source=<key>`.
3. Paste that URL in the post (not the bare homepage).
4. After go-live, submit a test email in Incognito and confirm `campaignKey` / `source` on the sheet.
5. Optional: filter the sheet by `source = linkedin` for that campaign’s leads.

---

## Related files

| File | Role |
|------|------|
| `src/components/CtaLeadModal.tsx` | UI, delay vs instant, URL → session attribution |
| `src/app/page.tsx` | Reads `searchParams` → `forceInstant` for first paint |
| `src/app/api/subscribe/route.ts` | Sheet append + campaign_key / source |
| `src/lib/notify-alex.ts` | Horse waitlist email only (not plain homepage CTA) |
