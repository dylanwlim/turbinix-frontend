// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#60a5fa',
          DEFAULT: '#3b82f6',
          dark: '#1e40af',
        },
        muted: {
          light: '#f3f4f6',
          DEFAULT: '#e5e7eb',
          dark: '#374151',
        },
      },
      animation: {
        'fade-in': 'fade-in 0.8s ease-out both',
        'fade-in-slow': 'fade-in 1.6s ease-out both',
        'paths': 'wave-path 12s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite', // Renamed original pulse
        'bounce-slow': 'bounce-slow 2s infinite', // Added slow bounce for arrow
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'wave-path': {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-10px)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-glow': { // Renamed from pulse
          '0%, 100%': {
            opacity: 1,
            textShadow: '0 0 5px #60a5fa, 0 0 10px #60a5fa',
          },
          '50%': {
            opacity: 0.7,
            textShadow: '0 0 15px #60a5fa, 0 0 25px #60a5fa',
          },
        },
        'bounce-slow': { // Slow bounce definition
          '0%, 100%': {
            transform: 'translateY(-15%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
