import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PupCheck — AI-powered dog wellness",
    short_name: "PupCheck",
    description:
      "Scan, chat, and track your dog's health with an AI veterinary assistant.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F9F7F4",
    theme_color: "#0F6E56",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
