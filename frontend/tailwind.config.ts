import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink:     "#020617",
        prussian:"#0F172A",
        deep:    "#082F49",
        frozen:  "#7DD3FC",
        alice:   "#E0F2FE",
        buy:     "#4caf78",
        sell:    "#e05c5c",
        hold:    "#e0b84c",
        blocked: "#5a5a6a",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        mono:    ["DM Mono", "monospace"],
        sans:    ["DM Sans", "sans-serif"],
      },
      animation: {
        "fade-up":   "fadeUp 600ms ease-out forwards",
        "pulse-dot": "pulseDot 1.2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.2" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
