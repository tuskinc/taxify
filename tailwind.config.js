/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        taxify: {
          primary: '#1E90FF',
          'primary-hover': '#1C7ED6',
          secondary: '#E0F0FF',
          'secondary-hover': '#D1E9FF',
          'light-blue': '#E6F3FF',
        },
        primary: {
          50: '#E6F3FF',
          100: '#E0F0FF',
          200: '#D1E9FF',
          300: '#B8DEFF',
          400: '#87CEFA',
          500: '#1E90FF',
          600: '#1C7ED6',
          700: '#1868B3',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-taxify': 'linear-gradient(to bottom, #FFFFFF 0%, #E6F3FF 100%)',
      },
    },
  },
  plugins: [],
}
