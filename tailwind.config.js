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
          DEFAULT: '#00B4D8',         // light mode main
          light: '#48CAE4',           // light mode light
          dark: '#0096C7',            // light mode dark
          contrast: '#ffffff',        // light mode contrastText
          'main-dark': '#90caf9',     // dark mode main
          'light-dark': '#a6d6ff',    // dark mode light (optional)
          'dark-dark': '#42a5f5',     // dark mode dark (optional)
          'contrast-dark': '#000000', // dark mode contrastText (optional)
        },
        secondary: {
          DEFAULT: '#10b981',
          light: '#6ee7b7',
          dark: '#047857',
          contrast: '#ffffff',
          'main-dark': '#80cbc4',
          'light-dark': '#b2fef7',
          'dark-dark': '#00867d',
          'contrast-dark': '#000000',
        },
        error: {
          DEFAULT: '#c1121f',
          'main-dark': '#ef9a9a',
        },
        background: {
          DEFAULT: '#fef9ef',         // light mode default
          'main-dark': '#012A4A',     // dark mode default
        },
      },
    },
  },
  plugins: [],
}

