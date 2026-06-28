import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:       "#000000",
        surface:  "#0c0c0c",
        surface2: "#141414",
        border:   "#1e1e1e",
        border2:  "#2a2a2a",
        muted:    "#555555",
        secondary:"#888888",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
