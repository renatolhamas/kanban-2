"use client";

import { useState, useCallback } from "react";
import {
  getPasswordStrength,
  getPasswordStrengthLabel,
} from "@/lib/password";

interface PasswordInputProps {
  value: string;
  onChange: (_value: string) => void;
  showStrength?: boolean;
  error?: string;
  label?: string;
  placeholder?: string;
  showRequirements?: boolean;
  id?: string;
  name?: string;
  disabled?: boolean;
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
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Use provided id or fallback to a version of the label
  const inputId =
    id ||
    (label
      ? `password-${label.toLowerCase().replace(/\s+/g, "-")}`
      : "password-input");
  const inputName = name || inputId;

  const strength = getPasswordStrength(value);
  const strengthLabel = getPasswordStrengthLabel(strength);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const getStrengthColor = (s: number): string => {
    if (s === 0) return "bg-slate-300";
    if (s === 1) return "bg-red-500";
    if (s === 2) return "bg-orange-500";
    if (s === 3) return "bg-yellow-500";
    if (s === 4) return "bg-lime-500";
    return "bg-primary";
  };

  const getStrengthTextColor = (s: number): string => {
    if (s === 0) return "text-slate-600";
    if (s === 1) return "text-red-600";
    if (s === 2) return "text-orange-600";
    if (s === 3) return "text-yellow-600";
    if (s === 4) return "text-lime-600";
    return "text-primary";
  };

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-on-surface mb-1.5"
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
          disabled={disabled}
          className={`
            w-full px-4 py-2 text-base
            bg-white border-b-2
            border-slate-200 focus:border-primary
            rounded-lg
            transition-all duration-150
            font-manrope
            placeholder:text-slate-400
            focus:outline-none
            focus:ring-2 focus:ring-primary/20
            focus:shadow-sm
            disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error ? "border-red-500 focus:border-red-600 focus:ring-red-500/20" : ""}
          `}
          aria-describedby={error ? `${inputId}-description` : undefined}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors disabled:cursor-not-allowed"
          aria-label={showPassword ? "Hide password" : "Show password"}
          disabled={disabled}
        >
          {showPassword ? "👁️" : "👁️‍🗨️"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p
          id={`${inputId}-description`}
          className="mt-1 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {/* Password strength indicator */}
      {showStrength && value && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-on-surface/70 font-manrope">Strength:</span>
            <span
              className={`text-xs font-semibold ${getStrengthTextColor(strength)}`}
            >
              {strengthLabel}
            </span>
          </div>
          <div className="w-full bg-surface-low rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getStrengthColor(strength)}`}
              style={{ width: `${(strength / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements checklist */}
      {showRequirements && value && (
        <div className="mt-4 p-3 bg-surface-low rounded-lg border border-surface-high">
          <p className="text-xs font-semibold text-on-surface mb-2 font-manrope">
            Requirements:
          </p>
          <ul className="space-y-1 text-xs font-manrope">
            <li
              className={
                /^.{8,}$/.test(value) ? "text-primary" : "text-on-surface/50"
              }
            >
              <span className="mr-2">{/^.{8,}$/.test(value) ? "✓" : "○"}</span>
              At least 8 characters
            </li>
            <li
              className={
                /[A-Z]/.test(value) ? "text-primary" : "text-on-surface/50"
              }
            >
              <span className="mr-2">{/[A-Z]/.test(value) ? "✓" : "○"}</span>
              One uppercase letter
            </li>
            <li
              className={
                /[a-z]/.test(value) ? "text-primary" : "text-on-surface/50"
              }
            >
              <span className="mr-2">{/[a-z]/.test(value) ? "✓" : "○"}</span>
              One lowercase letter
            </li>
            <li
              className={
                /[0-9]/.test(value) ? "text-primary" : "text-on-surface/50"
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
