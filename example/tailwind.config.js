/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F0F11',
        foreground: '#F2F2F2',
        primary: {
          DEFAULT: '#6A5ACD', // Purple color for Solana theme
          hover: '#7B68EE',
        },
        secondary: {
          DEFAULT: '#262630',
          hover: '#31313C',
        },
        accent: '#9945FF',
        muted: '#707070',
        card: {
          DEFAULT: '#1E1E24',
          hover: '#252530',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
