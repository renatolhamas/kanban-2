import { NextRequest, NextResponse } from "next/server";
import { clearJWTCookie } from "@/lib/auth";
import type { AuthResponse } from "@/lib/types";

/**
 * POST /api/auth/logout
 * Clear JWT token and end session
 *
 * Returns: 200 with redirect to /login
 */
export async function POST(
  _request: NextRequest,
): Promise<NextResponse<AuthResponse>> {
  try {
    // Create response
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 },
    );

    // Clear httpOnly cookie
    response.headers.set("Set-Cookie", clearJWTCookie());

    // Set redirect header
    response.headers.set("X-Redirect-To", "/login");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
