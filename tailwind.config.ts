import type { Config } from 'tailwindcss';

/**
 * Blueprint - "cinematic black / warm-cool" design system.
 * True near-black base, hairline glass, restrained warm-amber (primary) +
 * cool steel-blue (secondary) directional light. Premium, not neon.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#08080A', // true near-black
          800: '#0C0C10',
          700: '#121218',
          600: '#1A1A22',
        },
        ink: {
          DEFAULT: '#ECEDF2', // primary text
          soft: '#9CA0AD', // secondary
          faint: '#62646F', // tertiary
        },
        amber: {
          DEFAULT: '#EE9B5B', // warm primary (the gauge)
          bright: '#FFBE86',
          deep: '#B86B30',
        },
        steel: {
          DEFAULT: '#6FA8E6', // cool secondary (the checkmark)
          bright: '#A6CEF4',
          deep: '#3E72C0',
        },
        rose: '#E8896B',
        danger: '#F0796A',
        ok: '#56C99A',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        glass:
          'inset 0 1px 0 0 rgba(255,255,255,0.05), 0 24px 60px -28px rgba(0,0,0,0.85), 0 8px 24px -18px rgba(0,0,0,0.7)',
        'glow-amber': '0 0 0 1px rgba(238,155,91,0.28), 0 12px 44px -10px rgba(238,155,91,0.4)',
        'glow-steel': '0 0 0 1px rgba(111,168,230,0.28), 0 12px 44px -10px rgba(111,168,230,0.36)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'caret-blink': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        'pulse-soft': { '0%,100%': { opacity: '0.5' }, '50%': { opacity: '1' } },
        breathe: {
          '0%,100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.05)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 320ms cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.8s infinite',
        caret: 'caret-blink 1s steps(1) infinite',
        'pulse-soft': 'pulse-soft 2.6s ease-in-out infinite',
        breathe: 'breathe 11s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
