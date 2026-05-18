import { tongqianTailwindPreset } from '@tongqian/ui/tailwind-preset';
import type { Config } from 'tailwindcss';

const config = {
  presets: [tongqianTailwindPreset],
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#f8fafc',
          500: '#64748b',
          700: '#334155',
        },
        primary: {
          700: '#12315f',
        },
      },
      fontSize: {
        sm: ['0.9375rem', { lineHeight: '1.375rem' }],
        base: ['1.0625rem', { lineHeight: '1.625rem' }],
      },
    },
  },
} satisfies Config;

export default config;
