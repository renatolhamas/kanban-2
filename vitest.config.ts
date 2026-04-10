import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local for tests
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
dotenv.config({
  path: path.resolve(process.cwd(), '.env.local')
});
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  },
  test: {
    // Reporters
    reporters: ['verbose'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/fixtures/**', 'lib/**', '**/*.config.*', '**/*.stories.*']
    },
    projects: [{
      extends: true,
      test: {
        // Environment for DOM-based unit testing
        environment: 'jsdom',
        // Test globals (describe, it, expect without imports)
        globals: true,
        // Setup file for jest-dom matchers
        setupFiles: ['./tests/setup.ts'],
        // Timeout for tests
        testTimeout: 10000,
        // Match component test files
        include: ['components/**/*.test.tsx', 'components/**/*.test.ts'],
        // Mock reset between tests
        mockReset: true,
        restoreMocks: true
      }
    }, {
      extends: true,
      test: {
        // Environment for Node-based tests (RLS validation)
        environment: 'node',
        // Test globals (describe, it, expect without imports)
        globals: true,
        // Timeout for tests (RLS validation may take longer)
        testTimeout: 30000,
        // Match test files
        include: ['tests/**/*.test.ts'],
        // Mock reset between tests (important for RLS isolation)
        mockReset: true,
        restoreMocks: true
      }
    }, {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});