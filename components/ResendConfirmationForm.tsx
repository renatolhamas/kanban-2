"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { isValidEmail } from "@/lib/auth";

export interface ResendConfirmationFormProps {
  onSuccess?: () => void;
  onError?: (error: string | null) => void;
}

export function ResendConfirmationForm({ onSuccess, onError }: ResendConfirmationFormProps) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailSendFailedMessage, setEmailSendFailedMessage] = useState<
    string | null
  >(null);

  // Check for email_send_failed error from registration flow
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const emailParam = searchParams.get("email");

    if (errorParam === "email_send_failed") {
      setEmailSendFailedMessage(
        "Please provide your email and request to resend the confirmation email.",
      );
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam));
      }
    }
  }, [searchParams]);

  // Validate email format
  const isValidInput = email && isValidEmail(email);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onError) onError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to resend confirmation email",
        );
      }

      // Success — show confirmation message
      setSuccess(true);
      setEmail(""); // Clear input
      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      if (onError) onError(errorMessage);
      console.error("Resend confirmation error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-green-800">
            ✅ Check your inbox for a new confirmation link. If you don&apos;t
            see it in a few minutes, check your spam folder.
          </p>
        </div>
        <div className="pt-2 text-center text-sm text-gray-500">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Persistent toast for email send failure (no auto-dismiss) */}
      {emailSendFailedMessage && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-300 p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-amber-800 font-semibold">
                Email Sending Issue
              </p>
              <p className="text-amber-700 text-sm mt-1">
                {emailSendFailedMessage}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEmailSendFailedMessage(null)}
            className="text-amber-600 hover:text-amber-800 flex-shrink-0"
            type="button"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleResend} className="space-y-5">
        {/* Email input */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 ml-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isValidInput || loading}
          className={`
            w-full py-3 rounded-xl font-bold text-white transition-all duration-300 transform active:scale-[0.98]
            ${
              isValidInput && !loading
                ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
            }
          `}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Sending...</span>
            </div>
          ) : (
            "Resend Confirmation"
          )}
        </button>

        {/* Back to login link */}
        <div className="pt-2 text-center text-sm text-gray-500">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </form>
    </>
  );
}
