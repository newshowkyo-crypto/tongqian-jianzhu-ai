import { tongqianTailwindPreset } from '@tongqian/ui/tailwind-preset';
import type { Config } from 'tailwindcss';

const config = {
  presets: [tongqianTailwindPreset],
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#f4f4f5',
          500: '#52525b',
          700: '#27272a',
        },
      },
      spacing: {
        7: '1.75rem',
        9: '2.25rem',
        11: '2.75rem',
      },
      borderRadius: {
        lg: '0.375rem',
        xl: '0.5rem',
      },
    },
  },
} satisfies Config;

export default config;
