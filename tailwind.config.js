/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-red': '#b91c1c',
        'accent-green': '#34d399',
        'accent-burgundy': '#4a0404',
        'paper-cream': '#f2efe9',
        'bg-dark': '#080808',
        'bg-forest': '#022c22',
      },
      fontFamily: {
        'grotesk': ['"Space Grotesk"', 'sans-serif'],
        'serif-custom': ['"Crimson Text"', 'serif'],
        'marker': ['"Permanent Marker"', 'cursive'],
      }
    },
  },
  plugins: [],
}
