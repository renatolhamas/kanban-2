"use client";

import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";
import { useToast } from "@/components/common/Toast";

export default function RegisterPageContent() {
  const router = useRouter();
  const { addToast } = useToast();

  const handleRegister = async (
    email: string,
    name: string,
    password: string,
  ) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name, password }),
        credentials: "include", // Send cookies
      });

      const data = await response.json();

      // Handle email send failure (keep user alive, redirect to resend-confirmation)
      if (data.email_send_failed) {
        router.push(
          `/resend-confirmation?error=email_send_failed&email=${encodeURIComponent(email)}`,
        );
        return;
      }

      if (!response.ok) {
        const errorMessage = data.error || "Registration failed";
        addToast(errorMessage, "error");
        throw new Error(errorMessage);
      }

      // Show success message and wait 2 seconds before redirect
      addToast("Account created! Please check your email to confirm.", "success", 2000);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed";
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-center text-4xl font-semibold text-on-surface tracking-tight font-manrope">
          Create your account
        </h1>
        <p className="mt-4 text-center text-base text-on-surface/70 font-manrope">
          Join Kanban to manage your boards
        </p>
      </div>

      {/* Form Container - Sheet on a Desk Pattern */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-lowest py-10 px-6 shadow-ambient rounded-lg">
          <RegisterForm onSubmit={handleRegister} />
        </div>
      </div>
    </div>
  );
}
