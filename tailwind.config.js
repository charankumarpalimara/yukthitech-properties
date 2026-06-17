/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#023526',
          50: '#F0FDF4',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#023526',
          900: '#012319',
        },
        gold: {
          DEFAULT: '#C5A880',
          50: '#FAF8F5',
          100: '#F3EDE2',
          200: '#E7DBC5',
          300: '#DBC9A7',
          400: '#CFB88E',
          500: '#C5A880',
          600: '#B4966C',
          700: '#9C7F56',
          800: '#7E6542',
          900: '#604B30',
        },
        dark: {
          DEFAULT: '#2E353A',
          50: '#F1F3F4',
          100: '#D4D8DB',
          200: '#A9B1B7',
          300: '#7E8A93',
          400: '#53636F',
          500: '#2E353A',
          600: '#252B2F',
          700: '#1C2124',
          800: '#131719',
          900: '#0A0D0E',
        },
        surface: '#F8FAFC',
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        outfit: ['DM Sans', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px -1px rgba(0,0,0,0.08), 0 1px 4px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        sidebar: '4px 0 12px 0 rgba(0,0,0,0.06)',
      },
      fontSize: {
        '2xs': '0.65rem',
      },
      keyframes: {
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(-10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'shimmer-x': {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(320%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.45', transform: 'scale(0.85)' },
        },
      },
      animation: {
        'scale-in': 'scale-in 0.2s ease-out forwards',
        'shimmer-x': 'shimmer-x 1.1s ease-in-out infinite',
        'fade-in': 'fade-in 0.28s ease-out forwards',
        'pulse-dot': 'pulse-dot 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
