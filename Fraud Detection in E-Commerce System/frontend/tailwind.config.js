/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#081421",
        mist: "#eef4f7",
        panel: "#f7fafc",
        accent: "#0f8b8d",
        warning: "#f59e0b",
        danger: "#e11d48",
        success: "#059669"
      },
      fontFamily: {
        sans: ["Manrope", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "Manrope", "sans-serif"]
      },
      boxShadow: {
        panel: "0 24px 60px rgba(8, 20, 33, 0.08)"
      }
    }
  },
  plugins: []
};
