/**
 * GET /api/auth/me
 * Returns authenticated user info if JWT cookie is valid.
 * Used by client components to check auth state without reading httpOnly cookies.
 *
 * Protected by: JWT auth middleware
 * Response: { authenticated: true, sub: string } | { authenticated: false }
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth, AuthError } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = await auth(request);
    return NextResponse.json({ authenticated: true, sub: payload.sub }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
