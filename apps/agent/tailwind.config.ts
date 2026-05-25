import { tongqianTailwindPreset } from '@tongqian/ui/tailwind-preset';
import { stitchColors } from '@tongqian/ui/tokens';
import type { Config } from 'tailwindcss';

const config = {
  presets: [tongqianTailwindPreset],
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stitch: stitchColors,
        accent: {
          50: '#fff1ec',
          500: '#d99880',
          700: '#a14800',
        },
        steward: {
          start: '#1e5fbf',
          mid: '#d99880',
          end: '#a14800',
        },
      },
      boxShadow: {
        steward: '0 12px 30px -18px rgb(124 58 237 / 0.6)',
      },
    },
  },
} satisfies Config;

export default config;
