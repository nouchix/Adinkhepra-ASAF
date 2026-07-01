/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'asaf-navy': '#0A0E1A',
        'asaf-dark': '#0D1117',
        'asaf-blue': '#4EAEF5',
        'asaf-blue-light': '#7BC8FF',
        'asaf-gold': '#D4AF37',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'asaf-gradient': 'linear-gradient(135deg, #0A0E1A 0%, #0D1B2E 50%, #0A0E1A 100%)',
        'blue-glow': 'radial-gradient(ellipse at 50% 0%, rgba(78,174,245,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'scan-line': 'scanLine 3s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scanLine: { '0%': { top: '0%' }, '100%': { top: '100%' } },
      },
    },
  },
  plugins: [],
}
