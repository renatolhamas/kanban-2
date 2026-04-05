import dynamic from "next/dynamic";

const ForgotPasswordPageContent = dynamic(
  () => import("@/components/ForgotPasswordPageContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageContent />;
}
