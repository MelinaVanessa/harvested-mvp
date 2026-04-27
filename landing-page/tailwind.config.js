/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand proportions: ~60 / 30 / 5 / 3 / 2
        creamy: '#FCFAF7', // Creamy Alabaster
        obsidian: '#0D1A15', // Obsidian Green
        olive: '#4A5D4E', // Olive Grove
        silver: '#C29901', // Silver Birch (spec showed #C2901 — use full hex)
        dusty: '#88887D', // Dusty Rose / Clay
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 22px 60px -18px rgba(13, 26, 21, 0.16)',
        card: '0 8px 30px -12px rgba(13, 26, 21, 0.1)',
      },
    },
  },
  plugins: [],
}
