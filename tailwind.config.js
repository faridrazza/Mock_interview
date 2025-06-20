/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
      },
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Custom colors for our app
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c1d7ff',
          300: '#a2c3ff',
          400: '#84aeff',
          500: '#6592ff',  // Primary brand color
          600: '#4a76e5',
          700: '#3d5ec4',
          800: '#354ba0',
          900: '#2e3c7e',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
        'slide-in-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-down': {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { 
            opacity: '1', 
            transform: 'scale(1)' 
          },
          '50%': { 
            opacity: '0.7', 
            transform: 'scale(1.05)' 
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'fade-in': 'fade-in 0.3s ease-in-out',
        'fade-out': 'fade-out 0.3s ease-in-out',
        'slide-in-right': 'slide-in-right 0.4s ease-in-out',
        'slide-out-right': 'slide-out-right 0.4s ease-in-out',
        'slide-in-up': 'slide-in-up 0.4s ease-out',
        'slide-in-down': 'slide-in-down 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: theme('colors.neutral.700'),
            a: {
              color: theme('colors.indigo.600'),
              '&:hover': {
                color: theme('colors.indigo.800'),
              },
            },
            h1: {
              color: theme('colors.neutral.900'),
              fontWeight: '700',
            },
            h2: {
              color: theme('colors.neutral.900'),
              fontWeight: '700',
            },
            h3: {
              color: theme('colors.neutral.900'),
              fontWeight: '600',
            },
            h4: {
              color: theme('colors.neutral.900'),
              fontWeight: '600',
            },
            code: {
              color: theme('colors.indigo.600'),
              backgroundColor: theme('colors.neutral.100'),
              borderRadius: theme('borderRadius.sm'),
              padding: `${theme('spacing.1')} ${theme('spacing.1.5')}`,
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              color: theme('colors.neutral.200'),
              backgroundColor: theme('colors.neutral.800'),
              borderRadius: theme('borderRadius.lg'),
              padding: theme('spacing.4'),
              border: 'none',
            },
            blockquote: {
              borderLeftColor: theme('colors.indigo.300'),
              fontStyle: 'italic',
              color: theme('colors.neutral.700'),
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.neutral.300'),
            a: {
              color: theme('colors.indigo.400'),
              '&:hover': {
                color: theme('colors.indigo.300'),
              },
            },
            h1: {
              color: theme('colors.neutral.100'),
            },
            h2: {
              color: theme('colors.neutral.100'),
            },
            h3: {
              color: theme('colors.neutral.100'),
            },
            h4: {
              color: theme('colors.neutral.100'),
            },
            code: {
              color: theme('colors.indigo.400'),
              backgroundColor: theme('colors.neutral.800'),
            },
            blockquote: {
              borderLeftColor: theme('colors.indigo.700'),
              color: theme('colors.neutral.300'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
} 