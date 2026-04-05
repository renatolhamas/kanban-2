"use client";

import { useState } from "react";
import { ResendConfirmationForm } from "@/components/ResendConfirmationForm";
import { Toast } from "@/components/Toast";

export default function ResendConfirmationPageContent() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = () => {
    setSuccessMessage("Confirmation email sent! Check your inbox.");
  };

  const handleError = (errorMessage: string | null) => {
    setError(errorMessage);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <svg
              className="w-7 h-7 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v4a1 1 0 001 1h3a1 1 0 011 1v6a2 2 0 01-2 2H7a2 2 0 01-2-2V3zm12 9h-2v-2h2v2z" />
            </svg>
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Resend Confirmation
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email to receive a new confirmation link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100">
          <ResendConfirmationForm onSuccess={handleSuccess} onError={handleError} />

          {error && (
            <div className="mt-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {successMessage && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
}
