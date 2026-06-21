# Images

**Purpose:** Optimized image assets for the public website.

---

## Organization

```
images/
├── partners/          ← Partner/sponsor logos
├── icons/             ← UI icons, favicons
└── horses/            ← Horse photos (future — from Assets API)
```

## Rules

1. **WebP** for raster images (photos, backgrounds)
2. **SVG** for vector images (logos, icons)
3. **`kebab-case`** naming (`hero-bg.webp`, `logo-gold.svg`)
4. **Always via `next/image`** — never raw `<img>` tags
5. **No images over 500KB** — compress before committing