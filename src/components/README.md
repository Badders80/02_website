# Components

**Purpose:** React components — shared UI primitives and page sections.

---

## Structure

```
components/
├── NavBar.tsx         ← Site navigation
├── Footer.tsx         ← Site footer
├── sections/          ← Homepage sections (Hero, Stakeholders, CTA)
└── ui/                ← Shared UI primitives (Button, Card, etc.)
```

## Conventions

- **PascalCase** for component filenames (`NavBar.tsx`, `HorseCard.tsx`)
- **`"use client"`** directive for interactive components
- **Tailwind classes** for styling — no separate CSS files
- **Brand tokens** from `dna/` for colors and typography