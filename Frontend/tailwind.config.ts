import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: {
          50: "hsl(240, 100%, 97%)",
          100: "hsl(240, 100%, 95%)",
          200: "hsl(240, 100%, 90%)",
          300: "hsl(240, 100%, 80%)",
          400: "hsl(240, 100%, 70%)",
          500: "hsl(240, 100%, 65%)",
          600: "hsl(240, 100%, 55%)",
          700: "hsl(240, 100%, 45%)",
          800: "hsl(240, 100%, 35%)",
          900: "hsl(240, 100%, 25%)",
        },
        secondary: {
          500: "hsl(280, 100%, 65%)",
        },
        accent: {
          500: "hsl(320, 100%, 65%)",
        },
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, hsl(240, 100%, 65%) 0%, hsl(280, 100%, 65%) 100%)",
        "gradient-secondary":
          "linear-gradient(135deg, hsl(280, 100%, 65%) 0%, hsl(320, 100%, 65%) 100%)",
        "gradient-accent":
          "linear-gradient(135deg, hsl(200, 100%, 60%) 0%, hsl(240, 100%, 65%) 100%)",
        "gradient-warm":
          "linear-gradient(135deg, hsl(340, 100%, 65%) 0%, hsl(30, 100%, 65%) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        glow: "glow 2s ease-in-out infinite",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(99, 102, 241, 0.4)",
        "glow-lg": "0 0 30px rgba(139, 92, 246, 0.5)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
  },
};

export default config;
