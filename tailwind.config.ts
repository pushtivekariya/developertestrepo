import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Playfair Display', 'serif'],
        playfair: ['Playfair Display', 'serif'],
        caveat: ['Caveat', 'cursive'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "var(--color-primary, #1e3a5f)",
          foreground: "var(--color-primary-foreground, #FFFFFF)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary, #64748b)",
          foreground: "var(--color-secondary-foreground, #FFFFFF)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "var(--color-text-muted, #94a3b8)",
        },
        accent: {
          DEFAULT: "var(--color-accent, #2563eb)",
          foreground: "var(--color-accent-foreground, #FFFFFF)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Theme-aware colors (use CSS variables with fallbacks)
        'theme-bg': "var(--color-background, #FFFFFF)",
        'theme-bg-alt': "var(--color-background-alt, #f8fafc)",
        'theme-text': "var(--color-text-primary, #1e293b)",
        'theme-body': "var(--color-text-body, #475569)",
        'theme-muted': "var(--color-text-muted, #94a3b8)",
        
        // Card colors (use CSS variables with fallbacks)
        'card-bg': "var(--color-card-bg, #FFFFFF)",
        'card-border': "var(--color-card-border, #e2e8f0)",
        'card-badge-bg': "var(--color-card-badge-bg, #64748b)",
        'card-badge-text': "var(--color-card-badge-text, #FFFFFF)",
        'card-text': "var(--color-card-text-primary, #1e293b)",
        'card-text-secondary': "var(--color-card-text-secondary, #475569)",
        
        // Legacy color names (kept for backwards compatibility during migration)
        // TODO: Replace all usages with theme-aware classes, then remove these
        sand: '#FAF3E0',
        ocean: '#A7D8DE',
        coral: '#F76C5E',
        driftwood: '#5C4B51',
        navy: '#004080',
        coastal: {
          light: "#A7D8DE", 
          dark: "#004080",  
          sand: "#F9F3E0",  
          accent: "#F76C5E"  
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 0.25rem)",
        sm: "calc(var(--radius) - 0.5rem)",
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
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInLeft: {
          from: { 
            opacity: "0",
            transform: "translateX(-20px)",
          },
          to: { 
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        fadeInRight: {
          from: { 
            opacity: "0",
            transform: "translateX(20px)",
          },
          to: { 
            opacity: "1",
            transform: "translateX(0)",
          },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-in-left": "fadeInLeft 0.8s ease-out",
        "fade-in-right": "fadeInRight 0.8s ease-out"
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;

export default config;
