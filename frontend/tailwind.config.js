/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Cabinet Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        'dark-bg': '#050505',
        'dark-surface': '#121212',
        'light-bg': '#FAFAFA',
        'light-surface': '#FFFFFF',
        'border-dark': 'rgba(255,255,255,0.1)',
        'border-light': 'rgba(0,0,0,0.08)',
        'accent-neutral': '#888888',
      },
    },
  },
  plugins: [],
}
