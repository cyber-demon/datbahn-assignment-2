import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        databahn: {
          bg: "#F8FAFC",
          surface: "#FFFFFF",
          border: "#E2E8F0",
          accent: "#3B82F6",
          textPrimary: "#0F172A",
          textSecondary: "#64748B",
          textMuted: "#94A3B8",
          marginGreen: "#22C55E",
          marginYellow: "#EAB308",
          marginRed: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
