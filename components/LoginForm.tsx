"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

interface LoginFormProps {
  onSubmit?: (_email: string, _password: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Consider form valid if both fields have content and no errors
  const isFormValid =
    email.trim().length > 0 &&
    password.length > 0 &&
    !emailError &&
    !passwordError;

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setEmailError(null);
    setPasswordError(null);

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(email, password);
      }
    } catch {
      // Error is handled by Toast in LoginPageContent
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="email"
        type="email"
        label="Email Address"
        value={email}
        onChange={(e) => handleEmailChange(e.target.value)}
        placeholder="name@company.com"
        error={emailError || undefined}
        disabled={loading}
      />

      <Input
        id="password"
        type="password"
        label="Password"
        value={password}
        onChange={(e) => handlePasswordChange(e.target.value)}
        placeholder="••••••••"
        error={passwordError || undefined}
        disabled={loading}
      />

      <Button
        type="submit"
        variant={loading || !isFormValid ? "disabled" : "primary"}
        disabled={loading || !isFormValid}
        className="w-full py-3 text-base font-semibold flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="flex flex-col gap-3 text-sm text-on-surface/70 font-manrope">
        <div className="text-center">
          <span>Don&apos;t have an account?{" "}</span>
          <Button
            variant="ghost"
            className="p-0 h-auto"
            onClick={() => (window.location.href = "/register")}
          >
            Create one
          </Button>
        </div>

        <div className="text-center">
          <span>Password issues?{" "}</span>
          <Button
            variant="ghost"
            className="p-0 h-auto"
            onClick={() => (window.location.href = "/forgot-password")}
          >
            Reset password
          </Button>
        </div>
      </div>
    </form>
  );
}
