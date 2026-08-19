/** @type {import('tailwindcss').Config} */
module.exports = {
  // El tema oscuro se activa con el atributo data-theme="oscuro" en el <html>,
  // que escribe el TemaService. Así las clases dark:* funcionan junto a las
  // variables CSS definidas en src/commons/estilos/tema.scss
  darkMode: ['selector', '[data-theme="oscuro"]'],
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        fonoPrimary: '#0284C7',
        fonoSecondary: '#14B8A6',
        fonoBg: '#F8FAFC',
        fonoText: '#334155'
      }
    },
  },
  plugins: [],
}
