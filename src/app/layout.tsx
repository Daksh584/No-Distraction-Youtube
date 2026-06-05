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
    <html lang="en" data-theme="light">
      <body>
        <div className="App">
          <AppHeader />
          <div className="container mx-auto mt-10">{children}</div>
        </div>
      </body>
    </html>
  );
}
