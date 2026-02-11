/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Flourish palette
        sage: {
          50: '#f4f7f4',
          100: '#e6ede5',
          200: '#cfdcce',
          300: '#a8c4a5',
          400: '#8BA888',
          500: '#6b8b68',
          600: '#547052',
          700: '#445a43',
          800: '#394a38',
          900: '#2f3d2f',
        },
        peach: {
          50: '#fdf6f3',
          100: '#fbeee8',
          200: '#f5d9cc',
          300: '#E8B4A0',
          400: '#d99a82',
          500: '#c67d62',
          600: '#b36549',
          700: '#95503b',
          800: '#7a4334',
          900: '#653a2f',
        },
        ivory: '#FFFEF7',
        forest: {
          50: '#f3f5f3',
          100: '#e4e8e4',
          200: '#c9d1c9',
          300: '#a3b0a3',
          400: '#7a8c7a',
          500: '#5f715f',
          600: '#4b5a4b',
          700: '#3e4a3e',
          800: '#2a3d30',
          900: '#1E2D24',
        },
        // Keep primary as alias to sage for compatibility
        primary: {
          50: '#f4f7f4',
          100: '#e6ede5',
          200: '#cfdcce',
          300: '#a8c4a5',
          400: '#8BA888',
          500: '#6b8b68',
          600: '#547052',
          700: '#445a43',
          800: '#394a38',
          900: '#2f3d2f',
        },
      },
      fontFamily: {
        'lora': ['var(--font-lora)', 'serif'],
        'work': ['var(--font-work-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
