"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { useToast } from "@/components/common/Toast";

export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  useEffect(() => {
    // Check if user just registered
    if (searchParams.get("registered") === "true") {
      addToast("Account created successfully! Please log in.", "success", 5000);
    }
  }, [searchParams, addToast]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Send cookies
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Login failed";
        addToast(errorMessage, "error");
        throw new Error(errorMessage);
      }

      // Show success message and redirect
      addToast("Login successful!", "success", 1500);
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      addToast(errorMessage, "error");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-12">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center shadow-ambient">
            <svg
              className="w-9 h-9 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-center text-4xl font-semibold text-on-surface tracking-tight font-manrope">
          Welcome back
        </h1>
        <p className="mt-4 text-center text-base text-on-surface/70 font-manrope">
          Sign in to your account to continue
        </p>
      </div>

      {/* Form Container - Sheet on a Desk Pattern */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-lowest py-10 px-6 shadow-ambient rounded-lg">
          <LoginForm onSubmit={handleLogin} />
        </div>
      </div>
    </div>
  );
}
