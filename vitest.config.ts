import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local for tests

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
dotenv.config({
  path: path.resolve(process.cwd(), '.env.local')
});

export default defineConfig({
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  resolve: {
    alias: [
      { find: /^@\/src\/(.*)/, replacement: path.resolve(__dirname, 'src/$1') },
      { find: /^@\/app\/(.*)/, replacement: path.resolve(__dirname, 'app/$1') },
      { find: /^@\/lib\/(auth-pages|kanban|utils|format-utils)(.*)/, replacement: path.resolve(__dirname, 'src/lib/$1$2') },
      { find: /^@\/lib\/(.*)/, replacement: path.resolve(__dirname, 'lib/$1') },
      { find: /^@\/(.*)/, replacement: path.resolve(__dirname, 'src/$1') },
    ]
  },
  test: {
    env: {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
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
        // Match component test files (both root components/ and src/components/)
        include: ['components/**/*.test.tsx', 'components/**/*.test.ts', 'src/components/**/*.test.tsx', 'src/components/**/*.test.ts'],
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
    }]
  }
});