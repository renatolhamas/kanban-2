/**
 * Jest Setup File
 * Configure environment variables and global test settings
 */

// Required environment variables for tests
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "test_api_key_123";
process.env.RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "test@example.com";
process.env.NODE_ENV = process.env.NODE_ENV || "test";

// Suppress console output during tests (optional)
// jest.spyOn(console, "log").mockImplementation(() => {});
// jest.spyOn(console, "error").mockImplementation(() => {});
