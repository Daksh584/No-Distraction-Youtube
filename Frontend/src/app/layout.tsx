import type { Metadata } from "next";
import "./globals.css";
import AppHeader from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "EduTube - Distraction-Free YouTube Learning",
  description:
    "Experience YouTube without distractions. AI-powered chatbot, focused learning, and clutter-free video browsing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className="bg-base-100 text-base-content antialiased" suppressHydrationWarning>
        <div className="flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-1 w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
