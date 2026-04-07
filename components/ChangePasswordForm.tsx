"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface ChangePasswordFormProps {
  token: string | null;
  onSuccess?: () => void;
  onError?: (_error: string | null) => void;
}

export function ChangePasswordForm({ token, onSuccess, onError }: ChangePasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword;
  const isValidInput = isPasswordValid && doPasswordsMatch && token;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (onError) onError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, passwordConfirm: confirmPassword }),
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "Failed to update password";
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (_e) {
          // Keep default
        }
        throw new Error(errorMessage);
      }

      setSuccess(true);
      onSuccess?.();
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800 font-medium">Invalid or missing recovery token.</p>
        </div>
        <div className="pt-2 text-center text-sm text-gray-500">
          <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-green-800 font-medium whitespace-pre-wrap">
            ✅ Password successfully updated!{"\n"}Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleChangePassword} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 ml-1">
          New Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
        />
        {password.length > 0 && !isPasswordValid && (
          <p className="text-xs text-amber-600 ml-1 mt-1">Must be at least 8 characters</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 ml-1">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
        />
        {confirmPassword.length > 0 && !doPasswordsMatch && (
          <p className="text-xs text-red-500 ml-1 mt-1">Passwords do not match</p>
        )}
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
            <span>Updating...</span>
          </div>
        ) : (
          "Update Password"
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
