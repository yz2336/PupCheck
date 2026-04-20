import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "PupCheck — AI-powered dog wellness",
  description:
    "Scan, chat, and track your dog's health with an AI veterinary assistant.",
  themeColor: "#0F6E56",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PupCheck",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('pupcheck-theme')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-cream pb-20 font-sans text-gray-900 md:pb-0">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
