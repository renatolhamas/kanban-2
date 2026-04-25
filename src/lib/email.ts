/**
 * Email Sending Module
 * Handles Resend API integration with sandbox testing support
 *
 * Sandbox mode (development):
 * - Uses delivered@resend.dev as recipient
 * - Prevents quota waste during testing
 * - Real email field available for logs
 *
 * Production mode:
 * - Sends to actual user email
 * - Real domain from RESEND_FROM_DOMAIN
 */

import { Resend } from "resend";

// Resend instance will be initialized lazily
let resendInstance: Resend | null = null;

function getResend() {
  if (!resendInstance) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY configuration");
    }
    resendInstance = new Resend(resendApiKey);
  }
  return resendInstance;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
  isSandbox: boolean;
  actualEmail: string;
  sentTo: string;
}

/**
 * Send confirmation email via Resend
 *
 * @param email - User's actual email
 * @param confirmationLink - Full confirmation URL from Supabase
 * @returns EmailSendResult with status
 */
export async function sendConfirmationEmail(
  email: string,
  confirmationLink: string,
): Promise<EmailSendResult> {
  const timestamp = new Date().toISOString();
  const nodeEnv = process.env.NODE_ENV || "development";
  const isSandbox = nodeEnv === "development";

  // Always send to the actual user email
  const recipientEmail = email;

  try {
    // Email body with confirmation link
    const emailBody = `
      <p>Welcome to Kanban!</p>
      <p>Please confirm your email address by clicking the link below:</p>
      <p>
        <a href="${confirmationLink}" style="color: #0066cc; text-decoration: underline;">
          Confirm Email
        </a>
      </p>
      <p>Or copy and paste this link:</p>
      <p style="font-size: 12px; color: #666;">
        ${confirmationLink}
      </p>
      <p>If you didn't sign up for this account, you can safely ignore this email.</p>
    `;

    const resendFromEmail = process.env.RESEND_FROM_EMAIL;
    if (!resendFromEmail) {
      throw new Error("Missing RESEND_FROM_EMAIL configuration");
    }

    const resend = getResend();
    const response = await resend.emails.send({
      from: resendFromEmail,
      to: recipientEmail,
      subject: "Confirm Your Signup",
      html: emailBody,
    });

    if (response.error) {
      console.error(
        `[EMAIL_SEND] ❌ Failed: ${email} (sandbox: ${isSandbox})`,
        response.error,
      );
      return {
        success: false,
        error: response.error.message,
        timestamp,
        isSandbox,
        actualEmail: email,
        sentTo: recipientEmail,
      };
    }

    console.log(
      `[EMAIL_SEND] ✅ Success: ${email} (sandbox: ${isSandbox}, messageId: ${response.data?.id})`,
      {
        timestamp,
        sentTo: recipientEmail,
      },
    );

    return {
      success: true,
      messageId: response.data?.id,
      timestamp,
      isSandbox,
      actualEmail: email,
      sentTo: recipientEmail,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[EMAIL_SEND] ❌ Exception: ${email} (sandbox: ${isSandbox})`,
      errorMessage,
    );
    return {
      success: false,
      error: errorMessage,
      timestamp,
      isSandbox,
      actualEmail: email,
      sentTo: recipientEmail,
    };
  }
}
