/** @type {import('tailwindcss').Config} */
import tokens from './src/tokens/tokens.tailwind.js';

export default {
  content: [
    './src/**/*.{ts,tsx,jsx,js}',
    './app/**/*.{ts,tsx,jsx,js}',
  ],
  theme: {
    extend: tokens,
  },
  plugins: [],
};
