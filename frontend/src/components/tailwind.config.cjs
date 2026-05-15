/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        georgia: ['Georgia', 'Times New Roman', 'Times', 'serif'],
      },
    },
  },
  plugins: [],
}
