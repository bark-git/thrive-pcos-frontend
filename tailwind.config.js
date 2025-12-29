/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f8',
          100: '#fde6f2',
          200: '#fccfe7',
          300: '#faa8d4',
          400: '#f772b8',
          500: '#ed4a9c',
          600: '#db2877',
          700: '#be1a5e',
          800: '#9d184d',
          900: '#831943',
        },
      },
    },
  },
  plugins: [],
}
