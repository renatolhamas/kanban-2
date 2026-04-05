import dynamic from "next/dynamic";

const ChangePasswordPageContent = dynamic(
  () => import("@/components/ChangePasswordPageContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

export default function ChangePasswordPage() {
  return <ChangePasswordPageContent />;
}
