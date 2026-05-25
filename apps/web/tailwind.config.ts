import { tongqianTailwindPreset } from '@tongqian/ui/tailwind-preset';
import { stitchColors } from '@tongqian/ui/tokens';
import type { Config } from 'tailwindcss';

const config = {
  presets: [tongqianTailwindPreset],
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { stitch: stitchColors } } },
} satisfies Config;

export default config;
