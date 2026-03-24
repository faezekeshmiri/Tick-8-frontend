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
          'main-dark': '#38bdf8',
          'light-dark': '#7dd3fc',
          'dark-dark': '#0284c7',
          'contrast-dark': '#011627',
        },
        secondary: {
          DEFAULT: '#10b981',
          light: '#6ee7b7',
          dark: '#047857',
          contrast: '#ffffff',
          'main-dark': '#34d399',
          'light-dark': '#6ee7b7',
          'dark-dark': '#059669',
          'contrast-dark': '#011627',
        },
        error: {
          DEFAULT: '#c1121f',
          'main-dark': '#f87171',
        },
        background: {
          DEFAULT: '#fef9ef',
          'main-dark': '#011627',
          'paper-dark': '#012A4A',
        },
      },
    },
  },
  plugins: [],
}

