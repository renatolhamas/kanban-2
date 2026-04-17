/**
 * The Digital Atelier — Design System v2.0
 * Tailwind CSS v4 Theme Configuration
 * Generated: 2026-04-16
 *
 * Usage in tailwind.config.js:
 *   const tokens = require('./docs/design-system/tokens/tokens.tailwind.js');
 *   module.exports = {
 *     theme: { extend: tokens }
 *   }
 */

module.exports = {
  colors: {
    // Primary Brand
    primary: '#0d631b',
    'primary-container': '#2e7d32',
    'primary-hover': '#2e7d32',

    // Secondary & Tertiary
    secondary: '#4c616c',
    tertiary: '#006156',

    // Error States
    error: '#ba1a1a',
    'error-container': '#ffdad6',

    // Neutral Surfaces (Tonal Layering)
    surface: '#f7f9fc',
    'surface-bright': '#ffffff',
    'surface-container': {
      lowest: '#ffffff',
      low: '#f2f4f7',
      DEFAULT: '#ecf0f3',
      high: '#e6e8eb',
      highest: '#e0e3e6',
    },

    // Text Colors
    'on-surface': '#191c1e',
    'on-surface-variant': '#40493d',

    // Semantic
    background: '#f7f9fc',
    foreground: '#191c1e',

    // Status
    success: '#0d631b',
    'success-background': '#f2f4f7',
    warning: '#2e7d32',
    'warning-background': '#f2f4f7',

    // Outline
    'outline-variant': 'rgba(112, 122, 108, 0.15)',
    border: 'rgba(112, 122, 108, 0.15)',
    'border-dark': '#40493d',

    // Inverse
    'inverse-surface': '#2d3133',

    // Text Semantic
    text: {
      primary: '#191c1e',
      secondary: '#40493d',
      inverse: '#ffffff',
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  borderRadius: {
    xs: '0.125rem',
    sm: '0.25rem',
    base: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    full: '9999px',
  },

  fontSize: {
    'headline-lg': ['2.25rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.03em' }],
    'headline-md': ['1.5rem', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.02em' }],
    'headline-sm': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
    'body-md': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
    'label-sm': ['0.75rem', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.08em' }],
  },

  fontFamily: {
    primary: 'Inter, system-ui, -apple-system, sans-serif',
    sans: 'Inter, system-ui, -apple-system, sans-serif',
  },

  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.75',
  },

  letterSpacing: {
    tight: '-0.03em',
    normal: '0',
    wide: '0.08em',
  },

  boxShadow: {
    ambient: '0px 12px 32px rgba(25, 28, 30, 0.06)',
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },

  backdropBlur: {
    sm: 'blur(4px)',
    md: 'blur(12px)',
    lg: 'blur(24px)',
  },

  // ============================================================================
  // COMPONENT PATTERNS (Composable Utilities)
  // ============================================================================
  extend: {
    backgroundColor: {
      'btn-primary': 'var(--color-primary)',
      'btn-secondary': 'var(--color-surface-container-high)',
      'input-field': 'var(--color-surface-container-high)',
      'card-default': 'var(--color-surface-container-lowest)',
    },

    textColor: {
      'btn-primary': '#ffffff',
      'btn-secondary': 'var(--color-text-primary)',
      'input-text': 'var(--color-text-primary)',
    },

    borderColor: {
      'input-focus': 'var(--color-primary)',
      'card-accent': 'var(--color-primary-container)',
    },

    padding: {
      'btn-lg': '16px 24px',
      'btn-md': '12px 24px',
      'btn-sm': '8px 16px',
      'card': '24px',
      'input': '16px',
    },

    // Tonal Layer Utilities
    backgroundColor: {
      'surface-0': '#f7f9fc',
      'surface-1': '#f2f4f7',
      'surface-2': '#ecf0f3',
      'surface-3': '#e6e8eb',
      'surface-4': '#e0e3e6',
    },

    // Typography Composition (use with @apply)
    opacity: {
      '15': '0.15',
    },
  },
};
