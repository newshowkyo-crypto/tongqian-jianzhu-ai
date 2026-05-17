import { tongqianTailwindPreset } from '@tongqian/ui/tailwind-preset';
import type { Config } from 'tailwindcss';

const config = {
  presets: [tongqianTailwindPreset],
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
} satisfies Config;

export default config;
