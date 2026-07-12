/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0B0F19", // Ultra dark slate blue
          card: "rgba(17, 24, 39, 0.7)", // Semi-transparent gray-900
          navbar: "rgba(11, 15, 25, 0.8)",
        },
        brand: {
          blue: "#3B82F6",
          green: "#10B981",
          amber: "#F59E0B",
          red: "#EF4444",
          purple: "#8B5CF6",
          indigo: "#6366F1",
        },
        border: "rgba(255, 255, 255, 0.08)",
      },
      backdropBlur: {
        xs: "2px",
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
      boxShadow: {
        premium: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 15px rgba(59, 130, 246, 0.5)",
      }
    },
  },
  plugins: [],
}
