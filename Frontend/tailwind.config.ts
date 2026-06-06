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
          50: "hsl(220, 100%, 97%)",
          100: "hsl(220, 100%, 95%)",
          200: "hsl(220, 100%, 90%)",
          300: "hsl(220, 100%, 80%)",
          400: "hsl(220, 100%, 70%)",
          500: "hsl(220, 100%, 50%)",
          600: "hsl(220, 100%, 45%)",
          700: "hsl(220, 100%, 40%)",
          800: "hsl(220, 100%, 30%)",
          900: "hsl(220, 100%, 20%)",
        },
        secondary: {
          500: "hsl(180, 100%, 40%)",
        },
        accent: {
          500: "hsl(190, 100%, 45%)",
        },
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, hsl(180, 100%, 40%) 0%, hsl(220, 100%, 50%) 100%)",
        "gradient-secondary":
          "linear-gradient(135deg, hsl(190, 100%, 45%) 0%, hsl(230, 100%, 55%) 100%)",
        "gradient-accent":
          "linear-gradient(135deg, hsl(170, 100%, 40%) 0%, hsl(200, 100%, 50%) 100%)",
        "gradient-warm":
          "linear-gradient(135deg, hsl(200, 100%, 50%) 0%, hsl(240, 100%, 60%) 100%)",
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
        glow: "0 0 20px rgba(6, 182, 212, 0.4)",
        "glow-lg": "0 0 30px rgba(59, 130, 246, 0.5)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
  },
};

export default config;
