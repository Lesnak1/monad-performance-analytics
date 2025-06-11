/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        monad: {
          50: '#faf7ff',
          100: '#f4ecfe',
          200: '#eadcfe',
          300: '#d9c1fc',
          400: '#c298f8',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        cyber: {
          blue: '#00d4ff',
          purple: '#8b5cf6',
          pink: '#ec4899',
          green: '#10b981',
        }
      },
      backgroundImage: {
        'monad-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'cyber-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        'purple-burst': 'radial-gradient(circle at 50% 50%, #8b5cf6 0%, #3b0764 70%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          'from': {
            'box-shadow': '0 0 20px rgba(139, 92, 246, 0.7), 0 0 40px rgba(139, 92, 246, 0.3)',
          },
          'to': {
            'box-shadow': '0 0 30px rgba(139, 92, 246, 1), 0 0 60px rgba(139, 92, 246, 0.5)',
          },
        },
        'float': {
          '0%, 100%': { 'transform': 'translatey(0px)' },
          '50%': { 'transform': 'translatey(-20px)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'shimmer': {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
} 