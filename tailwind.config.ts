import type { Config } from 'tailwindcss';

/**
 * Blueprint - "midnight glass / neon" design system.
 * OLED-dark base, frosted glass panels, electric violet + cyan accents.
 * (Synthesized from ui-ux-pro-max: Dark Mode OLED + minimal glow, monospace for code.)
 */
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#07070B', // OLED near-black
          800: '#0B0B12',
          700: '#10101A',
          600: '#161622',
        },
        ink: {
          DEFAULT: '#E8EAF5', // primary text
          soft: '#A6ABC4', // secondary text (>=3:1 on base)
          faint: '#71768F',
        },
        violet: {
          DEFAULT: '#8B5CF6',
          bright: '#A78BFA',
          deep: '#6D28D9',
        },
        cyan: {
          DEFAULT: '#22D3EE',
          bright: '#67E8F9',
        },
        magenta: '#E879F9',
        danger: '#F87171',
        ok: '#34D399',
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
        glass: '0 8px 40px -12px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.06)',
        'glow-violet': '0 0 0 1px rgba(139,92,246,0.4), 0 0 28px -4px rgba(139,92,246,0.55)',
        'glow-cyan': '0 0 0 1px rgba(34,211,238,0.4), 0 0 28px -4px rgba(34,211,238,0.5)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'caret-blink': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(0,-24px,0) scale(1.06)' },
        },
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(28px,16px,0) scale(1.08)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 320ms cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.6s infinite',
        caret: 'caret-blink 1s steps(1) infinite',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        float: 'float 14s ease-in-out infinite',
        drift: 'drift 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
