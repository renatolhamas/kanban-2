"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({
    currentPassword: null,
    newPassword: null,
    confirmPassword: null,
  });

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case "currentPassword":
        setCurrentPassword(value);
        break;
      case "newPassword":
        setNewPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
    }
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string | null> = {};

    if (!currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.values(errors).every((e) => e === null);
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
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to change password";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    Object.values(fieldErrors).every((e) => e === null);

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
                Password changed successfully!
              </div>
            )}

            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Current Password
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => handleFieldChange("currentPassword", e.target.value)}
                placeholder="Enter current password"
                disabled={loading}
                aria-describedby={
                  fieldErrors.currentPassword ? "currentPassword-error" : undefined
                }
              />
              {fieldErrors.currentPassword && (
                <p
                  id="currentPassword-error"
                  role="alert"
                  className="mt-2 text-sm text-destructive"
                >
                  {fieldErrors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-foreground mb-2"
              >
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => handleFieldChange("newPassword", e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                disabled={loading}
                aria-describedby={fieldErrors.newPassword ? "newPassword-error" : undefined}
              />
              {fieldErrors.newPassword && (
                <p
                  id="newPassword-error"
                  role="alert"
                  className="mt-2 text-sm text-destructive"
                >
                  {fieldErrors.newPassword}
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
                value={confirmPassword}
                onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                placeholder="Confirm new password"
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
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
      </Card>
    </div>
  );
}
