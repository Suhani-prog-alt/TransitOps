/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0f19', // Premium deep dark background
        darkCard: '#151d30', // Card background
        darkBorder: 'rgba(255, 255, 255, 0.08)',
        accentCyan: '#06b6d4', // Primary Cyan glow
        accentGreen: '#10b981', // Emerald highlights
        accentOrange: '#f97316', // Orange highlight
        accentRed: '#ef4444', // Red highlight
      },
      boxShadow: {
        glow: '0 0 20px rgba(6, 182, 212, 0.15)',
        glowGreen: '0 0 20px rgba(16, 185, 129, 0.15)',
      },
    },
  },
  plugins: [],
}
