
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-main': '#0A0F1F',
        'card': '#131B2E',
        'neon-purple': '#9747FF',
        'neon-blue': '#009DFF',
        'neon-pink': '#FF2E90',
        'neon-green': '#00E676'
      },
    },
  },
  plugins: [],
};
