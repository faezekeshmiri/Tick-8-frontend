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
      colors: {
        primary: {
          DEFAULT: '#00B4D8',
          light: '#48CAE4',
          dark: '#0096C7',
          contrast: '#ffffff',
        },
        secondary: {
          DEFAULT: '#10b981',
          light: '#6ee7b7',
          dark: '#047857',
          contrast: '#ffffff',
        },
        error: {
          DEFAULT: '#c1121f',
        },
        background: {
          DEFAULT: '#fef9ef',
          dark: '#012A4A',
        },
      },
    },
  },
  plugins: [],
}

