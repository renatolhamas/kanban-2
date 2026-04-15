import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { ToastProvider } from "@/components/common/Toast";
import { RootLayout } from "@/components/layout/RootLayout";
import "./globals.css";
import { cn } from "@/lib/utils";

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
    <html lang="en" data-scroll-behavior="smooth" className={cn("font-sans", manrope.variable, inter.variable)} suppressHydrationWarning>
      <body className="font-inter">
        <ToastProvider>
          <RootLayout>
            {children}
          </RootLayout>
        </ToastProvider>
      </body>
    </html>
  );
}
