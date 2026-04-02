import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validatePassword } from '@/lib/password'
import { isValidEmail } from '@/lib/auth'
import { generateJWT, setJWTCookie } from '@/lib/auth'
import type { RegisterRequest, AuthResponse } from '@/lib/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase credentials')
}

// Initialize Supabase admin client (service role)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

/**
 * POST /api/auth/register
 * Register a new owner account and auto-create tenant
 *
 * Body: { email, name, password }
 * Returns: JWT in httpOnly cookie + redirect to /settings/connection
 */
export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const body: RegisterRequest = await request.json()
    const { email, name, password } = body

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, name, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.errors.join('; ') },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already in use. Try login instead.' },
        { status: 400 }
      )
    }

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError)
      return NextResponse.json(
        { success: false, error: 'Failed to create account. Please try again.' },
        { status: 500 }
      )
    }

    const userId = authData.user.id

    // Create tenant record
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert([{ name: `${name}'s Workspace` }])
      .select('id')
      .single()

    if (tenantError || !tenantData) {
      console.error('Tenant creation error:', tenantError)
      // Cleanup: delete auth user if tenant creation fails
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { success: false, error: 'Failed to create workspace. Please try again.' },
        { status: 500 }
      )
    }

    const tenantId = tenantData.id

    // Small delay to allow FK constraints to sync (fixes race condition)
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Create owner user record with enhanced error handling
    console.log(`Creating user record: userId=${userId}, tenantId=${tenantId}, email=${email}`)

    const { error: userError, data: userData } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          name,
          tenant_id: tenantId,
          role: 'owner',
        },
      ])
      .select('id')

    if (userError) {
      console.error('User record creation error details:', {
        message: userError.message,
        code: userError.code,
        details: userError.details,
        hint: userError.hint,
      })
      // Cleanup: delete auth user and tenant if user record creation fails
      await supabase.auth.admin.deleteUser(userId)
      await supabase.from('tenants').delete().eq('id', tenantId)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create user record. Please try again.',
          details: process.env.NODE_ENV === 'development' ? userError.message : undefined,
        },
        { status: 500 }
      )
    }

    console.log('User record created successfully:', userData)

    // Generate JWT
    const token = await generateJWT({
      sub: userId,
      tenant_id: tenantId,
      email,
      role: 'owner',
    })

    // Create response with redirect
    const response = NextResponse.json(
      { success: true, message: 'Registration successful' },
      { status: 201 }
    )

    // Set httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production'
    response.headers.set('Set-Cookie', setJWTCookie(token, isProduction))

    // Set redirect header (client-side will handle)
    response.headers.set('X-Redirect-To', '/settings/connection')

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
