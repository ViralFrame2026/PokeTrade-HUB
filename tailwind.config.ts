import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#070A12",
        foreground: "#F8FAFC",
        border: "rgba(255,255,255,0.12)",
        muted: "#94A3B8",
        pokemonBlue: "#2563EB",
        pokemonYellow: "#FACC15",
        panel: "rgba(15,23,42,0.74)"
      },
      boxShadow: {
        foil: "0 22px 90px rgba(37, 99, 235, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
