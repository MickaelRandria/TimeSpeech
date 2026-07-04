import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5A57FF',
          hover:   '#4744DD',
          light:   '#F0EFFE',
        },
        secondary: {
          DEFAULT: '#A5A3FF',
          hover:   '#8583E8',
          light:   '#F5F4FF',
        },
        surface: '#F5F4FF',  // ultra-soft lavender surface
        card:    '#ffffff',
        ink:     '#0f172a',
      },
      fontFamily: {
        sans: ['"Neue Haas Grotesk"', '"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        card:  '1.25rem',   // 20px — slightly rounder everywhere
        bento: '1.5rem',    // 24px — BentoCard
        btn:   '9999px',    // fully rounded buttons
        pill:  '9999px',
      },
      boxShadow: {
        card:  '0 8px 30px rgba(0,0,0,0.04)',
        bento: '0 8px 30px rgba(0,0,0,0.04)',
        modal: '0 20px 60px rgba(90,87,255,0.10), 0 4px 20px rgba(0,0,0,0.06)',
        glow:  '0 4px 20px rgba(90,87,255,0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config
