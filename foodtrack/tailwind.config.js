module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          protein: '#FF6B6B',
          carbs: '#FFB84D',
          fats: '#4D9FFF',
        },
        fontFamily: {
          sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
        },
        borderRadius: {
          '2xl': '1rem',
          '3xl': '1.5rem',
        },
        animation: {
          'slide-up': 'slideUp 300ms ease-out',
          'slide-in-right': 'slideInRight 200ms ease-out',
        },
        keyframes: {
          slideUp: {
            '0%': { transform: 'translateY(100%)' },
            '100%': { transform: 'translateY(0)' },
          },
          slideInRight: {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(0)' },
          },
        },
      },
    },
    plugins: [],
  }