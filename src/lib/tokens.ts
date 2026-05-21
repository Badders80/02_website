/**
 * Evolution Stables — Design Tokens
 * 
 * Single source of truth for all design values.
 * These tokens are referenced by:
 * - tailwind.config.ts (via CSS variables)
 * - src/styles/globals.css (:root variables)
 * - components/admin/* (primitive components)
 * 
 * @version 2.0 — Updated 2026-05-20
 * @see dna/brand/BRAND_SYSTEM.md
 */

// ─────────────────────────────────────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
  // Core palette
  background: '#09090b',
  surface: '#0a0a0a',
  surfaceAlt: '#111111',
  foreground: '#f5f5f5',
  muted: '#a1a1aa',
  mutedForeground: '#737373',
  
  // Brand
  gold: '#d4a964',
  goldHover: '#c49a5a',
  
  // Status colors (admin)
  status: {
    draft: { bg: 'rgba(161,161,170,0.1)', text: '#a1a1aa' },
    reviewed: { bg: 'rgba(212,169,100,0.1)', text: '#d4a964' },
    publishReady: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e' },
    published: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6' },
  },
  
  // Role badges
  role: {
    admin: { bg: 'rgba(212,169,100,0.1)', text: '#d4a964' },
    investor: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6' },
    viewer: { bg: 'rgba(255,255,255,0.05)', text: '#a1a1aa' },
  },
  
  // KYC badges
  kyc: {
    verified: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e' },
    pending: { bg: 'rgba(234,179,8,0.1)', text: '#eab308' },
    requiresInput: { bg: 'rgba(251,146,60,0.1)', text: '#fb923c' },
    canceled: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
    none: { bg: 'rgba(255,255,255,0.05)', text: '#a1a1aa' },
  },
  
  // Semantic borders (opacity variants)
  border: {
    DEFAULT: 'rgba(255,255,255,0.06)',
    subtle: 'rgba(255,255,255,0.04)',
    strong: 'rgba(255,255,255,0.12)',
    gold: 'rgba(212,169,100,0.3)',
  },
  
  // Error/Warning/Success
  error: {
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.3)',
    text: '#ef4444',
  },
  warning: {
    bg: 'rgba(234,179,8,0.05)',
    border: 'rgba(234,179,8,0.2)',
    text: '#eab308',
  },
  success: {
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.3)',
    text: '#22c55e',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────────────────────────────────────

export const typography = {
  // Font families
  fontFamily: {
    sans: '"Geist Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: '"Geist Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  
  // Font sizes
  fontSize: {
    xs: '0.75rem',        // 12px
    sm: '0.875rem',       // 14px
    base: '1rem',         // 16px
    lg: '1.125rem',       // 18px
    xl: '1.25rem',        // 20px
    '2xl': '1.5rem',      // 24px
    '3xl': '2rem',        // 32px
    '4xl': '3rem',        // 48px
    micro: '0.6875rem',   // 11px (labels)
  },
  
  // Font weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.01em',
    wider: '0.2em',      // uppercase labels
    widest: '0.32em',    // decorative
  },
  
  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SPACING
// ─────────────────────────────────────────────────────────────────────────────

export const spacing = {
  // Base scale (4px grid)
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  
  // Page layout
  pagePadding: '32px',        // p-8
  sidebarWidth: '256px',      // w-64
  sidebarHeaderHeight: '64px',// h-16
  
  // Component spacing
  cardPadding: '24px',        // p-6
  formPadding: '24px',        // p-6
  emptyStatePadding: '48px',  // p-12
  buttonPaddingX: '24px',     // px-6
  buttonPaddingY: '8px',      // py-2
  inputPaddingX: '12px',      // px-3
  inputPaddingY: '8px',       // py-2
  tableCellPaddingX: '24px',  // px-6
  tableCellPaddingY: '16px',  // py-4
  
  // Gaps
  gapTight: '8px',
  gapSmall: '12px',
  gapBase: '16px',
  gapLarge: '24px',
  gapXl: '32px',
  
  // Stacking (space-y-*)
  spaceTight: '8px',          // space-y-2
  spaceSmall: '12px',         // space-y-3
  spaceBase: '16px',          // space-y-4
  spaceLarge: '24px',         // space-y-6
  spaceXl: '32px',            // space-y-8
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────────────────────────

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SHADOWS & EFFECTS
// ─────────────────────────────────────────────────────────────────────────────

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.3)',
  md: '0 4px 6px rgba(0,0,0,0.4)',
  lg: '0 10px 15px rgba(0,0,0,0.5)',
  gold: '0 0 20px rgba(212,169,100,0.15)',
} as const;

export const transitions = {
  colors: 'transition-colors',
  all: 'transition-all',
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT PATTERNS (Composed Tokens)
// ─────────────────────────────────────────────────────────────────────────────

export const patterns = {
  // Buttons
  button: {
    primary: `rounded-full bg-gold px-6 py-2 text-sm font-semibold text-black transition-colors hover:bg-gold-hover`,
    secondary: `rounded-lg border border-white/[0.06] bg-white/[0.04] px-4 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.08]`,
    ghost: `rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground`,
    danger: `rounded-lg p-1 text-muted transition-colors hover:bg-red-500/10 hover:text-red-400`,
  },
  
  // Inputs
  input: `rounded-lg border border-white/[0.06] bg-panel px-3 py-2 text-sm text-foreground placeholder-muted focus:border-gold focus:outline-none`,
  select: `rounded-lg border border-white/[0.06] bg-panel px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none`,
  
  // Cards
  card: `rounded-xl border border-white/[0.06] bg-panel p-6`,
  cardLarge: `rounded-2xl border border-white/[0.06] bg-panel p-12`,
  
  // Badges
  badge: `inline-flex rounded-full px-2 py-0.5 text-xs text-muted`,
  badgeSmall: `inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider`,
  
  // Tables
  tableHeader: `px-6 py-3 text-left text-xs font-medium uppercase text-muted`,
  tableCell: `px-6 py-4`,
  tableRow: `transition-colors hover:bg-white/[0.02]`,
  
  // Alerts
  alertError: `rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400`,
  alertWarning: `rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4`,
  
  // Empty States
  emptyState: `mt-12 rounded-2xl border border-white/[0.06] bg-panel p-12 text-center`,
  
  // Loading States
  loading: `flex items-center justify-center py-24 text-muted`,
  
  // Navigation
  navLink: `flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground`,
  navSection: `mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted`,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT ALL
// ─────────────────────────────────────────────────────────────────────────────

export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  patterns,
} as const;

export default tokens;
