import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateJWT, setJWTCookie } from '@/lib/auth'
import type { LoginRequest, AuthResponse } from '@/lib/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials')
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * POST /api/auth/login
 * Authenticate user and issue JWT token
 *
 * Body: { email, password }
 * Returns: JWT in httpOnly cookie + redirect to /
 */
export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const body: LoginRequest = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      console.error('Auth error:', authError)
      // Generic message for security (don't reveal if user exists)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const userId = authData.user.id

    // Fetch user record to get tenant_id and role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      console.error('User fetch error:', userError)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const { tenant_id, role } = userData

    // Generate JWT
    const token = await generateJWT({
      sub: userId,
      tenant_id: tenant_id,
      email,
      role: role as 'owner' | 'admin' | 'member',
    })

    // Create response
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    )

    // Set httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production'
    response.headers.set('Set-Cookie', setJWTCookie(token, isProduction))

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
