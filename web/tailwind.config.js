/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Blue-black theme palette
        ink: {
          950: "#05070f",
          900: "#080b18",
          850: "#0b1020",
          800: "#0f1629",
          700: "#151d38",
          600: "#1d2748",
          500: "#28345f",
        },
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b3cdff",
          300: "#82abff",
          400: "#4f83ff",
          500: "#2e5cff",
          600: "#1a40f0",
          700: "#1531c4",
          800: "#152b9c",
          900: "#162a7a",
        },
        accent: {
          cyan: "#38e1ff",
          teal: "#2dd4bf",
          violet: "#8b5cf6",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(46,92,255,0.25), 0 8px 40px -12px rgba(46,92,255,0.45)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(60rem 40rem at 15% -10%, rgba(46,92,255,0.18), transparent 60%), radial-gradient(50rem 40rem at 100% 0%, rgba(56,225,255,0.10), transparent 55%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
