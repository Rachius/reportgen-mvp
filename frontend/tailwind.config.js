export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: '#4EC7F5',
          light:   '#EAF7FE',
          dark:    '#1A9FD4',
          darker:  '#0E6B8F',
        },
        orange: {
          DEFAULT: '#FE7808',
          light:   '#FFF3EA',
          dark:    '#D45F00',
        },
      },
      borderRadius: {
        card:  '10px',
        btn:   '4px',
        input: '4px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'grad': 'linear-gradient(135deg, #4EC7F5, #FE7808)',
      },
    },
  },
  plugins: [],
}
