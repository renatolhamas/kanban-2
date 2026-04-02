/**
 * Auth Types — Request/Response shapes for authentication endpoints
 */

export interface RegisterRequest {
  email: string
  name: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  error?: string
}

export interface JWTPayload {
  sub: string // User UUID from Supabase
  tenant_id: string // Tenant UUID
  email: string
  role: 'owner' | 'admin' | 'member'
  iat: number // Issued at (Unix timestamp)
  exp: number // Expiration (Unix timestamp)
}

export interface AuthContextUser {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'member'
  tenant_id: string
}

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}
