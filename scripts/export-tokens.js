#!/usr/bin/env node

/**
 * Token Export Script
 * Reads design tokens from docs/design-tokens.json and generates:
 * - exports/tokens.css (CSS custom properties)
 * - exports/tokens.js (JavaScript object)
 * - exports/tokens.d.ts (TypeScript type definitions)
 */

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const tokensSourcePath = path.join(projectRoot, "docs/design-tokens.json");
const exportsDir = path.join(projectRoot, "exports");

console.log("🎨 Token Export: Starting...");

// ============================================
// STEP 1: Load and validate source tokens
// ============================================

if (!fs.existsSync(tokensSourcePath)) {
  console.error(`❌ Error: Token source not found at ${tokensSourcePath}`);
  process.exit(1);
}

let tokensData;
try {
  const tokensContent = fs.readFileSync(tokensSourcePath, "utf-8");
  tokensData = JSON.parse(tokensContent);
  console.log("✅ Tokens loaded from docs/design-tokens.json");
} catch (err) {
  console.error(`❌ Error parsing tokens JSON: ${err.message}`);
  process.exit(1);
}

// ============================================
// STEP 2: Ensure exports directory exists
// ============================================

if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
  console.log(`✅ Created exports directory: ${exportsDir}`);
}

// ============================================
// STEP 3: Flatten token structure for exports
// ============================================

const flatTokens = {};

Object.entries(tokensData).forEach(([category, tokens]) => {
  if (category === "metadata" || category === "$schema") return;

  flatTokens[category] = {};
  Object.entries(tokens).forEach(([tokenKey, tokenValue]) => {
    if (typeof tokenValue === "object" && "$value" in tokenValue) {
      flatTokens[category][tokenKey] = tokenValue.$value;
    }
  });
});

console.log(`✅ Flattened token structure: ${Object.keys(flatTokens).length} categories`);

// ============================================
// STEP 4: Generate exports/tokens.css
// ============================================

const generateCSS = () => {
  const lines = [":root {"];

  Object.entries(flatTokens).forEach(([category, tokens]) => {
    lines.push(`  /* ${category} */`);
    Object.entries(tokens).forEach(([key, value]) => {
      const cssVarName = `--${category}-${key}`;
      lines.push(`  ${cssVarName}: ${value};`);
    });
    lines.push("");
  });

  lines.push("}");
  return lines.join("\n");
};

const cssContent = generateCSS();
const cssPath = path.join(exportsDir, "tokens.css");
fs.writeFileSync(cssPath, cssContent, "utf-8");
console.log(`✅ Generated: exports/tokens.css`);

// ============================================
// STEP 5: Generate exports/tokens.js
// ============================================

const generateJS = () => {
  const jsContent = `/**
 * Design Tokens (JavaScript Object)
 * Auto-generated from docs/design-tokens.json
 * Do not edit manually
 */

export const tokens = ${JSON.stringify(flatTokens, null, 2)};

export default tokens;
`;
  return jsContent;
};

const jsContent = generateJS();
const jsPath = path.join(exportsDir, "tokens.js");
fs.writeFileSync(jsPath, jsContent, "utf-8");
console.log(`✅ Generated: exports/tokens.js`);

// ============================================
// STEP 6: Generate exports/tokens.d.ts
// ============================================

const generateTypeScript = () => {
  const categories = Object.keys(flatTokens);

  // Build type definitions for each category
  const typeDefinitions = categories.map((category) => {
    const tokens = flatTokens[category];
    const keys = Object.keys(tokens);
    const typeLiteral = keys.map((k) => `  "${k}": string;`).join("\n");

    return `  ${category}: {\n${typeLiteral}\n  };`;
  });

  const tsContent = `/**
 * Design Tokens (TypeScript Type Definitions)
 * Auto-generated from docs/design-tokens.json
 * Do not edit manually
 */

export interface DesignTokens {
${typeDefinitions.join("\n")}
}

export const tokens: DesignTokens;
export default tokens;
`;
  return tsContent;
};

const tsContent = generateTypeScript();
const tsPath = path.join(exportsDir, "tokens.d.ts");
fs.writeFileSync(tsPath, tsContent, "utf-8");
console.log(`✅ Generated: exports/tokens.d.ts`);

// ============================================
// STEP 7: Summary
// ============================================

const totalTokens = Object.values(flatTokens).reduce(
  (sum, cat) => sum + Object.keys(cat).length,
  0
);

console.log("\n✨ Token Export Complete!");
console.log(`📊 Summary:`);
console.log(`   - Total tokens: ${totalTokens}`);
console.log(`   - Categories: ${Object.keys(flatTokens).length}`);
console.log(`   - Output files: 3 (CSS, JS, TS)`);
console.log(`\n📁 Files generated:`);
console.log(`   - exports/tokens.css`);
console.log(`   - exports/tokens.js`);
console.log(`   - exports/tokens.d.ts`);
