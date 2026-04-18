import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "PupCheck — AI-powered dog wellness",
  description:
    "Scan, chat, and track your dog's health with an AI veterinary assistant.",
  themeColor: "#0F6E56",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream font-sans text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
