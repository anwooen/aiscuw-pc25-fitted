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
        'uw-purple': {
          DEFAULT: '#4b2e83',
          50: '#f5f3f9',
          100: '#e8e3f0',
          200: '#d4cbe3',
          300: '#b8a9cf',
          400: '#9882b8',
          500: '#7c5da1',
          600: '#6a4b89',
          700: '#4b2e83', // Main UW Purple
          800: '#3f2770',
          900: '#35215c',
        },
        'uw-gold': {
          DEFAULT: '#b7a57a',
          50: '#f9f8f5',
          100: '#f1ede3',
          200: '#e4dbc8',
          300: '#d4c5a6',
          400: '#c3ae88',
          500: '#b7a57a', // Main UW Gold
          600: '#a08f65',
          700: '#857655',
          800: '#6b6048',
          900: '#584f3c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
