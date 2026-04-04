"use client";

import { ResendConfirmationForm } from "@/components/ResendConfirmationForm";

export default function ResendConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="bg-blue-600 rounded-2xl p-3">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v4a1 1 0 001 1h3a1 1 0 011 1v6a2 2 0 01-2 2H7a2 2 0 01-2-2V3zm12 9h-2v-2h2v2z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-2">
          Resend Confirmation
        </h1>

        {/* Subtitle */}
        <p className="text-center text-gray-600 mb-8">
          Enter your email to receive a new confirmation link
        </p>

        {/* Form */}
        <ResendConfirmationForm />
      </div>
    </div>
  );
}
