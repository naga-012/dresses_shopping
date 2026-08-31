/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7fb',
          100: '#e4ebf5',
          200: '#cce0f2',
          300: '#99c2e5',
          400: '#66a3d8',
          500: '#1e3a8a', // Saha navy accent
          600: '#1e3478',
          700: '#1a2b61',
          800: '#16234d',
          900: '#0f172a'
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
