# DNA — Design System

**Purpose:** Shared design system, content, and conventions for the Evolution Stables website.

**DNA** = Design, Naming, Architecture — the foundational patterns that keep the codebase consistent.

---

## Structure

```
dna/
├── brand/              ← Brand guidelines
│   ├── BRAND_SYSTEM.md ← Colors, typography, spacing
│   └── VOICE_SYSTEM.md ← Tone, terminology, writing rules
├── content/            ← JSON content files
│   ├── homepage.json  ← Homepage text + structure
│   └── press.json     ← Press releases
├── conventions/        ← Development conventions
│   └── CONVENTIONS.md ← Naming, API patterns, security
```

## Key Principle

DNA schemas in `01_evolution/dna/schemas/` are the contract for data. This repo's `dna/content/` holds **website copy** (JSON), not data schemas.