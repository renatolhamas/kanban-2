import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidEmail } from "@/lib/auth";
import { checkEmailLimit } from "@/lib/rate-limit";
import type { AuthResponse } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3017").replace(/\/$/, "");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing required environment variables for Supabase");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const body = await request.json();
    const { email } = body;

    // 1. Validate email format
    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      // 200 generic response prevents enumeration
      return NextResponse.json({ success: true, message: "If that email exists in our system, we've sent a password reset link." }, { status: 200 });
    }

    // 2. Rate limit
    const emailLimit = checkEmailLimit(email);
    if (!emailLimit.allowed) {
      console.warn(`[RATE_LIMIT] Email ${email} blocked: too many forgot-password attempts`);
      return NextResponse.json(
        { success: false, error: `Too many attempts. Try again in ${emailLimit.resetIn} seconds.` },
        { status: 429, headers: { "Retry-After": String(emailLimit.resetIn) } }
      );
    }

    // 3. Request reset password
    console.log(`[FORGOT_PASSWORD] Attempting reset for email: ${email}`);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/change-password`,
    });

    if (resetError) {
      console.error(`[FORGOT_PASSWORD] Failed for ${email}:`, resetError);
    } else {
      console.log(`[FORGOT_PASSWORD] ✅ Success for ${email}`);
    }

    // 4. Always return 200 to prevent enumeration
    return NextResponse.json({ success: true, message: "If that email exists in our system, we've sent a password reset link." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: false, error: "An error occurred. Please try again later." }, { status: 500 });
  }
}
