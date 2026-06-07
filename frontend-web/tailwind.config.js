/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- ISSO É OBRIGATÓRIO PARA O TEMA ESCURO FUNCIONAR
  theme: {
    extend: {
      fontFamily: {
        // Define a classe font-opendyslexic
        opendyslexic: ['OpenDyslexic', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}