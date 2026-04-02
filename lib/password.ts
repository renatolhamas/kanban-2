import type { PasswordValidationResult } from "@/lib/types";

/**
 * Validate password against requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password) {
    return { valid: false, errors: ["Password is required"] };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one digit");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate password strength score (0-5)
 * Used for real-time feedback in UI
 */
export function getPasswordStrength(password: string): number {
  if (!password) return 0;

  let strength = 0;

  // Length bonus
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;

  // Character variety
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;

  return Math.min(strength, 5);
}

/**
 * Get human-readable password strength label
 */
export function getPasswordStrengthLabel(strength: number): string {
  const labels = ["Weak", "Fair", "Good", "Strong", "Very Strong", "Excellent"];
  return labels[Math.min(strength, 5)];
}
