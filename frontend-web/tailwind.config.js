const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Usa fontes nativas que são amigáveis para dislexia
        opendyslexic: ['"Comic Sans MS"', '"Trebuchet MS"', 'monospace', 'sans-serif'],
      }
    },
  },
  plugins: [
    plugin(function({ addVariant }) {
      addVariant('dyslexia', ':is(html.dislexia-mode) &')
    })
  ],
}