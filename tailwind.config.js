/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: '#FF6666',
          50: '#FFF0F0',
          100: '#FFE0E0',
          200: '#FFBABA',
          300: '#FF9999',
          400: '#FF8080',
          500: '#FF6666',
          600: '#E54D4D',
          700: '#CC3333',
        },
        maroon: {
          DEFAULT: '#713432',
          50: '#F5E8E7',
          100: '#E8CFCE',
          200: '#C99F9D',
          300: '#A96F6D',
          400: '#8A514F',
          500: '#713432',
          600: '#5A2927',
          700: '#431F1D',
        },
        cream: {
          DEFAULT: '#F3EED9',
          50: '#FDFCF7',
          100: '#FAF8EE',
          200: '#F7F3E4',
          300: '#F3EED9',
          400: '#EBE3BF',
          500: '#E2D8A5',
        },
        slate: {
          DEFAULT: '#798897',
          light: '#9AABB8',
          dark: '#5E6E7B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'ripple': 'ripple 2s ease-out infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pin-drop': 'pinDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'border-glow': 'borderGlow 1.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pinDrop: {
          '0%': { transform: 'translateY(-40px) scale(0.5)', opacity: '0' },
          '60%': { transform: 'translateY(4px) scale(1.05)', opacity: '1' },
          '80%': { transform: 'translateY(-2px) scale(0.98)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        borderGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
