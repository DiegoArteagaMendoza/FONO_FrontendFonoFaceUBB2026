/** @type {import('tailwindcss').Config} */
module.exports = {
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
