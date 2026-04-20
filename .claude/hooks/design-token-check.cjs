#!/usr/bin/env node

/**
 * Design Token Compliance Checker
 *
 * Validates that src/components/ uses design tokens instead of hardcoded colors.
 *
 * Usage:
 *   npm run check:tokens              # Check all components
 *   npm run check:tokens -- --fix     # Auto-fix some issues
 *
 * Exit codes:
 *   0 = All checks passed
 *   1 = Violations found
 */

const fs = require('fs');
const path = require('path');

const HARDCODED_PATTERNS = [
  // Hardcoded Tailwind colors
  { regex: /bg-(white|gray|blue|red|yellow|green|purple|pink|indigo|slate|cyan|lime|orange|amber|emerald|teal|sky|violet|fuchsia)-(\d+)/g, replacement: 'bg-primary or token', category: 'color' },
  { regex: /text-(white|black|gray|blue|red|yellow|green|purple|pink|indigo|slate|cyan|lime|orange|amber|emerald|teal|sky|violet|fuchsia)-(\d+)/g, replacement: 'text-text-primary or token', category: 'color' },
  { regex: /border-(white|gray|blue|red|yellow|green|purple|pink|indigo|slate|cyan|lime|orange|amber|emerald|teal|sky|violet|fuchsia)-(\d+)/g, replacement: 'border-surface-container-low', category: 'color' },
  { regex: /shadow-(sm|md|lg|xl)\b/g, replacement: 'shadow-ambient', category: 'shadow' },
];

const EXCEPTIONS = [
  '**/*.stories.tsx',
  '**/*.test.tsx',
  '**/__tests__/**',
  '**/__stories__/**',
];

function isException(filePath) {
  return filePath.includes('.test.') || 
         filePath.includes('.stories.') || 
         filePath.includes('__tests__') || 
         filePath.includes('__stories__');
}

function getFiles(dir, ext = ['.tsx', '.ts']) {
  let files = [];
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    
    // EXCEPTION BLINDING: Skip tests/stories at discovery level
    if (isException(fullPath)) return;

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && item !== 'node_modules' && item !== '.next' && item !== 'dist') {
      files = [...files, ...getFiles(fullPath, ext)];
    } else if (stat.isFile() && ext.some(e => fullPath.endsWith(e))) {
      files.push(fullPath);
    }
  });

  return files;
}

function checkFile(filePath) {
  if (isException(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];
  let lineNum = 1;

  content.split('\n').forEach(line => {
    HARDCODED_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(line)) !== null) {
        violations.push({
          file: filePath,
          line: lineNum,
          match: match[0],
          suggestion: pattern.replacement,
          category: pattern.category,
        });
      }
      // Reset regex
      pattern.regex.lastIndex = 0;
    });
    lineNum++;
  });

  return violations;
}

function main() {
  console.log('🎨 Design Token Compliance Check\n');

  const componentsDir = path.join(process.cwd(), 'src/components');
  const appDir = path.join(process.cwd(), 'app');

  if (!fs.existsSync(componentsDir)) {
    console.error('❌ src/components directory not found');
    process.exit(1);
  }

  const files = [...getFiles(componentsDir), ...getFiles(appDir)];
  let totalViolations = 0;
  const violations = {};

  files.forEach(file => {
    const fileViolations = checkFile(file);
    if (fileViolations.length > 0) {
      violations[file] = fileViolations;
      totalViolations += fileViolations.length;
    }
  });

  if (totalViolations === 0) {
    console.log('✅ All components comply with design token policy!\n');
    console.log(`📊 Scanned ${files.length} files - 0 violations\n`);
    process.exit(0);
  }

  // Report violations
  console.log(`❌ Found ${totalViolations} token violations in ${Object.keys(violations).length} files:\n`);

  Object.entries(violations).forEach(([file, fileViolations]) => {
    const relPath = path.relative(process.cwd(), file);
    console.log(`📄 ${relPath}`);

    fileViolations.forEach(v => {
      console.log(`   Line ${v.line}: "${v.match}" → use "${v.suggestion}"`);
    });
    console.log('');
  });

  console.log('\n📚 Reference: docs/design-system/ENFORCEMENT-GUIDE.md\n');

  // Summary by category
  const byCategory = {};
  Object.values(violations).flat().forEach(v => {
    byCategory[v.category] = (byCategory[v.category] || 0) + 1;
  });

  console.log('Summary:');
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });

  process.exit(1);
}

main();
