/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: { 50: '#ECFEFF', 100: '#CFFAFE', 200: '#A5F3FC', 300: '#67E8F0', 400: '#22D3EE', 500: '#06B6D4', 600: '#0891B2', 800: '#155E75' },
        fuchsia: { 50: '#FDF4FF', 200: '#F5D0FE', 600: '#C026D3' },
        serene: { 50: '#F0F4F8', 100: '#D9E2EC', 200: '#BCCCDC', 500: '#7896B9', 600: '#486581', 700: '#334E68', 800: '#243B53', 900: '#102A43' },
        sage: { 50: '#F3F6F4', 100: '#E2EBE5', 200: '#C7D8CE' },
        warm: { 50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 500: '#F97316', 600: '#EA580C', 700: '#C2410C', 800: '#9A3412', 900: '#7C2D12' }
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(0.9)', opacity: '0.7' },
          '50%': { transform: 'scale(1.1)', opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        teardrop: {
          '0%': { transform: 'scaleY(0)', opacity: '0' },
          '50%': { transform: 'scaleY(1)', opacity: '1' },
          '100%': { transform: 'scaleY(0) translateY(20px)', opacity: '0' }
        }
      },
      animation: {
        breathe: 'breathe 4s infinite ease-in-out',
        float: 'float 6s ease-in-out infinite',
        teardrop: 'teardrop 2s ease-in-out infinite'
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        serif: ['Poppins', 'serif']
      }
    },
  },
  plugins: [],
}
