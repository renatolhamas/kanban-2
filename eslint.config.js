// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [{
  ignores: ['node_modules/**', '.next/**', 'dist/**', 'build/**', '.aiox-core/**', 'squads/**', 'storybook-static/**']
}, {
  files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    },
    globals: {
      // Node.js globals
      __dirname: 'readonly',
      __filename: 'readonly',
      global: 'readonly',
      process: 'readonly',
      Buffer: 'readonly',
      // Browser globals
      window: 'readonly',
      document: 'readonly',
      navigator: 'readonly',
      location: 'readonly',
      // Jest globals
      describe: 'readonly',
      it: 'readonly',
      test: 'readonly',
      expect: 'readonly',
      beforeEach: 'readonly',
      afterEach: 'readonly',
      beforeAll: 'readonly',
      afterAll: 'readonly',
      jest: 'readonly'
    }
  },
  plugins: {
    '@typescript-eslint': tseslint.plugin
  },
  rules: {
    ...js.configs.recommended.rules,
    ...tseslint.configs.recommended[0].rules,
    ...tseslint.configs.recommended[1].rules,
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/no-require-imports': 'warn'
  }
}, {
  files: ['**/*.js', '**/*.jsx'],
  rules: {
    '@typescript-eslint/no-require-imports': 'off'
  }
}, // --- Produção: Rigor máximo (type-safety obrigatória)
{
  files: ['components/**/*.ts', 'components/**/*.tsx', 'lib/**/*.ts', 'app/**/*.ts', 'app/**/*.tsx', 'pages/**/*.ts', 'pages/**/*.tsx'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
  }
}, // --- Fixtures: Pragmatismo controlado (dados dinâmicos ephemeral)
{
  files: ['tests/fixtures/**/*.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
  }
}, // --- Testes de negócio: Rigor obrigatório (testes são código crítico)
{
  files: ['tests/**/*.test.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
  }
}, // --- Phase 4: Design System Enforcement
// Reminders to use design tokens (warnings, not errors - for guidance)
{
  files: ['src/components/ui/**/*.tsx'],
  rules: {
    // Design token guidance - will be enforced via PR review + CI/CD checks
    '@typescript-eslint/no-explicit-any': 'error'
  }
}, ...storybook.configs["flat/recommended"]];
