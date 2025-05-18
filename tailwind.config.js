module.exports = {
  darkMode: 'class', // enables class-based dark mode
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        background: '#1e293b', // slate-800
        surface: '#334155',    // slate-700
        text: '#e2e8f0',       // slate-200
        primary: '#0ea5e9',    // sky-500
      },
    },
  },
  plugins: [],
};
