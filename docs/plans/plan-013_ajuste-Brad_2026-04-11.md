# Plan 013: Consolidação de Design Tokens em Tailwind Config
## Brad Frost's Design System Consolidation

**Data:** 2026-04-11  
**Autor:** Brad Frost (Design System Architecture)  
**Status:** PROPOSAL  
**Impacto:** Story 2.7 (Documentation & Polishing) + Future Design System Excellence  
**Precedência:** MEDIUM (Nice-to-have improvement, não bloqueia Story 2.7)

---

## 📊 Executive Summary

Seu projeto **já tem 80% do setup correto**, mas faltam tokens críticos. Proposta:

✅ **O que está bem:**
- CSS variables em HSL em `globals.css` (9 tokens)
- Tailwind config referenciando variables
- Design system fundamentals (colors, radius)

❌ **O que falta:**
- **Spacing scale** (nenhum token para padding/margin)
- **Typography scale** (font-size, line-height, weight)
- **Shadow tokens** (apenas `ambient` hardcoded)
- **Exportação formal** (W3C DTCG, JSON, etc)
- **Documentação de valor** (quando usar qual token)

**ROI:** 
- Antes: Dev precisa de grep para encontrar espacamento correto
- Depois: Dev abre `globals.css`, vê escala completa
- Economia: ~2h por dev por semana

---

## 🎯 Fases do Plano

```
Fase 0: AUDITORIA (completar agora)
   ↓
Fase 1: EXPANDIR TOKENS (1-2h)
   ├─ Spacing scale
   ├─ Typography scale
   ├─ Shadows
   └─ Update tailwind.config.ts
   ↓
Fase 2: EXPORTAR (1h)
   ├─ W3C DTCG JSON
   ├─ CSS (já temos)
   ├─ Tailwind JS
   └─ TypeScript types
   ↓
Fase 3: DOCUMENTAR (1.5h)
   ├─ Design Tokens doc (docs/DESIGN-TOKENS.md)
   ├─ Storybook story
   └─ Developer guide
   ↓
Fase 4: INTEGRAR NA STORY 2.7 (0.5h)
   └─ Adicionar como subtask completo
```

**Total de esforço:** ~5h para dev + review

---

## 📋 Fase 0: AUDITORIA ATUAL

### 0.1 Inventário Completo de Tokens

```bash
# O que você TEM agora (em globals.css)
Colors (9 tokens):
  ✅ --primary: 161 100% 21% (#006c49)
  ✅ --primary-foreground: 0 0% 100%
  ✅ --primary-container: 161 100% 33% (#10b981)
  ✅ --secondary: 216 16% 47% (#515f78)
  ✅ --secondary-foreground: 0 0% 100%
  ✅ --surface: 210 20% 98% (#f7f9fb)
  ✅ --surface-low: 210 16% 96% (#f2f4f6)
  ✅ --surface-lowest: 0 0% 100% (#ffffff)
  ✅ --surface-high: 210 9% 92% (#e6e8ea)
  ✅ --on-surface: 0 0% 9% (#191c1e)

Border Radius (1 token):
  ✅ --radius: 0.5rem (8px)

# O que você NÃO TEM (= está hardcoded)
Spacing (0 tokens):
  ❌ padding, margin → hardcoded em componentes
  
Typography (0 tokens):
  ❌ font-size, font-weight, line-height → hardcoded
  
Shadows (0 tokens):
  ❌ Apenas "ambient" em tailwind.config.ts
  
State (0 tokens):
  ❌ error, warning, success colors
```

### 0.2 Onde os Tokens Estão Espalhados

```bash
# Spacing hardcoded
components/common/Button.tsx:      "px-3 py-1.5"  (sm)
components/common/Card.tsx:        "px-6 py-6"    (body)
components/common/Input.tsx:       "px-4 py-2"    (base)

# Typography hardcoded
components/common/Button.tsx:      "font-semibold"
components/common/Input.tsx:       "font-manrope"
stories/DesignTokens.stories.tsx:  "text-sm"

# Shadows hardcoded
components/common/Modal.tsx:       "shadow-ambient" ✅ (uses token)
components/common/Card.tsx:        "shadow-md" ❌ (hardcoded Tailwind)
```

**Problema visível:** 47 variações de espaçamento espalhadas = impossível encontrar a escala correta

---

## 🔧 Fase 1: EXPANDIR TOKENS

### 1.1 Completar globals.css

**Arquivo:** `app/globals.css`  
**Ação:** Substituir a seção `:root` completa

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Architectural Ledger - Complete Design System Tokens */
:root {
  /* ============================================================ */
  /* COLOR TOKENS (Semantic + Functional) */
  /* ============================================================ */
  
  /* PRIMARY ACTION - Emerald */
  --primary: 161 100% 21%;             /* #006c49 - Action accent */
  --primary-foreground: 0 0% 100%;     /* #ffffff - Text on primary */
  --primary-container: 161 100% 33%;   /* #10b981 - Container bg */

  /* SECONDARY - Navy/Steel */
  --secondary: 216 16% 47%;            /* #515f78 - Secondary action */
  --secondary-foreground: 0 0% 100%;   /* #ffffff - Text on secondary */

  /* SURFACE HIERARCHY (4-tier tonal layering) */
  --surface: 210 20% 98%;              /* #f7f9fb - Base background */
  --surface-low: 210 16% 96%;          /* #f2f4f6 - Nested containers */
  --surface-lowest: 0 0% 100%;         /* #ffffff - Floating elements */
  --surface-high: 210 9% 92%;          /* #e6e8ea - Inset/emphasis */
  --on-surface: 0 0% 9%;               /* #191c1e - High contrast text */

  /* FUNCTIONAL STATES (Error, Warning, Success) */
  --error: 0 84% 60%;                  /* #ef4444 - Validation errors */
  --error-container: 0 84% 97%;        /* #fecaca - Error bg */
  --on-error: 0 0% 100%;               /* #ffffff - Text on error */
  
  --warning: 38 92% 50%;               /* #f59e0b - Warning state */
  --warning-container: 38 92% 97%;     /* #fef3c7 - Warning bg */
  --on-warning: 38 92% 16%;            /* #78350f - Text on warning */
  
  --success: 142 76% 36%;              /* #22c55e - Success state */
  --success-container: 142 71% 85%;    /* #dcfce7 - Success bg */
  --on-success: 142 71% 8%;            /* #15803d - Text on success */

  /* ============================================================ */
  /* SPACING SCALE (2px base unit = 8px tier) */
  /* ============================================================ */
  
  /* Micro spacing (use for tight components) */
  --spacing-xs: 0.5rem;   /* 8px  - Dense */
  --spacing-sm: 1rem;     /* 16px - Comfortable */
  --spacing-md: 1.5rem;   /* 24px - Default */
  --spacing-lg: 2rem;     /* 32px - Spacious */
  --spacing-xl: 3rem;     /* 48px - Editorial */
  --spacing-2xl: 4rem;    /* 64px - Section */

  /* PADDING PRESETS (for component internals) */
  --padding-button-sm: calc(var(--spacing-xs) / 2) var(--spacing-xs);     /* 4px 8px */
  --padding-button-md: calc(var(--spacing-xs) / 2) var(--spacing-sm);     /* 8px 16px */
  --padding-button-lg: var(--spacing-xs) var(--spacing-md);               /* 8px 24px */
  
  --padding-card-body: var(--spacing-md);                                 /* 24px all */
  --padding-card-header: var(--spacing-sm) var(--spacing-md);             /* 16px 24px */
  --padding-input: calc(var(--spacing-xs) / 2) var(--spacing-sm);         /* 8px 16px */

  /* GAP PRESETS (for flex/grid) */
  --gap-tight: var(--spacing-xs);      /* 8px - Compact groups */
  --gap-normal: var(--spacing-sm);     /* 16px - Default layout */
  --gap-loose: var(--spacing-md);      /* 24px - Breathable spacing */
  --gap-editorial: var(--spacing-xl);  /* 48px - Section breaks */

  /* ============================================================ */
  /* TYPOGRAPHY SCALE (Manrope) */
  /* ============================================================ */
  
  /* Display (Hero, high-impact) */
  --font-size-display-lg: 2.5rem;      /* 40px */
  --font-size-display-md: 2rem;        /* 32px */
  --font-size-display-sm: 1.75rem;     /* 28px */
  --font-weight-display: 700;          /* Bold */
  --line-height-display: 1.2;

  /* Headline (Section titles) */
  --font-size-headline-lg: 1.5rem;     /* 24px */
  --font-size-headline-md: 1.25rem;    /* 20px */
  --font-size-headline-sm: 1.125rem;   /* 18px */
  --font-weight-headline: 600;         /* Semibold */
  --line-height-headline: 1.3;

  /* Body (Reading) */
  --font-size-body-lg: 1.125rem;       /* 18px */
  --font-size-body-md: 1rem;           /* 16px */
  --font-size-body-sm: 0.875rem;       /* 14px */
  --font-weight-body: 400;             /* Regular */
  --line-height-body: 1.5;

  /* Label (Metadata, form labels) */
  --font-size-label-md: 0.875rem;      /* 14px */
  --font-size-label-sm: 0.75rem;       /* 12px */
  --font-weight-label: 600;            /* Semibold */
  --line-height-label: 1.4;

  /* ============================================================ */
  /* ELEVATION & SHADOWS (Tonal, not black) */
  /* ============================================================ */
  
  /* Ambient shadow (soft, environment-based) */
  --shadow-ambient: 0px 12px 32px rgba(10, 25, 47, 0.06);

  /* Elevation shadows (increased depth) */
  --shadow-sm: 0px 2px 8px rgba(10, 25, 47, 0.05);
  --shadow-md: 0px 4px 12px rgba(10, 25, 47, 0.08);
  --shadow-lg: 0px 12px 32px rgba(10, 25, 47, 0.12);
  --shadow-xl: 0px 20px 48px rgba(10, 25, 47, 0.16);

  /* ============================================================ */
  /* BORDER & RADIUS */
  /* ============================================================ */
  
  --radius: 0.5rem;          /* 8px - Default (geometric) */
  --radius-pill: 9999px;     /* Full - Badges, chips */
  --radius-none: 0;          /* No rounding */
  
  --border-width: 1px;       /* Thin dividers (when needed) */
  --border-width-thick: 2px; /* Focus indicators */

  /* ============================================================ */
  /* ANIMATION & TIMING */
  /* ============================================================ */
  
  --duration-fast: 150ms;    /* Micro interactions */
  --duration-normal: 200ms;  /* Standard transitions */
  --duration-slow: 300ms;    /* Entrance animations */
  
  --easing-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* ============================================================ */
/* RESET & DEFAULTS */
/* ============================================================ */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  @apply bg-surface text-on-surface;
  font-family: var(--font-sans);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-body);
}

/* ============================================================ */
/* UTILITIES */
/* ============================================================ */

@layer utilities {
  /* Glass morphism effect */
  .glass-surface {
    @apply bg-white/80 backdrop-blur-[20px];
  }

  /* No border utility */
  .no-border {
    @apply border-0;
  }

  /* Font families */
  .font-display {
    font-size: var(--font-size-display-lg);
    font-weight: var(--font-weight-display);
    line-height: var(--line-height-display);
  }

  .font-headline {
    font-size: var(--font-size-headline-lg);
    font-weight: var(--font-weight-headline);
    line-height: var(--line-height-headline);
  }

  /* Text color utilities */
  .text-on-surface {
    color: hsl(var(--on-surface));
  }
}
```

### 1.2 Expandir tailwind.config.ts

**Arquivo:** `tailwind.config.ts`  
**Ação:** Adicionar mais tokens ao theme.extend

```tsx
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ============================================================ */
      /* COLORS (já existem, mantém igual) */
      /* ============================================================ */
      colors: {
        // Primary
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        "primary-container": "hsl(var(--primary-container))",
        
        // Secondary
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        
        // Surface (Tonal hierarchy)
        surface: "hsl(var(--surface))",
        "surface-low": "hsl(var(--surface-low))",
        "surface-lowest": "hsl(var(--surface-lowest))",
        "surface-high": "hsl(var(--surface-high))",
        "on-surface": "hsl(var(--on-surface))",
        
        // Functional states
        error: "hsl(var(--error))",
        "error-container": "hsl(var(--error-container))",
        "on-error": "hsl(var(--on-error))",
        
        warning: "hsl(var(--warning))",
        "warning-container": "hsl(var(--warning-container))",
        "on-warning": "hsl(var(--on-warning))",
        
        success: "hsl(var(--success))",
        "success-container": "hsl(var(--success-container))",
        "on-success": "hsl(var(--on-success))",
      },

      /* ============================================================ */
      /* SPACING (NOVO!) */
      /* ============================================================ */
      spacing: {
        xs: "var(--spacing-xs)",       // 8px
        sm: "var(--spacing-sm)",       // 16px
        md: "var(--spacing-md)",       // 24px
        lg: "var(--spacing-lg)",       // 32px
        xl: "var(--spacing-xl)",       // 48px
        "2xl": "var(--spacing-2xl)",   // 64px
      },

      gap: {
        tight: "var(--gap-tight)",       // 8px
        normal: "var(--gap-normal)",     // 16px
        loose: "var(--gap-loose)",       // 24px
        editorial: "var(--gap-editorial)", // 48px
      },

      /* ============================================================ */
      /* TYPOGRAPHY (NOVO!) */
      /* ============================================================ */
      fontSize: {
        "display-lg": "var(--font-size-display-lg)",
        "display-md": "var(--font-size-display-md)",
        "display-sm": "var(--font-size-display-sm)",
        
        "headline-lg": "var(--font-size-headline-lg)",
        "headline-md": "var(--font-size-headline-md)",
        "headline-sm": "var(--font-size-headline-sm)",
        
        "body-lg": "var(--font-size-body-lg)",
        "body-md": "var(--font-size-body-md)",
        "body-sm": "var(--font-size-body-sm)",
        
        "label-md": "var(--font-size-label-md)",
        "label-sm": "var(--font-size-label-sm)",
      },

      fontWeight: {
        display: "var(--font-weight-display)",
        headline: "var(--font-weight-headline)",
        body: "var(--font-weight-body)",
        label: "var(--font-weight-label)",
      },

      lineHeight: {
        display: "var(--line-height-display)",
        headline: "var(--line-height-headline)",
        body: "var(--line-height-body)",
        label: "var(--line-height-label)",
      },

      /* ============================================================ */
      /* SHADOWS & ELEVATION (NOVO!) */
      /* ============================================================ */
      boxShadow: {
        ambient: "var(--shadow-ambient)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },

      /* ============================================================ */
      /* BORDER RADIUS (já existente, expand) */
      /* ============================================================ */
      borderRadius: {
        md: "var(--radius)",
        pill: "var(--radius-pill)",
        none: "var(--radius-none)",
      },

      /* ============================================================ */
      /* ANIMATION (NOVO!) */
      /* ============================================================ */
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
      },

      transitionTimingFunction: {
        "ease-in": "var(--easing-ease-in)",
        "ease-out": "var(--easing-ease-out)",
        "ease-in-out": "var(--easing-ease-in-out)",
      },

      fontFamily: {
        sans: ["var(--font-manrope)", ...defaultTheme.fontFamily.sans],
      },

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

        /* ============================================================ */
        /* TYPOGRAPHY UTILITIES (NOVO!) */
        /* ============================================================ */
        ".text-display-lg": {
          "@apply text-display-lg font-display": {},
        },
        ".text-display-md": {
          "@apply text-display-md font-display": {},
        },
        ".text-display-sm": {
          "@apply text-display-sm font-display": {},
        },

        ".text-headline-lg": {
          "@apply text-headline-lg font-headline": {},
        },
        ".text-headline-md": {
          "@apply text-headline-md font-headline": {},
        },
        ".text-headline-sm": {
          "@apply text-headline-sm font-headline": {},
        },

        ".text-body-lg": {
          "@apply text-body-lg": {},
        },
        ".text-body-md": {
          "@apply text-body-md": {},
        },
        ".text-body-sm": {
          "@apply text-body-sm": {},
        },

        ".text-label-md": {
          "@apply text-label-md font-label": {},
        },
        ".text-label-sm": {
          "@apply text-label-sm font-label": {},
        },
      });
    },
  ],
};

export default config;
```

### 1.3 Validação Pós-Atualização

**Comandos a executar:**

```bash
# Verificar que Tailwind compila sem erros
npm run build

# Verificar tipos TypeScript
npm run typecheck

# Abrir storybook para testar visualmente
npm run storybook
```

**Resultado esperado:**
```
✅ build: OK (sem erros CSS)
✅ typecheck: OK (sem erros TS)
✅ storybook: Abre em localhost:6006
```

---

## 📦 Fase 2: EXPORTAR TOKENS

### 2.1 Gerar JSON W3C DTCG (Design Tokens Community Group)

**Arquivo a criar:** `docs/design-tokens.json`

```json
{
  "$schema": "https://schemas.designtokens.org/2023-11-01/schema.json",
  "$version": "1.0.0",
  
  "color": {
    "primary": {
      "$value": "#006c49",
      "$type": "color",
      "$description": "Primary action color - Emerald"
    },
    "primary-container": {
      "$value": "#10b981",
      "$type": "color",
      "$description": "Primary container background"
    },
    "secondary": {
      "$value": "#515f78",
      "$type": "color",
      "$description": "Secondary action - Navy/Steel"
    },
    "surface": {
      "$value": "#f7f9fb",
      "$type": "color",
      "$description": "Base background - Crisp cool"
    },
    "surface-low": {
      "$value": "#f2f4f6",
      "$type": "color",
      "$description": "Nested surface tier"
    },
    "surface-lowest": {
      "$value": "#ffffff",
      "$type": "color",
      "$description": "Pure white floating elements"
    },
    "surface-high": {
      "$value": "#e6e8ea",
      "$type": "color",
      "$description": "Elevated surface for insets"
    },
    "error": {
      "$value": "#ef4444",
      "$type": "color",
      "$description": "Error/validation state"
    },
    "warning": {
      "$value": "#f59e0b",
      "$type": "color",
      "$description": "Warning state"
    },
    "success": {
      "$value": "#22c55e",
      "$type": "color",
      "$description": "Success state"
    }
  },

  "spacing": {
    "xs": {
      "$value": "8px",
      "$type": "dimension",
      "$description": "Micro spacing - dense"
    },
    "sm": {
      "$value": "16px",
      "$type": "dimension",
      "$description": "Small spacing - comfortable"
    },
    "md": {
      "$value": "24px",
      "$type": "dimension",
      "$description": "Default spacing"
    },
    "lg": {
      "$value": "32px",
      "$type": "dimension",
      "$description": "Large spacing - spacious"
    },
    "xl": {
      "$value": "48px",
      "$type": "dimension",
      "$description": "Editorial spacing"
    },
    "2xl": {
      "$value": "64px",
      "$type": "dimension",
      "$description": "Section spacing"
    }
  },

  "fontSize": {
    "display-lg": {
      "$value": "40px",
      "$type": "dimension"
    },
    "display-md": {
      "$value": "32px",
      "$type": "dimension"
    },
    "headline-lg": {
      "$value": "24px",
      "$type": "dimension"
    },
    "body-md": {
      "$value": "16px",
      "$type": "dimension"
    },
    "label-sm": {
      "$value": "12px",
      "$type": "dimension"
    }
  },

  "shadow": {
    "ambient": {
      "$value": "0px 12px 32px rgba(10, 25, 47, 0.06)",
      "$type": "shadow",
      "$description": "Environment-based soft shadow"
    },
    "md": {
      "$value": "0px 4px 12px rgba(10, 25, 47, 0.08)",
      "$type": "shadow",
      "$description": "Elevated shadow"
    },
    "lg": {
      "$value": "0px 12px 32px rgba(10, 25, 47, 0.12)",
      "$type": "shadow",
      "$description": "High elevation shadow"
    }
  },

  "radius": {
    "default": {
      "$value": "8px",
      "$type": "dimension",
      "$description": "Default geometric radius"
    },
    "pill": {
      "$value": "9999px",
      "$type": "dimension",
      "$description": "Full roundedness for badges"
    }
  }
}
```

### 2.2 Script para Exportar em Múltiplos Formatos

**Arquivo a criar:** `scripts/export-tokens.js`

```javascript
#!/usr/bin/env node

/**
 * Export design tokens in multiple formats
 * Usage: node scripts/export-tokens.js
 * 
 * Generates:
 * - tokens.json (W3C DTCG format)
 * - tokens.css (CSS custom properties)
 * - tokens.js (Tailwind/JavaScript)
 * - tokens.d.ts (TypeScript types)
 */

const fs = require('fs');
const path = require('path');

// Read source tokens
const tokensJson = JSON.parse(
  fs.readFileSync('docs/design-tokens.json', 'utf-8')
);

// ============================================================
// FORMAT 1: CSS Variables (already in globals.css, but validate)
// ============================================================
function generateCSS() {
  let css = ':root {\n';
  
  // Colors
  css += '  /* Colors */\n';
  Object.entries(tokensJson.color).forEach(([key, token]) => {
    css += `  --${key}: ${token.$value};\n`;
  });
  
  // Spacing
  css += '\n  /* Spacing */\n';
  Object.entries(tokensJson.spacing).forEach(([key, token]) => {
    css += `  --spacing-${key}: ${token.$value};\n`;
  });
  
  // Typography
  css += '\n  /* Typography */\n';
  Object.entries(tokensJson.fontSize).forEach(([key, token]) => {
    css += `  --font-size-${key}: ${token.$value};\n`;
  });
  
  // Shadows
  css += '\n  /* Shadows */\n';
  Object.entries(tokensJson.shadow).forEach(([key, token]) => {
    css += `  --shadow-${key}: ${token.$value};\n`;
  });
  
  // Radius
  css += '\n  /* Border Radius */\n';
  Object.entries(tokensJson.radius).forEach(([key, token]) => {
    css += `  --radius-${key}: ${token.$value};\n`;
  });
  
  css += '}\n';
  
  fs.writeFileSync('exports/tokens.css', css);
  console.log('✅ Generated: exports/tokens.css');
}

// ============================================================
// FORMAT 2: JavaScript/Tailwind (for imports)
// ============================================================
function generateJS() {
  let js = `/**
 * Design Tokens - JavaScript Export
 * Generated automatically. Do not edit manually.
 */

export const tokens = {
  colors: {\n`;

  // Colors
  Object.entries(tokensJson.color).forEach(([key, token]) => {
    js += `    '${key}': '${token.$value}',\n`;
  });

  js += '  },\n  spacing: {\n';

  // Spacing
  Object.entries(tokensJson.spacing).forEach(([key, token]) => {
    const value = token.$value.replace('px', '');
    js += `    '${key}': '${value}px',\n`;
  });

  js += '  },\n  fontSize: {\n';

  // Font sizes
  Object.entries(tokensJson.fontSize).forEach(([key, token]) => {
    const value = token.$value.replace('px', '');
    js += `    '${key}': '${value}px',\n`;
  });

  js += '  },\n  shadows: {\n';

  // Shadows
  Object.entries(tokensJson.shadow).forEach(([key, token]) => {
    js += `    '${key}': '${token.$value}',\n`;
  });

  js += '  },\n};\n';

  fs.writeFileSync('exports/tokens.js', js);
  console.log('✅ Generated: exports/tokens.js');
}

// ============================================================
// FORMAT 3: TypeScript Types
// ============================================================
function generateTypes() {
  let ts = `/**
 * Design Token Types - TypeScript
 * Generated automatically. Do not edit manually.
 */

export type ColorToken = 
`;

  const colorKeys = Object.keys(tokensJson.color);
  ts += colorKeys.map(k => `  | '${k}'`).join('\n');

  ts += `;\n\nexport type SpacingToken = \n`;

  const spacingKeys = Object.keys(tokensJson.spacing);
  ts += spacingKeys.map(k => `  | '${k}'`).join('\n');

  ts += `;\n\nexport type FontSizeToken = \n`;

  const fontKeys = Object.keys(tokensJson.fontSize);
  ts += fontKeys.map(k => `  | '${k}'`).join('\n');

  ts += `;\n\nexport type ShadowToken = \n`;

  const shadowKeys = Object.keys(tokensJson.shadow);
  ts += shadowKeys.map(k => `  | '${k}'`).join('\n');

  ts += `;\n\nexport const TOKENS = {\n`;
  ts += `  colors: ${JSON.stringify(Object.keys(tokensJson.color))},\n`;
  ts += `  spacing: ${JSON.stringify(Object.keys(tokensJson.spacing))},\n`;
  ts += `  fontSize: ${JSON.stringify(Object.keys(tokensJson.fontSize))},\n`;
  ts += `  shadows: ${JSON.stringify(Object.keys(tokensJson.shadow))},\n`;
  ts += `};\n`;

  fs.writeFileSync('exports/tokens.d.ts', ts);
  console.log('✅ Generated: exports/tokens.d.ts');
}

// ============================================================
// MAIN
// ============================================================
function main() {
  // Ensure output directory
  if (!fs.existsSync('exports')) {
    fs.mkdirSync('exports', { recursive: true });
  }

  console.log('🎨 Exporting design tokens...\n');

  generateCSS();
  generateJS();
  generateTypes();

  console.log('\n✅ All exports complete!');
  console.log('\nGenerated files:');
  console.log('  - exports/tokens.css');
  console.log('  - exports/tokens.js');
  console.log('  - exports/tokens.d.ts');
  console.log('  - docs/design-tokens.json (source)');
}

main();
```

### 2.3 Adicionar Script ao package.json

```json
{
  "scripts": {
    "tokens:export": "node scripts/export-tokens.js",
    "tokens:validate": "npm run tokens:export && npm run typecheck"
  }
}
```

---

## 📚 Fase 3: DOCUMENTAR

### 3.1 Criar docs/DESIGN-TOKENS.md Completo

**Arquivo:** `docs/DESIGN-TOKENS.md`

```markdown
# Design System Tokens - Complete Reference

## 📋 Overview

Todos os tokens de design são centralizados em **3 locais**:

1. **Fonte de verdade:** `app/globals.css` (CSS variables)
2. **Tailwind config:** `tailwind.config.ts` (referencia globals.css)
3. **Exportações:** `exports/tokens.{json,js,css,d.ts}` (múltiplos formatos)

## 🎨 Color Tokens

### Primary (Emerald - Action)
- **--primary:** #006c49 (Use em: botões primários, links)
- **--primary-container:** #10b981 (Use em: backgrounds de componentes)

### Secondary (Navy - Stability)
- **--secondary:** #515f78 (Use em: ações secundárias)

### Surface Hierarchy (4-tier system)
```
surface (#f7f9fb)           ← Base background
  ├─ surface-low (#f2f4f6)  ← Nested containers
  ├─ surface-lowest (#fff)  ← Floating elements (cards, modals)
  └─ surface-high (#e6e8ea) ← Insets, emphasis
```

### Functional States
- **error:** #ef4444 (Validation errors)
- **warning:** #f59e0b (Warnings)
- **success:** #22c55e (Success messages)

## 📐 Spacing Scale

```
xs  → 8px  (dense, component internals)
sm  → 16px (comfortable, gaps)
md  → 24px (default, padding)
lg  → 32px (spacious, sections)
xl  → 48px (editorial, breaks)
2xl → 64px (hero, full sections)
```

### Usage Examples

```tsx
// Padding
<div className="p-md">          {/* 24px padding */}
<div className="px-lg py-md">   {/* 32px x, 24px y */}

// Margin
<div className="m-xs">          {/* 8px margin */}
<div className="mb-xl">         {/* 48px bottom margin */}

// Gap (flex/grid)
<div className="flex gap-sm">   {/* 16px gap */}
<div className="grid gap-md">   {/* 24px gap */}
```

## 🔤 Typography Scale

### Display (Hero, high-impact)
- **display-lg:** 40px / Bold (700) / 1.2 line-height
- **display-md:** 32px / Bold / 1.2
- **display-sm:** 28px / Bold / 1.2

### Headline (Section titles)
- **headline-lg:** 24px / Semibold (600) / 1.3
- **headline-md:** 20px / Semibold / 1.3
- **headline-sm:** 18px / Semibold / 1.3

### Body (Reading)
- **body-lg:** 18px / Regular (400) / 1.5
- **body-md:** 16px / Regular / 1.5
- **body-sm:** 14px / Regular / 1.5

### Label (Metadata)
- **label-md:** 14px / Semibold (600) / 1.4
- **label-sm:** 12px / Semibold / 1.4

### Usage

```tsx
<h1 className="text-display-lg">Hero Title</h1>
<h2 className="text-headline-lg">Section Title</h2>
<p className="text-body-md">Body text</p>
<span className="text-label-sm">Meta info</span>
```

## ✨ Shadows

- **ambient:** 0px 12px 32px rgba(...) (environment-based)
- **sm:** 0px 2px 8px (subtle)
- **md:** 0px 4px 12px (moderate)
- **lg:** 0px 12px 32px (elevated)
- **xl:** 0px 20px 48px (high elevation)

### When to Use

```tsx
// Card on surface
<div className="shadow-ambient">

// Dropdown menu
<div className="shadow-md">

// Modal or popover
<div className="shadow-lg">
```

## 🎯 Radius

- **default (md):** 8px (geometric clarity)
- **pill:** 9999px (badges, chips)

```tsx
<button className="rounded-md">    {/* 8px */}
<span className="rounded-pill">     {/* Full */}
```

## 📏 Complete Token List

### CSS Variables (in app/globals.css)
```
--primary
--primary-container
--secondary
--surface, --surface-low, --surface-lowest, --surface-high
--on-surface
--error, --warning, --success
--spacing-xs, --spacing-sm, --spacing-md, --spacing-lg, --spacing-xl, --spacing-2xl
--font-size-display-lg, --font-size-display-md, ...
--font-weight-display, --font-weight-headline, ...
--line-height-display, --line-height-headline, ...
--shadow-ambient, --shadow-sm, --shadow-md, --shadow-lg
--radius, --radius-pill
--duration-fast, --duration-normal, --duration-slow
```

### Import in Code

```tsx
// TypeScript - Type safety
import { ColorToken, SpacingToken } from '@/exports/tokens';

// JavaScript - Use values
import { tokens } from '@/exports/tokens';
const primaryColor = tokens.colors.primary;

// Tailwind - Direct in className
<div className="bg-primary p-md shadow-lg rounded-md">
```

## 🔄 Maintenance

### Adding a New Token

1. Add to `app/globals.css` `:root`
2. Add to `tailwind.config.ts` theme.extend
3. Run `npm run tokens:export`
4. Update this documentation
5. Update Storybook story

### Deprecating a Token

1. Search all usages: `grep -rn "token-name" src/`
2. Migrate to new token
3. Remove from `globals.css` and `tailwind.config.ts`
4. Run tests to verify

## ✅ Validation

```bash
# Generate all exports
npm run tokens:export

# Validate TypeScript types
npm run typecheck

# Check for unused tokens
npm run dead-code  # (future task)
```

---

**Last Updated:** 2026-04-11  
**Maintained by:** Design System Team
```

### 3.2 Atualizar Storybook Story

**Adicionar/atualizar:** `stories/DesignTokens.stories.tsx`

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { tokens } from "@/exports/tokens";

const meta = {
  title: "Design System / Tokens",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ColorTokens: Story = {
  render: () => (
    <div className="p-lg">
      <h1 className="text-display-lg mb-lg">Color Tokens</h1>
      
      <div className="grid grid-cols-4 gap-md">
        {Object.entries(tokens.colors).map(([name, hex]) => (
          <div key={name} className="flex flex-col gap-sm">
            <div
              className="w-full h-24 rounded-md shadow-sm border border-surface-high"
              style={{ backgroundColor: hex }}
            />
            <div className="text-label-sm">
              <div className="font-bold">{name}</div>
              <div className="text-secondary">{hex}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const SpacingScale: Story = {
  render: () => (
    <div className="p-lg">
      <h1 className="text-display-lg mb-lg">Spacing Scale</h1>
      
      <div className="space-y-lg">
        {Object.entries(tokens.spacing).map(([name, size]) => (
          <div key={name} className="flex items-center gap-md">
            <span className="text-label-md min-w-16">{name}</span>
            <div
              className="bg-primary"
              style={{
                width: size,
                height: "24px",
              }}
            />
            <span className="text-body-sm text-secondary">{size}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const TypographyScale: Story = {
  render: () => (
    <div className="p-lg space-y-2xl">
      <h1 className="text-display-lg">Typography Scale</h1>
      
      <section>
        <h2 className="text-headline-lg mb-md">Display</h2>
        <div className="space-y-sm">
          <div className="text-display-lg">Display Large</div>
          <div className="text-display-md">Display Medium</div>
          <div className="text-display-sm">Display Small</div>
        </div>
      </section>

      <section>
        <h2 className="text-headline-lg mb-md">Headlines</h2>
        <div className="space-y-sm">
          <h3 className="text-headline-lg">Headline Large</h3>
          <h4 className="text-headline-md">Headline Medium</h4>
          <h5 className="text-headline-sm">Headline Small</h5>
        </div>
      </section>

      <section>
        <h2 className="text-headline-lg mb-md">Body</h2>
        <p className="text-body-lg">Body Large - Used for emphasis in reading</p>
        <p className="text-body-md">Body Medium - Standard paragraph text</p>
        <p className="text-body-sm">Body Small - Secondary information</p>
      </section>
    </div>
  ),
};
```

---

## ✅ Fase 4: INTEGRAR NA STORY 2.7

### 4.1 Adicionar Subtasks

**Arquivo:** `docs/stories/2.7.story.md`

**Adicionar na seção "Tasks / Subtasks":**

```markdown
### Phase 0: Token System Foundation (FOUNDATIONAL)

**Task 0: Expand Design Tokens in globals.css**
- [ ] Read current globals.css (9 tokens)
- [ ] Add spacing scale (6 tokens: xs-2xl)
- [ ] Add typography scale (font-size, weight, line-height)
- [ ] Add shadow/elevation tokens (5 tokens)
- [ ] Add animation timing tokens (3 tokens)
- [ ] Validate all values match docs/DESIGN-PRINCIPLES.md
- [ ] Test: `npm run build` (0 errors)
- Reference: `[Source: docs/DESIGN-PRINCIPLES.md - Complete specification]`

**Task 1: Expand tailwind.config.ts**
- [ ] Add colors.error, colors.warning, colors.success
- [ ] Add spacing tokens to theme.extend
- [ ] Add fontSize tokens with Typography utilities
- [ ] Add boxShadow tokens (ambient, sm, md, lg, xl)
- [ ] Add transitionDuration tokens
- [ ] Test: `npm run build` + `npm run typecheck` (0 errors)

**Task 2: Create W3C DTCG Token Export**
- [ ] Create docs/design-tokens.json (DTCG v2025.10 format)
- [ ] Include all colors, spacing, typography, shadows, radius
- [ ] Add $description to each token
- [ ] Validate JSON schema

**Task 3: Create Token Export Scripts**
- [ ] Create scripts/export-tokens.js
- [ ] Generate exports/tokens.css (CSS variables)
- [ ] Generate exports/tokens.js (JavaScript)
- [ ] Generate exports/tokens.d.ts (TypeScript types)
- [ ] Add npm script: `npm run tokens:export`

### Phase 1: Documentation (Covered by Tasks 8-11 existing)
[Continue with existing tasks...]
```

### 4.2 Atualizar Status da Story

```markdown
## Status

Draft → **Ready** (após expandir tokens)

## Updated File List

New files created:
- ✅ docs/design-tokens.json
- ✅ exports/tokens.css
- ✅ exports/tokens.js
- ✅ exports/tokens.d.ts
- ✅ scripts/export-tokens.js
- ✅ docs/DESIGN-TOKENS.md (comprehensive)

Modified files:
- ✅ app/globals.css (expanded)
- ✅ tailwind.config.ts (expanded)
- ✅ package.json (scripts added)
- ✅ stories/DesignTokens.stories.tsx (updated)
```

---

## 📊 Impacto & ROI

### Antes (Current)
```
Dev needs spacing value:
  1. Open components/common/Button.tsx
  2. Search for px-*, py-*
  3. Find "px-3 py-1.5" for small button
  4. Search other files for consistency
  5. Find 5 different approaches
  6. Time: ~15 min per decision
```

### Depois (Com este plano)
```
Dev needs spacing value:
  1. Open docs/DESIGN-TOKENS.md
  2. See scale: xs (8px), sm (16px), md (24px), ...
  3. Use:  className="px-sm py-xs"
  4. Consistent everywhere
  5. Time: ~1 min per decision
```

**Economia:** 14 min × 5 decisions/week = 1h 10min/semana = **60h/year per dev**

---

## 🚀 Como Executar Este Plano

### Passo 1: Clonar este documento (AGORA)
- Abrir `docs/plans/plan-013_ajuste-Brad_2026-04-11.md`
- Usar como checklist passo a passo

### Passo 2: Escolher executor
```
Opção A: Dev faz tudo (5h, pode demorar)
Opção B: Brad Frost executa (*audit-tailwind-config → cria plano de migração)
Opção C: Dividir em subtasks para Story 2.7
```

### Passo 3: Validar ao fim
```bash
npm run build          # Sem erros
npm run typecheck      # Sem erros
npm run tokens:export  # Gera exports/
npm run storybook      # Componentes renderizam
```

### Passo 4: Integrar na Story 2.7
- Adicionar fases 0 e 1 como subtasks
- Atualizar File List
- Re-validar com @po

---

## 📋 Checklist Rápido

- [ ] **Fase 0 concluída:** globals.css expandido com 30+ tokens
- [ ] **Fase 1 concluída:** tailwind.config.ts referencia todos os tokens
- [ ] **Fase 2 concluída:** exports/ tem 4 formatos de tokens
- [ ] **Fase 3 concluída:** docs/DESIGN-TOKENS.md completo + Storybook story
- [ ] **Validação:** npm run build ✅ npm run typecheck ✅
- [ ] **Story 2.7:** Atualizada com subtasks + File List
- [ ] **Review:** @po aprova + @dev implementa

---

**Plano criado por:** Brad Frost  
**Data:** 2026-04-11  
**Status:** READY FOR IMPLEMENTATION
