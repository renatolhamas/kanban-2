import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         SPACING UTILITIES (Story 2.7 tokens)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
      spacing: {
        0: "var(--spacing-0)",
        1: "var(--spacing-1)",
        2: "var(--spacing-2)",
        3: "var(--spacing-3)",
        4: "var(--spacing-4)",
        5: "var(--spacing-5)",
        6: "var(--spacing-6)",
        8: "var(--spacing-8)",
        12: "var(--spacing-12)",
        16: "var(--spacing-16)",
        24: "var(--spacing-24)",
        32: "var(--spacing-32)",
        48: "var(--spacing-48)",
        64: "var(--spacing-64)",
      },

      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         FONT SIZE UTILITIES (Story 2.7 tokens)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)",
      },

      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         LINE HEIGHT UTILITIES (Story 2.7 tokens)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
      lineHeight: {
        tight: "var(--line-height-tight)",
        normal: "var(--line-height-normal)",
        relaxed: "var(--line-height-relaxed)",
      },

      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         COLOR UTILITIES (Story 2.7 + Ledger)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
      colors: {
        /* Existing HSL colors */
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        "primary-container": "hsl(var(--primary-container))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        surface: "hsl(var(--surface))",
        "surface-low": "hsl(var(--surface-low))",
        "surface-lowest": "hsl(var(--surface-lowest))",
        "surface-high": "hsl(var(--surface-high))",
        "on-surface": "hsl(var(--on-surface))",

        /* Story 2.7 token colors (hex format) */
        "token-primary": "var(--color-primary)",
        "token-secondary": "var(--color-secondary)",
        "token-danger": "var(--color-danger)",
        "token-success": "var(--color-success)",
        "token-warning": "var(--color-warning)",
      },

      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         SHADOW UTILITIES (Story 2.7 tokens)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
      boxShadow: {
        ambient: "0px 12px 32px rgba(10, 25, 47, 0.06)",
        "token-sm": "var(--shadow-sm)",
        "token-base": "var(--shadow-base)",
        "token-md": "var(--shadow-md)",
        "token-lg": "var(--shadow-lg)",
        "token-xl": "var(--shadow-xl)",
      },

      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         ANIMATION UTILITIES (Story 2.7 tokens)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
      animation: {
        fade: "fade var(--animation-duration-normal) ease-in-out",
        scale: "scale var(--animation-duration-normal) cubic-bezier(0.16, 1, 0.3, 1)",
        slide: "slide var(--animation-duration-normal) ease-out",
      },

      /* Font Family */
      fontFamily: {
        sans: ["var(--font-manrope)", ...defaultTheme.fontFamily.sans],
      },

      /* Border Radius */
      borderRadius: {
        md: "var(--radius)",
      },

      /* Background Images */
      backgroundImage: {
        "signature-gradient":
          "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-container)) 100%)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".glass-surface": {
          "@apply bg-white/80 backdrop-blur-[20px]": {},
        },
        ".no-border": {
          "@apply border-0": {},
        },
      });
    },
  ],
};
export default config;
