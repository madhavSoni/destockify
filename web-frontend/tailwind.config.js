/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        blue: {
          50: '#EBF4FF',
          100: '#D6E9FF',
          200: '#B3D3FF',
          300: '#80B8FF',
          400: '#4D9DFF',
          500: '#3388FF',
          600: '#3388FF',
          700: '#2670E6',
          800: '#1A58CC',
          900: '#0D40B3',
        },
      },
    },
  },
  plugins: [],
}

