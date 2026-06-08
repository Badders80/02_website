import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Core palette — CSS variables (see globals.css)
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        panel: "var(--color-surface)",
        "surface-alt": "var(--color-surface-alt)",
        foreground: "var(--color-foreground)",
        heading: "var(--color-heading)",
        muted: "var(--color-muted)",
        "muted-foreground": "var(--color-muted-foreground)",
        border: "var(--color-border)",
        
        // Brand
        gold: "var(--brand-gold)",
        "gold-hover": "var(--brand-gold-hover)",
        
        // Status colors (admin)
        "status-draft": "rgba(161,161,170,0.1)",
        "status-reviewed": "rgba(212,169,100,0.1)",
        "status-publish-ready": "rgba(34,197,94,0.1)",
        "status-published": "rgba(59,130,246,0.1)",
        
        // Role badges
        "role-admin": "rgba(212,169,100,0.1)",
        "role-investor": "rgba(59,130,246,0.1)",
        "role-viewer": "rgba(255,255,255,0.05)",
        
        // KYC badges
        "kyc-verified": "rgba(34,197,94,0.1)",
        "kyc-pending": "rgba(234,179,8,0.1)",
        "kyc-requires-input": "rgba(251,146,60,0.1)",
        "kyc-canceled": "rgba(239,68,68,0.1)",
        "kyc-none": "rgba(255,255,255,0.05)",
        
        // Error/Warning/Success
        "error-bg": "rgba(239,68,68,0.1)",
        "error-border": "rgba(239,68,68,0.3)",
        "error-text": "#ef4444",
        "warning-bg": "rgba(234,179,8,0.05)",
        "warning-border": "rgba(234,179,8,0.2)",
        "warning-text": "#eab308",
        "success-bg": "rgba(34,197,94,0.1)",
        "success-border": "rgba(34,197,94,0.3)",
        "success-text": "#22c55e",
        
        // Ring color (for focus states)
        ring: "var(--brand-gold)",
        "outline-ring": "var(--brand-gold)",
      },
      fontFamily: {
        sans: ['"Geist Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Geist Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        "11": "11px",
        micro: "0.6875rem",  // 11px for labels
      },
      letterSpacing: {
        "tight": "-0.02em",
        "wide": "0.01em",
        "widest-2": "0.2em",
        "widest-3": "0.32em",
      },
      lineHeight: {
        "none": "1",
        "tight": "1.25",
        "normal": "1.5",
        "relaxed": "1.75",
      },
      borderRadius: {
        "sm": "8px",
        "md": "12px",
        "lg": "16px",
        "xl": "24px",
        "2xl": "32px",
        "3xl": "32px",
      },
      transitionDuration: {
        DEFAULT: "500ms",
      },
      transitionTimingFunction: {
        DEFAULT: "ease-out",
      },
      spacing: {
        // Component spacing
        "card": "24px",
        "empty": "48px",
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "bolt-shimmer": "boltShimmer 4s ease-in-out infinite",
        "fade-in": "fadeIn 0.8s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        boltShimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "20%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
