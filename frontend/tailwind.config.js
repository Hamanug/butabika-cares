/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC', // slate-50
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#0F766E', // teal-700
          hover: '#115E59',   // teal-800
          light: '#CCFBF1',   // teal-50
        },
        muted: {
          DEFAULT: '#64748B', // slate-500
          light: '#F1F5F9',   // slate-100
        },
        destructive: {
          DEFAULT: '#E11D48', // rose-600 (calmer than pure red)
          light: '#FFE4E6',   // rose-50
        },
        border: '#E2E8F0',    // slate-200
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'], // Corrected from serif to sans-serif
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(0.9)', opacity: '0.7' },
          '50%': { transform: 'scale(1.1)', opacity: '1' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        breathe: 'breathe 6s infinite ease-in-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
