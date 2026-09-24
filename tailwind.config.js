/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        card: '#1e293b',
        primary: '#6366f1',
        'primary-hover': '#4f46e5',
        text: '#f8fafc',
        muted: '#94a3b8',
      }
    },
  },
  plugins: [],
}
