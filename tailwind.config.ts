import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        sage: "#A8CABA",
        beige: "#F5F0E8",
        peach: "#F4C6A0",
        lavender: "#D7C9E8"
      },
      boxShadow: {
        soft: "0 16px 40px -20px rgba(90, 107, 95, 0.32)",
        insetGlow: "inset 0 1px 0 rgba(255,255,255,0.72), inset 0 -10px 24px rgba(168,202,186,0.22)"
      },
      borderRadius: {
        xl3: "1.75rem"
      },
      backgroundImage: {
        bloom: "radial-gradient(circle at top left, rgba(244,198,160,0.32), transparent 48%), radial-gradient(circle at 90% 20%, rgba(215,201,232,0.28), transparent 44%), radial-gradient(circle at 50% 90%, rgba(168,202,186,0.24), transparent 52%)"
      }
    }
  },
  plugins: []
};

export default config;
