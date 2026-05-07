import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366f1',  // indigo-500
          dark:    '#4f46e5',  // indigo-600
          light:   '#818cf8',  // indigo-400
        },
        surface: {
          DEFAULT: '#0f0f0f',
          card:    '#1a1a1a',
          input:   '#242424',
          border:  '#2e2e2e',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
