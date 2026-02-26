/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['IBM Plex Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        terminal: {
          bg: '#0a0a0a',
          fg: '#00ff41',
          dim: '#00aa2a',
          highlight: '#00ff41'
        }
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'cursor': 'cursor 1s step-end infinite'
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        },
        cursor: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: '#00ff41' }
        }
      }
    }
  },
  plugins: []
};
