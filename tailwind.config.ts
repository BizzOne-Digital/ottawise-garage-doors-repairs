import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#102331", deep: "#0B2432" },
        gold: { DEFAULT: "#BF944F", dark: "#9E7637", champagne: "#CBA46B" },
        warm: "#FAF9F6",
        sand: "#F3EDE3",
        body: "#414854",
        line: "#E6E1D9",
      },
      fontFamily: { sans: ["var(--font-manrope)", "system-ui", "sans-serif"] },
      letterSpacing: { tightest: "-0.035em" },
      maxWidth: { site: "76rem" },
      boxShadow: { card: "0 1px 2px rgba(16,35,49,0.04), 0 4px 16px rgba(16,35,49,0.05)" },
    },
  },
  plugins: [],
} satisfies Config;
