import dynamic from "next/dynamic";

const ResendConfirmationPageContent = dynamic(
  () => import("@/components/ResendConfirmationPageContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

export default function ResendConfirmationPage() {
  return <ResendConfirmationPageContent />;
}
