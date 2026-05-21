# Public Assets

**Purpose:** Static files served directly by Next.js — images, fonts, favicons.

---

## Structure

```
public/
├── images/            ← Optimized images (WebP preferred)
└── fonts/             ← Custom web fonts
```

## Image Guidelines

- **Format:** WebP for photos, SVG for icons/logos
- **Naming:** `kebab-case` (`hero-bg.webp`, `logo-gold.svg`)
- **Optimization:** Run through `next/image` component, not raw `<img>`
- **Organization:** By purpose (`partners/`, `icons/`, `horses/`)

## Font Guidelines

- **Self-hosted** — No Google Fonts CDN (performance + privacy)
- **Variable fonts** preferred when available
- **WOFF2** format for web delivery