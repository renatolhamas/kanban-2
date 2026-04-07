"use client";

import { useState } from "react";
import Link from "next/link";
import { isValidEmail } from "@/lib/auth";

export interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onError?: (_error: string | null) => void;
}

export function ForgotPasswordForm({ onSuccess, onError }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isValidInput = email && isValidEmail(email);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onError) onError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "Failed to send reset link";
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (_e) {
          // Keep default error message
        }
        throw new Error(errorMessage);
      }

      setSuccess(true);
      setEmail("");
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-green-800">
            ✅ If that email exists in our system, we&apos;ve sent a password reset link. Please check your inbox and spam folder.
          </p>
        </div>
        <div className="pt-2 text-center text-sm text-gray-500">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-5">
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
            <span>Sending link...</span>
          </div>
        ) : (
          "Send Reset Link"
        )}
      </button>

      <div className="pt-2 text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Back to Login
        </Link>
      </div>
    </form>
  );
}
