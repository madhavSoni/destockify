/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sora)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
      colors: {
        blue: {
          50: '#EBF4FF',
          100: '#D6E9FF',
          200: '#B3D3FF',
          300: '#80B8FF',
          400: '#4D9DFF',
          500: '#0055FF',
          600: '#0055FF',
          700: '#0044CC',
          800: '#003399',
          900: '#002266',
        },
        accent: {
          blue: '#3388FF',
        },
        success: {
          DEFAULT: '#059669',
        },
        slate: {
          50: '#FAFBFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
    },
  },
  plugins: [],
}

