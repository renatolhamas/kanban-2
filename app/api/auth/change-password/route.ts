import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { AuthResponse } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      console.error("[CONFIG ERROR] Missing required environment variables for Supabase");
      return NextResponse.json(
        { success: false, error: "Authentication configuration error" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const body = await request.json();
    const { token, password, passwordConfirm } = body;

    // 1. Validation
    if (!token || typeof token !== "string") {
      return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });
    }

    if (password !== passwordConfirm) {
      return NextResponse.json({ success: false, error: "Passwords do not match" }, { status: 400 });
    }

    console.log(`[CHANGE_PASSWORD] Processing token and updating password`);

    let userId: string | null = null;
    const isJwt = token.length > 50 && token.includes(".");

    if (isJwt) {
      // Token is an access_token (from implicit flow)
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) {
        console.error("[CHANGE_PASSWORD] JWT validation failed:", userError);
        return NextResponse.json({ success: false, error: "Invalid or expired access token." }, { status: 400 });
      }
      userId = user.id;
    } else {
      // Token is a PKCE code or a token_hash
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(token);
      
      if (!sessionError && sessionData?.user) {
        // It was a valid PKCE code
        userId = sessionData.user.id;
      } else {
        // Fallback: it might be an implicit flow token_hash
        const { data: otpHack, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "recovery",
        });
        
        if (verifyError || !otpHack?.user) {
          console.error("[CHANGE_PASSWORD] Token verification failed:", verifyError);
          return NextResponse.json({ success: false, error: "Invalid or expired recovery token." }, { status: 400 });
        }
        userId = otpHack.user.id;
      }
    }

    if (!userId) {
        return NextResponse.json({ success: false, error: "Failed to identify user from the token." }, { status: 400 });
    }

    // 3. Update password using the Admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });

    if (updateError) {
      console.error("[CHANGE_PASSWORD] Password update failed for user:", userId, updateError);
      return NextResponse.json({ success: false, error: "Failed to update password." }, { status: 500 });
    }

    console.log(`[CHANGE_PASSWORD] ✅ Password successfully updated for user:`, userId);

    // 4. Return success
    return NextResponse.json({ success: true, message: "Password updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ success: false, error: "An error occurred. Please try again later." }, { status: 500 });
  }
}
