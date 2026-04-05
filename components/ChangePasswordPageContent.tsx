"use client";

import { useState, useEffect } from "react";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { Toast } from "@/components/Toast";

export default function ChangePasswordPageContent() {
  const [token, setToken] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new window.URLSearchParams(window.location.search);
    let foundToken = searchParams.get("token") || searchParams.get("code") || searchParams.get("access_token");
    
    if (!foundToken && window.location.hash) {
      const hashParams = new window.URLSearchParams(window.location.hash.substring(1));
      foundToken = hashParams.get("access_token") || hashParams.get("token_hash") || hashParams.get("code");
    }
    
    if (foundToken) {
      setToken(foundToken);
    }
  }, []);

  const handleSuccess = () => {
    setSuccessMessage("Password successfully updated!");
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
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Create New Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Set a new password for your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100">
          <ChangePasswordForm token={token} onSuccess={handleSuccess} onError={handleError} />

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
