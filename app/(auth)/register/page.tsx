"use client";

import dynamic from "next/dynamic";

const RegisterPageContent = dynamic(
  () => import("@/components/RegisterPageContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

export default function RegisterPage() {
  return <RegisterPageContent />;
}
