"use client";

import { useState } from "react";
import { PasswordInput } from "./PasswordInput";
import { FormError } from "./FormError";
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
  const [success, setSuccess] = useState(false);

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
        // Only set success if the submission didn't throw an error
        setSuccess(true);
        setEmail("");
        setName("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMsg);
      // Ensure success is false if any error occurred
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
        <p className="text-green-700 font-semibold">Registration successful!</p>
        <p className="text-sm text-green-600 mt-1">Redirecting to setup...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <FormError message={error} />}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="block text-sm font-medium text-gray-700 mb-2"
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
            w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
            ${!passwordsMatch && confirmPassword ? "border-red-500" : "border-gray-300"}
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
          w-full py-2 rounded-lg font-semibold text-white transition
          ${
            isFormValid && !loading
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
          }
        `}
      >
        {loading ? "Creating account..." : "Register"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          Login here
        </a>
      </p>
    </form>
  );
}
