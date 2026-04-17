"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Card } from "@/components/ui/molecules/card";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string | null> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.values(errors).every((e) => e === null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Redirect to login with success message
      router.push("/login?registered=true");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.email.length > 0 &&
    formData.password.length > 0 &&
    formData.confirmPassword.length > 0 &&
    Object.values(fieldErrors).every((e) => e === null);

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6"
          >
            {error && (
              <div
                className="p-3 bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/40 rounded-lg text-destructive dark:text-destructive/80 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="John Doe"
                disabled={loading}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
              />
              {fieldErrors.name && (
                <p
                  id="name-error"
                  role="alert"
                  className="mt-2 text-sm text-destructive"
                >
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="name@company.com"
                disabled={loading}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              {fieldErrors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="mt-2 text-sm text-destructive"
                >
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                placeholder="At least 8 characters"
                disabled={loading}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
              />
              {fieldErrors.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="mt-2 text-sm text-destructive"
                >
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleFieldChange("confirmPassword", e.target.value)
                }
                placeholder="Confirm password"
                disabled={loading}
                aria-describedby={
                  fieldErrors.confirmPassword ? "confirmPassword-error" : undefined
                }
              />
              {fieldErrors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  role="alert"
                  className="mt-2 text-sm text-destructive"
                >
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
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
