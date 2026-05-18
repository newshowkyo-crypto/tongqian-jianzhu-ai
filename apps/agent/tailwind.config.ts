import { tongqianTailwindPreset } from '@tongqian/ui/tailwind-preset';
import type { Config } from 'tailwindcss';

const config = {
  presets: [tongqianTailwindPreset],
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#f7f2ff',
          500: '#7c3aed',
          700: '#5b21b6',
        },
        steward: {
          start: '#1e5fbf',
          mid: '#7c3aed',
          end: '#d4953a',
        },
      },
      boxShadow: {
        steward: '0 12px 30px -18px rgb(124 58 237 / 0.6)',
      },
    },
  },
} satisfies Config;

export default config;
