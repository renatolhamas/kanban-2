/**
 * Tailwind CSS v4 Theme Configuration
 * Generated from design tokens
 * Date: 2026-04-11
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        // Neutral palette
        neutral: {
          0: "#ffffff",
          50: "#f3f3f3",
          100: "#cccccc",
          200: "#c1c1c1",
          300: "#999999",
          500: "#616161",
          600: "#444444",
          700: "#333333",
          900: "#000000",
        },

        // Brand colors
        primary: "#007acc",
        "primary-light": "#3794ff",

        // Status colors
        success: "#5f8787",
        error: "#f14c4c",
        "error-dark": "#e51400",
        warning: "#d5c4a1",

        // Semantic colors
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
      },

      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
        "4xl": "80px",
      },

      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        md: ["18px", { lineHeight: "28px" }],
        lg: ["20px", { lineHeight: "32px" }],
        xl: ["24px", { lineHeight: "36px" }],
        "2xl": ["28px", { lineHeight: "40px" }],
        "3xl": ["32px", { lineHeight: "44px" }],
        "4xl": ["40px", { lineHeight: "52px" }],
        "5xl": ["48px", { lineHeight: "60px" }],
      },

      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },

      fontFamily: {
        base: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        mono: "Menlo, Monaco, 'Courier New', monospace",
      },

      borderRadius: {
        sm: "2px",
        md: "4px",
        lg: "8px",
        xl: "16px",
        full: "9999px",
      },

      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px rgba(0, 0, 0, 0.15)",
      },
    },
  },

  // Component layer for buttons, inputs, cards
  corePlugins: {
    preflight: true,
  },

  // Plugins for custom component classes
  plugins: [
    function ({ addComponents, theme }) {
      const buttons = {
        ".btn-primary": {
          backgroundColor: theme("colors.primary"),
          color: "#ffffff",
          padding: `${theme("spacing.md")} ${theme("spacing.lg")}`,
          borderRadius: theme("borderRadius.md"),
          fontWeight: theme("fontWeight.medium"),
          border: "none",
          cursor: "pointer",
          transition: "background-color 0.2s",

          "&:hover": {
            backgroundColor: theme("colors.primary-light"),
          },
        },

        ".btn-secondary": {
          backgroundColor: theme("colors.neutral.50"),
          color: theme("colors.neutral.900"),
          padding: `${theme("spacing.md")} ${theme("spacing.lg")}`,
          border: `1px solid ${theme("colors.neutral.200")}`,
          borderRadius: theme("borderRadius.md"),
          cursor: "pointer",
          transition: "all 0.2s",

          "&:hover": {
            backgroundColor: theme("colors.neutral.100"),
          },
        },

        ".btn-danger": {
          backgroundColor: theme("colors.error"),
          color: "#ffffff",
          padding: `${theme("spacing.md")} ${theme("spacing.lg")}`,
          borderRadius: theme("borderRadius.md"),
          fontWeight: theme("fontWeight.medium"),
          border: "none",
          cursor: "pointer",

          "&:hover": {
            backgroundColor: theme("colors.error-dark"),
          },
        },

        ".btn-ghost": {
          backgroundColor: "transparent",
          color: theme("colors.primary"),
          padding: `${theme("spacing.md")} ${theme("spacing.lg")}`,
          border: "none",
          cursor: "pointer",
          transition: "color 0.2s",

          "&:hover": {
            color: theme("colors.primary-light"),
          },
        },
      };

      const inputs = {
        ".input-base": {
          padding: theme("spacing.md"),
          border: `1px solid ${theme("colors.neutral.200")}`,
          borderRadius: theme("borderRadius.md"),
          fontSize: theme("fontSize.base"),
          fontFamily: theme("fontFamily.base"),

          "&:focus": {
            outline: "none",
            borderColor: theme("colors.primary"),
            boxShadow: `0 0 0 2px rgba(0, 122, 204, 0.12)`,
          },
        },
      };

      const cards = {
        ".card": {
          backgroundColor: "#ffffff",
          padding: theme("spacing.lg"),
          borderRadius: theme("borderRadius.lg"),
          boxShadow: theme("boxShadow.sm"),
        },
      };

      addComponents({ ...buttons, ...inputs, ...cards });
    },
  ],
};
