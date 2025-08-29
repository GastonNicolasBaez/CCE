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
        primary: {
          DEFAULT: '#002C6F',
          light: '#003A8F',
          dark: '#001F4F',
        },
        accent: {
          DEFAULT: '#FFA500',
          light: '#FFB733',
          dark: '#E69400',
        },
        white: '#FFFFFF',
        glass: 'rgba(255, 255, 255, 0.1)',
        'glass-dark': 'rgba(0, 44, 111, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neumorphism': '20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff',
        'neumorphism-inset': 'inset 20px 20px 60px #d1d9e6, inset -20px -20px 60px #ffffff',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
