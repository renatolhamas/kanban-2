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
      <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <div className="p-6 space-y-8">
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>

            {/* User Info Section */}
            <div className="pb-8 border-b border-border">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Account Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Name
                  </label>
                  <p className="text-lg text-foreground">{user.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email
                  </label>
                  <p className="text-lg text-foreground">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Role
                  </label>
                  <p className="text-lg text-foreground capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">Change Password</h2>

              {success && (
                <div
                  className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg"
                  role="alert"
                >
                  <p className="text-green-700 dark:text-green-300 font-semibold">
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
                    className="block text-sm font-medium text-foreground mb-2"
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
                    aria-describedby={error ? "password-error" : undefined}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-foreground mb-2"
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
                    aria-describedby={
                      confirmPassword && newPassword !== confirmPassword
                        ? "confirm-error"
                        : undefined
                    }
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p
                      id="confirm-error"
                      role="alert"
                      className="mt-2 text-sm text-destructive"
                    >
                      Passwords do not match
                    </p>
                  )}
                </div>

                {error && (
                  <div
                    id="password-error"
                    role="alert"
                    className="p-3 bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/40 rounded-lg text-destructive dark:text-destructive/80 text-sm"
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
                  className="w-full"
                >
                  {saving ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </div>

            {/* Logout Section */}
            <div className="pt-8 border-t border-border">
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
