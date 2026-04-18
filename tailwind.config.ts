import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F6E56",
          dark: "#0B5542",
          light: "#1C8A6E",
        },
        accent: {
          DEFAULT: "#FF8C42",
          dark: "#E5712B",
        },
        cream: "#F9F7F4",
        severity: {
          green: "#22C55E",
          yellow: "#EAB308",
          red: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
