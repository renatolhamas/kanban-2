const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    ".aiox-core/development/templates/", // Exclude framework templates from test suite
  ],
  testTimeout: 15000, // Increase timeout for I/O intensive tests (worktree operations, etc)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: ["lib/**/*.ts", "!**/*.test.ts", "!**/node_modules/**"],
  setupFiles: ["<rootDir>/jest.setup.js"],
};

module.exports = createJestConfig(customJestConfig);
