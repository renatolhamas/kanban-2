import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/logout
 * Sign out and clear session cookies via Supabase SSR
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is logged in first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.auth.signOut();
      console.log(`[LOGOUT] User ${user.email} signed out successfully`);
    } else {
      console.log("[LOGOUT] No active session found to sign out");
    }

    // Determine response strategy
    const accept = request.headers.get("accept");
    
    // If it's a browser form submission, redirect to login
    if (accept?.includes("text/html")) {
      return NextResponse.redirect(new URL("/login?logout=success", request.url), {
        status: 303, // See Other - ensures GET redirect after POST
      });
    }

    // If it's a fetch call, return JSON
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("[LOGOUT ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
