import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "base" = Sarooj Stone (canvas) / Falaj Ink (text) — named for the
        // limestone-and-earth palette of Omani architecture.
        base: {
          50: "#F2EEE4",
          900: "#1C231F",
        },
        // "accent" — near-black, used for primary buttons and CTAs.
        accent: {
          DEFAULT: "#17191A",
          light: "#33362F",
        },
        // Dune Gold — a secondary, more precious accent used sparingly for
        // price and premium touches, never for whole backgrounds.
        gold: {
          DEFAULT: "#B08D57",
          light: "#C9A879",
        },
        mist: "#8B9490",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 30px -8px rgba(28, 35, 31, 0.14)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "draw-line": {
          "0%": { strokeDashoffset: "1400" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "draw-line": "draw-line 2.2s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
