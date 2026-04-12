import type { Metadata } from "next";
import { Manrope, Geist } from "next/font/google";
import { ToastProvider } from "@/components/common/Toast";
import { RootLayout } from "@/components/layout/RootLayout";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Kanban App",
  description: "Multi-tenant Kanban board application",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className="font-sans">
        <ToastProvider>
          <RootLayout>
            {children}
          </RootLayout>
        </ToastProvider>
      </body>
    </html>
  );
}
