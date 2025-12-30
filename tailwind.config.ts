import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Soft Sage
        primary: {
          DEFAULT: '#88B09D',
          hover: '#769C8A',
          50: '#F4F8F6',
          100: '#D8E8E0',
          200: '#C1E1C1',
          300: '#A8D5BA',
          400: '#98C5A9',
          500: '#88B09D',
          600: '#769C8A',
          700: '#638775',
          800: '#506E60',
          900: '#3D554B',
        },

        // Backgrounds
        'bg-cream': '#FDFCF8',
        'bg-soft': '#F7F5F0',

        // Sunset to Ocean gradient palette (from logo)
        sunset: {
          50: '#FFF9F0',    // Lightest cream
          100: '#FFF4D6',   // Light peach
          200: '#FFE5B4',   // Soft peach
          300: '#FFD4A3',   // Peach
          400: '#FFB88C',   // Light coral
          500: '#FF9D76',   // Coral
          600: '#F4845F',   // Deep coral
          700: '#E66A47',   // Orange
          800: '#D55030',   // Deep orange
          900: '#C43A1A',   // Rich orange
        },
        ocean: {
          50: '#F0FDFB',    // Lightest aqua
          100: '#D4F8F0',   // Very light mint
          200: '#A8E6CF',   // Light mint
          300: '#7DDDC3',   // Mint
          400: '#6DD5C3',   // Turquoise
          500: '#4FB3D4',   // Ocean blue
          600: '#3B9FB5',   // Deep ocean
          700: '#2A8296',   // Deeper blue
          800: '#1D6678',   // Dark blue
          900: '#124A59',   // Very dark blue
        },

        // Pastel Accents
        pastel: {
          blue: '#A7C7E7',
          'blue-dark': '#89AECF',
          peach: '#FFD1BA',
          yellow: '#FDFD96',
          lavender: '#CDB4DB',
          sage: '#C1E1C1',
          rose: '#FFB7B2',
        },

        // Neutral backgrounds
        bg: {
          primary: '#FDFCFA',    // Warm off-white
          secondary: '#F8F7F4',  // Soft cream
          tertiary: '#F3F1ED',   // Light beige
        },
        // Card and surface colors
        surface: {
          DEFAULT: '#FFFFFF',
          white: '#FFFFFF',
          cream: '#FFFBF7',
          light: '#F9F8F6',
          border: '#E8E5E0',
          hover: '#F5F3EE',
        },
        // Text colors
        text: {
          main: '#2C3036',       // Soft Black
          primary: '#124A59',    // Deep ocean (main text)
          secondary: '#2A8296',  // Medium ocean
          muted: '#757B85',      // Warm Gray
          light: '#9CA3AF',      // Light gray
        },
        // Accent colors from gradient
        accent: {
          sunset: '#FF9D76',     // Sunset coral
          ocean: '#4FB3D4',      // Ocean blue
          mint: '#6DD5C3',       // Turquoise
          peach: '#FFD4A3',      // Soft peach
        },
        // Energy state colors (using gradient)
        energy: {
          low: '#FFD4A3',        // Soft peach (gentle, restful)
          medium: '#6DD5C3',     // Turquoise (balanced)
          high: '#FF9D76',       // Coral (energized)
        },
      },
      backgroundImage: {
        'gradient-sunset': 'linear-gradient(135deg, #FF9D76 0%, #FFD4A3 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #4FB3D4 0%, #6DD5C3 100%)',
        'gradient-flow': 'linear-gradient(135deg, #FF9D76 0%, #FFD4A3 25%, #A8E6CF 50%, #6DD5C3 75%, #4FB3D4 100%)',
        'gradient-sunset-ocean': 'linear-gradient(to bottom, #FFD4A3 0%, #FFFFFF 50%, #A8E6CF 100%)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Manrope', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(200, 200, 190, 0.25)',
        'soft-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        'glow-soft': '0 0 15px rgba(136, 176, 157, 0.2)',
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
        'full': '9999px',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
    },
  },
  plugins: [],
}

export default config
