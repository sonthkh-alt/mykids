import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * Theme phong cách Duolingo × Khan Academy Kids × Minecraft.
 * Đồng bộ màu với @ai-academy/ui tokens.
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#58CC02', dark: '#46A302', foreground: '#ffffff' },
        sky: { DEFAULT: '#1CB0F6', foreground: '#ffffff' },
        sun: { DEFAULT: '#FFC800', foreground: '#3C3C3C' },
        coral: { DEFAULT: '#FF4B4B', foreground: '#ffffff' },
        grape: { DEFAULT: '#CE82FF', foreground: '#ffffff' },
        ink: '#3C3C3C',
        cloud: '#F7F7F7',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Baloo 2', 'sans-serif'],
        body: ['var(--font-body)', 'Nunito', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        pop: '0 4px 0 0 rgba(0,0,0,0.12)',
        'pop-lg': '0 6px 0 0 rgba(0,0,0,0.15)',
      },
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        'bounce-in': 'bounce-in 0.4s ease-out',
        wiggle: 'wiggle 0.5s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
};

export default config;
