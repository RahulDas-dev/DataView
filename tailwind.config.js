/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["Poppins,Nunito, sans-serif"],
      },
      screens: {
        'sm': '360px',
      },
    },
  },
  plugins: [],
}

