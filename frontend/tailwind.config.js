/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:    '#222222',
        accent:     '#C0C0C0',
        silver:     '#C0C0C0',
        background: '#F5F5F5',
        text:       '#222222',
      },
      fontFamily: {
        headline: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
        body:     ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight:   '-0.02em',
      },
      boxShadow: {
        'card':       '0 2px 12px 0 rgba(0,0,0,0.06)',
        'card-hover': '0 16px 40px 0 rgba(0,0,0,0.10)',
        'silver':     '0 6px 20px 0 rgba(192,192,192,0.45)',
        'glass':      '0 8px 32px 0 rgba(0,0,0,0.08)',
        'button':     '0 2px 8px 0 rgba(34,34,34,0.18)',
        'button-up':  '0 6px 20px 0 rgba(34,34,34,0.22)',
      },
      borderRadius: {
        'card': '12px',
        'btn':  '10px',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
}
