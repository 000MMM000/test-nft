import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface:  "#0a0a0a",
        surface2: "#111111",
        border:   "rgba(255,255,255,0.06)",
        border2:  "rgba(255,255,255,0.12)",
        secondary:"rgba(255,255,255,0.45)",
        muted:    "rgba(255,255,255,0.2)",
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
