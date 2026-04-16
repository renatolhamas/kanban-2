import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidEmail } from "@/lib/auth";
import { checkEmailLimit } from "@/lib/rate-limit";
import type { AuthResponse } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

/**
 * POST /api/auth/resend-confirmation
 * Resend confirmation email via Supabase Auth native method
 *
 * Body: { email }
 * Returns: 200 (always, even if email doesn't exist — prevents enumeration)
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<AuthResponse>> {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !appUrl) {
      console.error("[CONFIG ERROR] Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL");
      return NextResponse.json(
        { success: false, error: "Authentication configuration error" },
        { status: 500 },
      );
    }

    // Initialize Supabase client (anon key for Client API)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const body = await request.json();
    const { email } = body;

    // STEP 1: Validate email format
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      // Return 200 to prevent enumeration (don't reveal if email format is wrong)
      return NextResponse.json(
        {
          success: true,
          message:
            "If that email is associated with an account, we've sent a confirmation link.",
        },
        { status: 200 },
      );
    }

    // STEP 2: Rate limit by email (max 3 attempts per 60 minutes)
    const emailLimit = checkEmailLimit(email);
    if (!emailLimit.allowed) {
      console.warn(
        `[RATE_LIMIT] Email ${email} blocked: too many resend attempts`,
      );
      return NextResponse.json(
        {
          success: false,
          error: `Too many resend attempts. Try again in ${emailLimit.resetIn} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(emailLimit.resetIn),
          },
        },
      );
    }

    // STEP 3: Resend confirmation email via Supabase Auth native method
    console.log(
      `[RESEND_CONFIRMATION] Attempting resend for email: ${email}`,
    );

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${appUrl}/login?confirmed=true`,
      },
    });

    // STEP 4: Log result (regardless of outcome)
    if (resendError) {
      console.error(
        `[RESEND_CONFIRMATION] Failed for ${email}:`,
        resendError,
      );
    } else {
      console.log(`[RESEND_CONFIRMATION] ✅ Success for ${email}`);
    }

    // STEP 5: Always return 200 to prevent email enumeration
    // (User won't know if email exists or if resend actually worked)
    return NextResponse.json(
      {
        success: true,
        message:
          "If that email is associated with an account, we've sent a confirmation link.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Resend confirmation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred. Please try again later.",
      },
      { status: 500 },
    );
  }
}
