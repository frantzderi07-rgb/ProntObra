/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#d9e2ef',
          200: '#b3c5df',
          300: '#8da7cf',
          400: '#5d7eb5',
          500: '#3a5e98',
          600: '#2c4a7d',
          700: '#1f3a66',
          800: '#152a4f',
          900: '#0d1d38',
          950: '#071226',
        },
        orange: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc070',
          400: '#ff9a37',
          500: '#F97316',
          600: '#f05e06',
          700: '#c74707',
          800: '#9e380e',
          900: '#7e300f',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde58a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'logo-reveal': 'logoReveal 0.65s cubic-bezier(0.16, 1, 0.3, 1) both',
        'house-arc': 'houseArc 1.2s cubic-bezier(0.22, 1, 0.36, 1) both',
        'brand-letter': 'brandLetter 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
        'brand-slogan': 'brandSlogan 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        logoReveal: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '70%': { opacity: '1', transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        houseArc: {
          '0%': { opacity: '0', transform: 'translate(240px, -90px) rotate(24deg) scale(0.65)' },
          '55%': { opacity: '1', transform: 'translate(76px, -52px) rotate(10deg) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translate(0, 0) rotate(0) scale(1)' },
        },
        brandLetter: {
          '0%': { opacity: '0', transform: 'translateY(-28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        brandSlogan: {
          '0%': { opacity: '0', transform: 'translateY(-14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
