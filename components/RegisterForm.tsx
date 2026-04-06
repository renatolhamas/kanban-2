"use client";

import { useState } from "react";
import Link from "next/link";
import { PasswordInput } from "./PasswordInput";
import { validatePassword } from "@/lib/password";

interface RegisterFormProps {
  onSubmit?: (email: string, name: string, password: string) => Promise<void>;  
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid =
    email &&
    name &&
    password &&
    confirmPassword &&
    passwordValidation.valid &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!email) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!name) {
      setError("Name is required");
      return;
    }

    if (!passwordValidation.valid) {
      setError(passwordValidation.errors.join("; "));
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(email, name, password);
        setEmail("");
        setName("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-700 ml-1 mb-2"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-gray-700 ml-1 mb-2"
        >
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
          disabled={loading}
        />
      </div>

      <PasswordInput
        id="password"
        name="password"
        value={password}
        onChange={setPassword}
        label="Password"
        showStrength={true}
        showRequirements={true}
      />

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-semibold text-gray-700 ml-1 mb-2"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          className={`
            w-full px-4 py-2.5 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500
            ${!passwordsMatch && confirmPassword ? "border-red-500" : "border border-gray-200"}
          `}
          disabled={loading}
        />
        {!passwordsMatch && confirmPassword && (
          <p className="mt-2 text-sm text-red-600">Passwords do not match</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isFormValid || loading}
        className={`
          w-full py-3 rounded-xl font-bold transition-all duration-300 transform active:scale-[0.98]
          ${
            isFormValid && !loading
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 cursor-pointer"
              : "bg-gray-300 text-gray-700 cursor-not-allowed opacity-100"
          }
        `}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>Processing...</span>
          </div>
        ) : (
          "Register"
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
