"use client";

import { useState } from "react";
import { FormError } from "./FormError";

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Consider form valid if both fields have content
  const isFormValid = email.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <FormError message={error} />}

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-700 ml-1"
        >
          Email Address
        </label>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
            disabled={loading}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-gray-700 ml-1"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
            disabled={loading}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!isFormValid || loading}
        className={`
          w-full py-3 rounded-xl font-bold text-white transition-all duration-300 transform active:scale-[0.98]
          ${
            isFormValid && !loading
              ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 cursor-pointer"
              : "bg-gray-300 cursor-not-allowed"
          }
        `}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>Signing in...</span>
          </div>
        ) : (
          "Login to Dashboard"
        )}
      </button>

      <div className="pt-2 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <a
          href="/register"
          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Create an account
        </a>
      </div>

      <div className="pt-2 text-center text-sm text-gray-500">
        Password issues:{" "}
        <a
          href="#"
          className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Change Password
        </a>
        {" "}or{" "}
        <a
          href="/resend-confirmation"
          className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Resend Email Confirmation
        </a>
      </div>
    </form>
  );
}
