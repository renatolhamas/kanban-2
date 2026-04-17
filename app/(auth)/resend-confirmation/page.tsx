"use client";

import { useState } from "react";
import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Card } from "@/components/ui/molecules/card";

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(null);
  };

  const validateForm = (): boolean => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend confirmation email");
      }

      setSuccess(true);
      setEmail("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to resend confirmation email";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.trim().length > 0 && !emailError;

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {error && (
              <div
                className="p-3 bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/40 rounded-lg text-destructive dark:text-destructive/80 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm"
                role="alert"
              >
                Confirmation email sent! Check your inbox
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="name@company.com"
                disabled={loading || success}
                aria-describedby={emailError ? "email-error" : undefined}
              />
              {emailError && (
                <p
                  id="email-error"
                  role="alert"
                  className="mt-2 text-sm text-destructive"
                >
                  {emailError}
                </p>
              )}
            </div>

            {!success && (
              <Button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Send confirmation email"}
              </Button>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already confirmed?{" "}
                <a
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </a>
              </p>
            </div>
          </form>
      </Card>
    </div>
  );
}
