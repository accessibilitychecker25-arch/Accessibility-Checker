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
        'auburn-blue': '#003366', // Auburn University Navy Blue
        'auburn-orange': '#DD550C', // Auburn University Orange
        green: {
          400: '#22C55E', // Dark mode green
          500: '#16833E', // Light mode green
        },
        yellow: {
          50: '#FEFCE8',   // Default Tailwind yellow-50 - light yellow backgrounds
          400: '#EAB308',  // Dark mode yellow
          500: '#846506', // Light mode yellow
        },
      },
    },
  },
  plugins: [],
};
