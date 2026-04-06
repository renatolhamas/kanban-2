"use client";

import dynamic from "next/dynamic";

/**
 * Dynamic import with ssr: false
 * Fixes useSearchParams() error during build
 * LoginPageContent uses useSearchParams() which requires client-side rendering
 */
const LoginPageContent = dynamic(
  () => import("@/components/LoginPageContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

export default function LoginPage() {
  return <LoginPageContent />;
}
