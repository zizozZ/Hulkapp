/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hulk: {
          primary: '#39FF14',
          darkGreen: '#14532D',
          bg: '#090B0A',
          secondary: '#111713',
          card: '#1C2420',
          border: '#29352D',
          white: '#F5F7F5',
          gray: '#929B95',
          warning: '#FF9F1C',
          danger: '#FF4141',
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'Tajawal', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(57, 255, 20, 0.16)',
        'neon-strong': '0 0 28px rgba(57, 255, 20, 0.32)',
      },
    },
  },
  plugins: [],
};
