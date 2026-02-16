/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: {
          page: 'rgb(var(--bg-page) / <alpha-value>)',
          card: 'rgb(var(--bg-card) / <alpha-value>)',
          panel: 'rgb(var(--bg-panel) / <alpha-value>)',
        },
        surface: {
          1: 'rgb(var(--surface-1) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
          inverse: 'rgb(var(--text-inverse) / <alpha-value>)',
        },
        border: {
          soft: 'rgb(var(--border-soft) / <alpha-value>)',
          strong: 'rgb(var(--border-strong) / <alpha-value>)',
        },

        // CLAVE: color plano (no objeto) para bg-accent /60
        accent: 'rgb(var(--accent) / <alpha-value>)',
        accentHover: 'rgb(var(--accent-hover) / <alpha-value>)',
        accentContrast: 'rgb(var(--accent-contrast) / <alpha-value>)',

        status: {
          success: 'rgb(var(--status-success) / <alpha-value>)',
          danger: 'rgb(var(--status-danger) / <alpha-value>)',
          info: 'rgb(var(--status-info) / <alpha-value>)',
          warning: 'rgb(var(--status-warning) / <alpha-value>)',
        },
        decor: {
          olive: 'rgb(var(--olive-tint) / <alpha-value>)',
        },
      },

      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        card: 'var(--shadow-card)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
};
