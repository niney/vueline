/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'pretendard': ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        'sidebar': {
          DEFAULT: '#12151a',
          light: '#f8fafc',
        },
        'main-bg': {
          DEFAULT: '#1a1d23',
          light: '#f1f5f9',
        }
      }
    },
  },
  plugins: [],
}

