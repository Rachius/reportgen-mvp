export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
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
        card: '5px',
        btn:  '3px',
      },
    },
  },
  plugins: [],
}
