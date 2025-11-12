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
          500: '#16833E', // Custom green shade
        },
        yellow: {
          50: '#FEFCE8',   // Default Tailwind yellow-50 - light yellow backgrounds
          400: '#FACC15',  // Default Tailwind yellow-400 - border accents
          500: '#846506', // Custom yellow shade for main yellow (badges, text)
        },
      },
    },
  },
  plugins: [],
};
