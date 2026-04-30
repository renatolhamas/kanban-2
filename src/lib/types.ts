/**
 * Auth Types — Request/Response shapes for authentication endpoints
 */

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface JWTPayload {
  sub: string; // User UUID from Supabase
  email?: string;
  app_metadata?: {
    tenant_id?: string;
    role?: string;
  };
  tenant_id?: string; // Fallback for transition
  role?: string; // Fallback for transition
  iat?: number; // Issued at (Unix timestamp)
  exp?: number; // Expiration (Unix timestamp)
}

export interface AuthContextUser {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member";
  tenant_id: string;
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Database Entity Types
 */

export interface Contact {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  wa_name?: string;
  is_group?: boolean;
  created_at: string;
  updated_at: string;
}
