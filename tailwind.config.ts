import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E6F4FE',
          100: '#C3E4FD',
          200: '#9BD2FC',
          300: '#72C0FB',
          400: '#4AAEF9',
          500: '#229CF8',
          600: '#067DDB',
          700: '#0560A8',
          800: '#034375',
          900: '#022642',
        },
        sudoku: {
          given: '#1A1A2E',
          player: '#229CF8',
          error: '#EF4444',
          highlight: 'rgba(34, 156, 248, 0.15)',
          selected: 'rgba(34, 156, 248, 0.3)',
          related: 'rgba(34, 156, 248, 0.08)',
          border: '#D1D5DB',
          'border-strong': '#374151',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
