export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validatePassword } from "@/lib/password";
import { auth, AuthError } from "@/lib/middleware/auth";
import type { AuthResponse } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * GET /api/auth/profile
 * Get current user profile (requires valid JWT)
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<AuthResponse>> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("[CONFIG ERROR] Missing Supabase credentials in environment");
      return NextResponse.json(
        { success: false, error: "Authentication configuration error" },
        { status: 500 },
      );
    }

    const payload = await auth(request);
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch user profile
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, role")
      .eq("id", payload.sub)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Profile retrieved", data: user },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred. Please try again later." },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/auth/profile
 * Update user password (requires valid JWT)
 *
 * Body: { newPassword }
 */
export async function PUT(
  request: NextRequest,
): Promise<NextResponse<AuthResponse>> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("[CONFIG ERROR] Missing Supabase credentials in environment");
      return NextResponse.json(
        { success: false, error: "Authentication configuration error" },
        { status: 500 },
      );
    }

    const payload = await auth(request);
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const body = await request.json();
    const { newPassword } = body;

    // Validate input
    if (!newPassword) {
      return NextResponse.json(
        { success: false, error: "New password is required" },
        { status: 400 },
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.errors.join("; ") },
        { status: 400 },
      );
    }

    // Update Supabase Auth password
    const { error: authError } = await supabase.auth.admin.updateUserById(
      payload.sub,
      { password: newPassword },
    );

    if (authError) {
      console.error("Password update error:", authError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update password. Please try again.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
