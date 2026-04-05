import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validatePassword } from "@/lib/password";
import { isValidEmail } from "@/lib/auth";
import type { RegisterRequest, AuthResponse } from "@/lib/types";
import { validateEnvironmentDomain } from "@/lib/env-validation";
import { checkIPLimit, checkEmailLimit, getClientIP } from "@/lib/rate-limit";
import { validateConfirmationLink } from "@/lib/link-validation";
import { sendConfirmationEmail } from "@/lib/email";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase credentials");
}

// Initialize Supabase admin client (service role)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * POST /api/auth/register
 * Register a new owner account and auto-create tenant
 * Sends confirmation email via Resend; user must confirm before login
 *
 * Body: { email, name, password }
 * Returns: 202 Accepted (no JWT) + email confirmation required
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<AuthResponse>> {
  try {
    // Validate environment on runtime (not at module load for Next.js build compatibility)
    try {
      validateEnvironmentDomain();
    } catch (error) {
      console.error("Environment validation failed:", error);
      throw error;
    }

    const clientIP = getClientIP(request.headers);
    const body: RegisterRequest = await request.json();
    const { email, name, password } = body;

    // STEP 1: Rate limit BEFORE input validation (prevents enumeration attacks)
    const ipLimit = checkIPLimit(clientIP);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many registration attempts. Please try again in ${ipLimit.resetIn} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(ipLimit.resetIn),
          },
        },
      );
    }

    const emailLimit = checkEmailLimit(email);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many registration attempts for this email. Please try again in ${emailLimit.resetIn} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(emailLimit.resetIn),
          },
        },
      );
    }

    // STEP 2: Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: "Email, name, and password are required" },
        { status: 400 },
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.errors.join("; ") },
        { status: 400 },
      );
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already in use. Try login instead." },
        { status: 400 },
      );
    }

    // STEP 3: Create Supabase Auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
      });

    if (authError || !authData.user) {
      console.error("Auth creation error:", authError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create account. Please try again.",
        },
        { status: 500 },
      );
    }

    const userId = authData.user.id;

    // STEP 4: Create tenant record
    const { data: tenantData, error: tenantError } = await supabase
      .from("tenants")
      .insert([{ name: `${name}'s Workspace` }])
      .select("id")
      .single();

    if (tenantError || !tenantData) {
      console.error("Tenant creation error:", tenantError);
      // Cleanup: delete auth user if tenant creation fails
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create workspace. Please try again.",
        },
        { status: 500 },
      );
    }

    const tenantId = tenantData.id;

    // Small delay to allow FK constraints to sync
    await new Promise((resolve) => setTimeout(resolve, 100));

    // STEP 5: Create owner user record
    console.log(
      `Creating user record: userId=${userId}, tenantId=${tenantId}, email=${email}`,
    );

    const { error: userError, data: userData } = await supabase
      .from("users")
      .insert([
        {
          id: userId,
          email,
          name,
          tenant_id: tenantId,
          role: "owner",
        },
      ])
      .select("id");

    if (userError) {
      console.error("User record creation error details:", {
        message: userError.message,
        code: userError.code,
        details: userError.details,
        hint: userError.hint,
      });
      // Cleanup: delete auth user and tenant if user record creation fails
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from("tenants").delete().eq("id", tenantId);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create user record. Please try again.",
          details:
            process.env.NODE_ENV === "development"
              ? userError.message
              : undefined,
        },
        { status: 500 },
      );
    }

    console.log("User record created successfully:", userData);

    // STEP 6: Generate confirmation link via admin.generateLink()
    // Note: generateLink API varies by SDK version; using type assertion for flexibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminAuth: any = supabase.auth.admin;
    const { data: linkData, error: linkError } = await adminAuth.generateLink({
      type: "signup",
      email: email,
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Link generation error:", linkError);
      // Log for debugging but don't block — link may still be valid
      console.warn(
        `[LINK_GENERATION] Failed but continuing: ${linkError?.message}`,
      );
    }

    const confirmationLink = linkData?.properties?.action_link || "";

    // STEP 7: Validate link format (robust URL parsing)
    if (confirmationLink) {
      const linkValidation = validateConfirmationLink(confirmationLink);
      if (!linkValidation.passed) {
        console.warn(
          `[LINK_VALIDATION] Link format issues detected:`,
          linkValidation.errors,
        );
        // Don't block — link may still be valid, log and continue
      }
    }

    // STEP 8: Send confirmation email via Resend
    const emailResult = await sendConfirmationEmail(email, confirmationLink);

    if (!emailResult.success) {
      console.error(`[EMAIL_SEND_FAILED] ${email}: ${emailResult.error}`);

      // STEP 9: Log email failure for audit (keep user/tenant alive)
      // User and tenant remain created so user can retry via /resend-confirmation
      try {
        await supabase.from("failed_registrations").insert([
          {
            email,
            created_resources: {
              auth_user: true,
              tenant: true,
              user_record: true,
            },
            cleanup_attempted: false,
            error_message: emailResult.error,
            notes: "Email send failed during registration. User kept alive for resend attempt.",
          },
        ]);
        console.log(`[AUDIT] Email send failure logged for ${email}`);
      } catch (auditError) {
        console.error("Failed to log audit entry:", auditError);
      }

      // STEP 10: Return success with email_send_failed flag
      // Frontend uses this to redirect to /resend-confirmation with appropriate message
      return NextResponse.json(
        {
          success: true,
          email_send_failed: true,
          message:
            "Account created but confirmation email could not be sent. Please use Resend Confirmation to try again.",
          redirect_to: "/resend-confirmation",
        },
        { status: 202 },
      );
    }

    // STEP 11: Success — Return 202 Accepted (no JWT)
    console.log(
      `[REGISTRATION_SUCCESS] User registered and confirmation email sent: ${email}`,
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Registration successful. Please check your email to confirm your address.",
      },
      { status: 202 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
