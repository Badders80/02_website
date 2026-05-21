# Source

**Purpose:** Next.js application source — pages, components, utilities, and styles.

**Architecture:** Next.js 16 with App Router, TypeScript, Tailwind CSS.

---

## Structure

```
src/
├── app/               ← Next.js App Router pages
│   ├── page.tsx       ← Homepage
│   ├── press/         ← Press releases
│   ├── privacy/       ← Privacy policy
│   └── terms/         ← Terms of service
├── components/        ← React components
│   ├── NavBar.tsx     ← Navigation
│   ├── Footer.tsx     ← Site footer
│   ├── sections/     ← Homepage sections
│   └── ui/           ← Shared UI primitives
├── dna/              ← Design tokens (Tailwind theme)
├── lib/              ← Utilities (API client, auth helpers)
└── styles/           ← Global CSS
```

## Key Principle

All data access goes through `lib/api.ts` → backend Cloud Functions. The app never writes to Firestore directly.