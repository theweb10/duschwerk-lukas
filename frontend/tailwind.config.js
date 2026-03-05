/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:    '#1F2E4A',
        navy:       '#2E4C7D',
        accent:     '#C62828',
        background: '#F2F2F2',
        text:       '#333333',
        silver:     '#DDDDDD',
      },
      fontFamily: {
        headline: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Helvetica Neue', 'Arial', 'sans-serif'],
        body:     ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
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
