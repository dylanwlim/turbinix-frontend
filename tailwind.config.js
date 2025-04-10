/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out both',
        pulse: 'pulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': {
            opacity: 1,
            textShadow: '0 0 5px #60a5fa, 0 0 10px #60a5fa',
          },
          '50%': {
            opacity: 0.7,
            textShadow: '0 0 15px #60a5fa, 0 0 25px #60a5fa',
          },
        },
      },
    },
  },
  plugins: [],
}
