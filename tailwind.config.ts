import type { Config } from "tailwindcss";

// TTFL Store design tokens
// Palette named after the "forge" identity: graphite (trust/structure)
// + ember (energy/CTA) + verified green, kept restrained — no gradients,
// no glass, no neon. See DESIGN.md for rationale.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#12141A",
          900: "#1A1D24",
          800: "#262A34",
          700: "#3A3F4C",
          600: "#5B6472",
          400: "#8A93A3",
          200: "#D6DAE1",
        },
        cloud: {
          100: "#F5F6F8",
          50: "#FBFBFC",
        },
        ember: {
          700: "#B94A1F",
          600: "#E8622C",
          500: "#F0794A",
          100: "#FDE7DB",
        },
        verified: {
          700: "#166B45",
          600: "#1F9D63",
          100: "#DEF3E7",
        },
        gold: {
          600: "#B98A1F",
          100: "#F8EFD9",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
        tag: "4px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,20,26,0.04), 0 1px 1px rgba(18,20,26,0.03)",
        "card-hover": "0 8px 20px rgba(18,20,26,0.08)",
      },
      maxWidth: {
        shell: "1280px",
      },
    },
  },
  plugins: [],
};
export default config;
