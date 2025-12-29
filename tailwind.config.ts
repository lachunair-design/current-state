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
        // Dark green theme - soft & organic
        primary: {
          50: '#f0fff4',
          100: '#c6f6d5',
          200: '#9ae6b4',
          300: '#68d391',
          400: '#48bb78',
          500: '#00FF00',  // Bright neon green
          600: '#00DD00',
          700: '#00BB00',
          800: '#009900',
          900: '#007700',
        },
        dark: {
          bg: '#0d1810',      // Very dark green-black background
          card: '#1a2620',    // Dark green for cards
          border: '#2d3d32',  // Subtle borders
          hover: '#243028',   // Hover state
        },
        accent: {
          green: '#00FF00',   // Neon green for high energy / positive actions
          amber: '#FBBF24',   // Warm amber for low energy / gentle guidance
        },
        text: {
          primary: '#FFFFFF',   // High contrast white
          secondary: '#D1D5DB', // Lighter gray for better readability
          muted: '#9CA3AF',     // Medium gray for subtle text
        },
        // Semantic colors for energy states
        energy: {
          low: '#FBBF24',      // Warm amber
          medium: '#48bb78',   // Mid-range green
          high: '#00FF00',     // Bright neon green
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        accent: ['Quicksand', 'Comfortaa', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
