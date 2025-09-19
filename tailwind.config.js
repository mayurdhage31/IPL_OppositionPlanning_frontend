/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'teal': {
          400: '#4fd1c7',
          500: '#38b2ac',
          600: '#319795',
        }
      }
    },
  },
  plugins: [],
}
