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
        // NEW: Dark Fintech Palette
        bg: {
          primary: '#121212',
          secondary: '#1A1A1A',
          tertiary: '#252525',
        },
        surface: {
          DEFAULT: '#252525',
          hover: '#2D2D2D',
          active: '#333333',
        },
        border: {
          DEFAULT: '#333333',
          emphasis: '#404040',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0A0',
          tertiary: '#666666',
        },
        accent: {
          primary: '#00FFC2',
          'primary-hover': '#00E5B0',
          secondary: '#00E5FF',
          alert: '#FF4757',
          'alert-hover': '#FF3545',
          warning: '#FFAA00',
          success: '#00FF88',
          focus: '#BB86FC',
          // OLD: Keep for backwards compatibility
          DEFAULT: '#FFA500',
          light: '#FFB733',
          dark: '#E69400',
        },
        // OLD: Keep for backwards compatibility
        primary: {
          DEFAULT: '#002C6F',
          light: '#003A8F',
          dark: '#001F4F',
        },
        white: '#FFFFFF',
        glass: 'rgba(255, 255, 255, 0.1)',
        'glass-dark': 'rgba(0, 44, 111, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1.2', letterSpacing: '-0.05em' }],
        'display-mobile': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.05em' }],
        'h1': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        'h2': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        'h3': ['1.5rem', { lineHeight: '1.2' }],
        'h4': ['1.25rem', { lineHeight: '1.2' }],
      },
      boxShadow: {
        // NEW: Glow effects for fintech design
        'glow-primary': '0 0 20px rgba(0, 255, 194, 0.2)',
        'glow-primary-lg': '0 0 30px rgba(0, 255, 194, 0.3)',
        'glow-alert': '0 0 20px rgba(255, 71, 87, 0.2)',
        'glow-alert-lg': '0 0 30px rgba(255, 71, 87, 0.3)',
        'glow-focus': '0 0 0 3px rgba(0, 255, 194, 0.2)',
        'glow-focus-alert': '0 0 0 3px rgba(255, 71, 87, 0.2)',
        // OLD: Keep for backwards compatibility
        'neumorphism': '20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff',
        'neumorphism-inset': 'inset 20px 20px 60px #d1d9e6, inset -20px -20px 60px #ffffff',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      },
      borderRadius: {
        'sharp': '2px',
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
