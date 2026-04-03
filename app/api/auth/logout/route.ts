import { NextRequest, NextResponse } from "next/server";
import { clearJWTCookie } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * Clear JWT token and end session
 *
 * Returns: 200 with redirect to /login
 */
export async function POST(
  _request: NextRequest,
): Promise<NextResponse> {
  try {
    // Clear httpOnly cookie and redirect to login
    const response = NextResponse.redirect(new URL("/login", _request.url), {
      status: 302,
    });

    response.headers.set("Set-Cookie", clearJWTCookie());

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
