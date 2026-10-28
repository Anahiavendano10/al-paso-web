/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          50: '#f4fce3',
          100: '#e6f7c1',
          400: '#a3e635',
          500: '#84cc16', // Verde Manzana Principal
          600: '#65a30d',
        }
      }
    },
  },
  plugins: [],
}