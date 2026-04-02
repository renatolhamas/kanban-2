"use client";

import { useState, useCallback } from "react";
import {
  validatePassword,
  getPasswordStrength,
  getPasswordStrengthLabel,
} from "@/lib/password";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  showStrength?: boolean;
  error?: string;
  label?: string;
  placeholder?: string;
  showRequirements?: boolean;
  id?: string;
  name?: string;
}

export function PasswordInput({
  value,
  onChange,
  showStrength = true,
  error,
  label = "Password",
  placeholder = "Enter password",
  showRequirements = true,
  id,
  name,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Use provided id or fallback to a version of the label
  const inputId =
    id ||
    (label
      ? `password-${label.toLowerCase().replace(/\s+/g, "-")}`
      : "password-input");
  const inputName = name || inputId;

  const validation = validatePassword(value);
  const strength = getPasswordStrength(value);
  const strengthLabel = getPasswordStrengthLabel(strength);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const getStrengthColor = (s: number): string => {
    if (s === 0) return "bg-gray-300";
    if (s === 1) return "bg-red-500";
    if (s === 2) return "bg-orange-500";
    if (s === 3) return "bg-yellow-500";
    if (s === 4) return "bg-lime-500";
    return "bg-green-500";
  };

  const getStrengthTextColor = (s: number): string => {
    if (s === 0) return "text-gray-600";
    if (s === 1) return "text-red-600";
    if (s === 2) return "text-orange-600";
    if (s === 3) return "text-yellow-600";
    if (s === 4) return "text-lime-600";
    return "text-green-600";
  };

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          name={inputName}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? "border-red-500" : validation.valid && value ? "border-green-500" : "border-gray-300"}
          `}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? "👁️" : "👁️‍🗨️"}
        </button>
      </div>

      {/* Error message */}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {/* Password strength indicator */}
      {showStrength && value && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">Strength:</span>
            <span
              className={`text-xs font-semibold ${getStrengthTextColor(strength)}`}
            >
              {strengthLabel}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getStrengthColor(strength)}`}
              style={{ width: `${(strength / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements checklist */}
      {showRequirements && value && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Requirements:
          </p>
          <ul className="space-y-1 text-xs">
            <li
              className={
                /^.{8,}$/.test(value) ? "text-green-600" : "text-gray-500"
              }
            >
              <span className="mr-2">{/^.{8,}$/.test(value) ? "✓" : "○"}</span>
              At least 8 characters
            </li>
            <li
              className={
                /[A-Z]/.test(value) ? "text-green-600" : "text-gray-500"
              }
            >
              <span className="mr-2">{/[A-Z]/.test(value) ? "✓" : "○"}</span>
              One uppercase letter
            </li>
            <li
              className={
                /[a-z]/.test(value) ? "text-green-600" : "text-gray-500"
              }
            >
              <span className="mr-2">{/[a-z]/.test(value) ? "✓" : "○"}</span>
              One lowercase letter
            </li>
            <li
              className={
                /[0-9]/.test(value) ? "text-green-600" : "text-gray-500"
              }
            >
              <span className="mr-2">{/[0-9]/.test(value) ? "✓" : "○"}</span>
              One digit (0-9)
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
