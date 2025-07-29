/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    './node_modules/@mui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
    },
  },
  plugins: [],
}

