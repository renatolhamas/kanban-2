"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/atoms/button";
import { Input } from "@/components/ui/atoms/input";
import { Card } from "@/components/ui/molecules/card";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member";
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setUser(data.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!newPassword) {
      setError("New password is required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <div className="p-6 space-y-8">
            <h1 className="text-headline-md font-bold text-on-surface">Profile Settings</h1>

            {/* User Info Section */}
            <div className="pb-8 border-b border-border">
              <h2 className="text-headline-sm font-semibold mb-4 text-on-surface">Account Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Name
                  </label>
                  <p className="text-lg text-on-surface">{user.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Email
                  </label>
                  <p className="text-lg text-on-surface">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1" id="role-label">
                    Role
                  </label>
                  <p className="text-lg text-on-surface capitalize" aria-labelledby="role-label">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div>
              <h2 className="text-headline-sm font-semibold mb-4 text-on-surface">Change Password</h2>

              {success && (
                <div
                  className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg"
                  role="alert"
                >
                  <p className="text-primary font-semibold">
                    Password updated successfully!
                  </p>
                </div>
              )}

              <form
                onSubmit={handlePasswordChange}
                className="space-y-4 max-w-md"
              >
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-on-surface mb-2"
                  >
                    New Password
                  </label>
                  <Input
                    id="new-password"
                    name="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={saving}
                    error={!!error}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-on-surface mb-2"
                  >
                    Confirm Password
                  </label>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={saving}
                    error={confirmPassword !== "" && newPassword !== confirmPassword}
                    helperText={confirmPassword !== "" && newPassword !== confirmPassword ? "Passwords do not match" : undefined}
                  />
                </div>

                {error && (
                  <div
                    id="password-error"
                    role="alert"
                    className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium"
                  >
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword ||
                    saving
                  }
                  loading={saving}
                  className="w-full"
                >
                  Update Password
                </Button>
              </form>
            </div>

            {/* Logout Section */}
            <div className="pt-8 border-t border-color-on-surface-variant/10">
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
