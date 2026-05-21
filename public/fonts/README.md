# Fonts

**Purpose:** Self-hosted web fonts for Evolution Stables.

---

## Brand Fonts

| Font | Usage | Format |
|------|-------|--------|
| **Playfair Display** | Headings, display text | Variable WOFF2 |
| **Inter** | Body text, UI | Variable WOFF2 |

## Why Self-Host?

- **Performance** — No external CDN requests
- **Privacy** — No Google Fonts tracking
- **Reliability** — Works offline, no CDN outages

## Adding Fonts

1. Download WOFF2 from [Google Fonts](https://fonts.google.com)
2. Place in this folder
3. Add `@font-face` in `src/styles/globals.css`
4. Reference in `tailwind.config.ts` `fontFamily`