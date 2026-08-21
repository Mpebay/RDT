/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#08040C', // Fondo muy oscuro, casi violeta/negro
        darkCard: '#130B1C', // Un poco más claro para tarjetas
        brandOrange: '#FF5A00', // Naranja brillante del logo
        brandOrangeHover: '#E04E00',
        brandPurple: '#6D28D9', // Púrpura/Violeta para los resplandores del fondo
      }
    },
  },
  plugins: [],
}