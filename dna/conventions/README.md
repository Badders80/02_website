# Conventions

**Purpose:** Development conventions for the Evolution Stables website.

---

## File

| File | Content |
|------|---------|
| `CONVENTIONS.md` | Naming, API patterns, security rules |

## Key Conventions

- **Components:** `PascalCase.tsx`
- **Pages:** `kebab-case/` folders with `page.tsx`
- **CSS:** Tailwind utility classes, no separate CSS files
- **API calls:** All through `src/lib/api.ts`, never direct Firestore
- **Images:** `next/image` component, WebP format, `kebab-case` naming
- **Fonts:** Self-hosted WOFF2, no CDN

## Alignment with Backend

Conventions are aligned with `01_evolution/dna/conventions/`. When backend conventions change, update here too.