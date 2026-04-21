"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Card } from "@/components/ui/molecules/card";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user just registered (client-side only)
    if (searchParams.get("registered") === "true") {
      setError("A confirmation email has been sent to your address. Please check your inbox and click the link to verify your account before logging in.");
    }
  }, [searchParams]);

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
    setError(null);

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
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      // Redirect on success - AuthContext will detect the session change via onAuthStateChange
      router.push("/home");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    email.trim().length > 0 &&
    password.length > 0 &&
    !emailError &&
    !passwordError;

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6"
          >
            {error && (
              <div
                className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm font-medium"
                role="alert"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="name@company.com"
                disabled={loading}
                error={!!emailError}
                helperText={emailError || undefined}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-on-surface mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                error={!!passwordError}
                helperText={passwordError || undefined}
              />
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || loading}
              loading={loading}
              className="w-full"
            >
              Sign in
            </Button>

            <div className="text-center space-y-3">
              <p className="text-sm text-text-secondary">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Register
                </a>
              </p>
              <p className="text-sm text-text-secondary">
                Password Issues:{" "}
                <a
                  href="/forgot-password"
                  className="text-primary hover:underline font-medium"
                >
                  Change Password
                </a>
                {" "}or{" "}
                <a
                  href="/resend-confirmation"
                  className="text-primary hover:underline font-medium"
                >
                  Resend Confirmation Link
                </a>
              </p>
            </div>
          </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <p className="text-text-secondary">Loading...</p>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
