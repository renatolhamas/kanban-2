/**
 * Auth Utilities (Legacy Cleaned)
 * Validation and light helpers. Cookie management moved to Supabase SSR.
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// NOTE: getJWTFromCookie, setJWTCookie and clearJWTCookie were removed. 
// Use Supabase SSR clients from lib/supabase/ for session management.
