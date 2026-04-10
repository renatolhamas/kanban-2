"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { PasswordInput } from "./PasswordInput";
import { validatePassword } from "@/lib/password";

interface RegisterFormProps {
  onSubmit?: (_email: string, _name: string, _password: string) => Promise<void>;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid =
    email &&
    name &&
    password &&
    confirmPassword &&
    passwordValidation.valid &&
    passwordsMatch &&
    !emailError &&
    !nameError &&
    !passwordError &&
    !confirmPasswordError;

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(null);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setNameError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(null);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setConfirmPasswordError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset all errors
    setEmailError(null);
    setNameError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    // Client-side validation
    let hasErrors = false;

    if (!email) {
      setEmailError("Email is required");
      hasErrors = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address");
        hasErrors = true;
      }
    }

    if (!name) {
      setNameError("Name is required");
      hasErrors = true;
    }

    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.errors[0] || "Invalid password");
      hasErrors = true;
    }

    if (!passwordsMatch) {
      setConfirmPasswordError("Passwords do not match");
      hasErrors = true;
    }

    if (hasErrors) return;

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(email, name, password);
        setEmail("");
        setName("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      // Error is handled by Toast in RegisterPageContent
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="email"
        type="email"
        label="Email"
        value={email}
        onChange={(e) => handleEmailChange(e.target.value)}
        placeholder="your@email.com"
        error={emailError || undefined}
        disabled={loading}
      />

      <Input
        id="name"
        type="text"
        label="Full Name"
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        placeholder="Your name"
        error={nameError || undefined}
        disabled={loading}
      />

      <PasswordInput
        id="password"
        name="password"
        value={password}
        onChange={handlePasswordChange}
        label="Password"
        showStrength={true}
        showRequirements={true}
        disabled={loading}
      />

      <Input
        id="confirmPassword"
        type="password"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(e) => handleConfirmPasswordChange(e.target.value)}
        placeholder="Confirm password"
        error={confirmPasswordError || undefined}
        disabled={loading}
      />

      <Button
        type="submit"
        variant={loading || !isFormValid ? "disabled" : "primary"}
        disabled={loading || !isFormValid}
        className="w-full py-3 text-base font-semibold flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Creating account..." : "Register"}
      </Button>

      <div className="flex items-center justify-center gap-2 text-sm">
        <span className="text-on-surface/70 font-manrope">Already have an account?</span>
        <Button
          variant="ghost"
          className="p-0 h-auto"
          onClick={() => (window.location.href = "/login")}
        >
          Sign in
        </Button>
      </div>
    </form>
  );
}
