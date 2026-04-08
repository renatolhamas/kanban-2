import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local for tests
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    // Environment for browser-like APIs
    environment: 'node',

    // Test globals (describe, it, expect without imports)
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/fixtures/**',
      ],
    },

    // Timeout for tests (RLS validation may take longer)
    testTimeout: 30000,

    // Reporters
    reporters: ['verbose'],

    // Match test files
    include: ['tests/**/*.test.ts'],

    // Mock reset between tests (important for RLS isolation)
    mockReset: true,
    restoreMocks: true,
  },
});
