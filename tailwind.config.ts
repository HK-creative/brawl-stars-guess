import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        'brawl-yellow': '#fdce36',
        'brawl-red': '#f64250',
        'brawl-green': '#47ce56',
        'brawl-blue': '#2d87f7',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        abraham: ['Abraham', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "card-reveal": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "60%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "heartbeat": {
          "0%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.1)" },
          "40%": { transform: "scale(1)" },
          "60%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" }
        },
        "heartbreak": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "10%": { transform: "scale(1.2)" },
          "20%": { transform: "scale(0.9)" },
          "30%": { transform: "scale(1.2)" },
          "40%": { transform: "scale(0.9)" },
          "50%": { transform: "scale(1.2)" },
          "60%": { transform: "rotate(0deg)" },
          "70%": { transform: "rotate(45deg) scale(0.9)" },
          "80%": { transform: "rotate(-45deg) scale(0.7)" },
          "90%": { transform: "rotate(20deg) scale(0.5)" },
          "100%": { transform: "rotate(0deg) scale(1)", opacity: "0.6" }
        },
        "gameoverPulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.4)" },
          "70%": { boxShadow: "0 0 0 15px rgba(239, 68, 68, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "card-reveal": "card-reveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "heartbeat": "heartbeat 1.5s ease-in-out infinite",
        "heartbreak": "heartbreak 2s ease-in-out forwards",
        "gameoverPulse": "gameoverPulse 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config
