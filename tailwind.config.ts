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
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#6EE7B7',  // Vibrant teal-green accent
          500: '#34d399',
          600: '#10b981',
          700: '#059669',
          800: '#047857',
          900: '#065f46',
        },
        dark: {
          bg: '#1A201A',      // Deep dark forest green background
          card: '#243028',    // Slightly lighter for cards
          border: '#2d3d32',  // Subtle borders
          hover: '#2a362e',   // Hover state
        },
        accent: {
          green: '#6EE7B7',   // High energy / positive actions
          amber: '#FBBF24',   // Low energy / gentle guidance
        },
        text: {
          primary: '#FFFFFF',   // High contrast white
          secondary: '#A0AEC0', // Light gray for subtext
          muted: '#718096',     // Even more subtle text
        },
        // Semantic colors for energy states
        energy: {
          low: '#FBBF24',      // Warm amber
          medium: '#60D7A0',   // Mid-range green
          high: '#6EE7B7',     // Vibrant teal-green
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
