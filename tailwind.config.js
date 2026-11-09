/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kitty: {
          50: '#fff5f7',
          100: '#ffe4ec',
          200: '#fecddc',
          300: '#fea3c2',
          400: '#fb6f9c',
          500: '#f43f7a',
          600: '#e11d62',
          700: '#be1250',
          800: '#9d1345',
          900: '#83143d',
          ribbon: '#ff2d75',
          soft: '#fff0f5',
          candy: '#ff66a3',
          strawberry: '#ff3366',
        }
      },
      fontFamily: {
        sans: ['"Quicksand"', '"Inter"', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        }
      },
      animation: {
        'float-slow': 'float 3s ease-in-out infinite',
        'wiggle-slow': 'wiggle 1.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
