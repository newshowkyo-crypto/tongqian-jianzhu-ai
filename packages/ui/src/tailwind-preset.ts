import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

import { designTokens } from './tokens.js';

export const tongqianTailwindPreset = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: designTokens.colors.primary,
        accent: designTokens.colors.accent,
        success: designTokens.colors.success,
        warning: designTokens.colors.warning,
        danger: designTokens.colors.danger,
        info: designTokens.colors.info,
        neutral: designTokens.colors.neutral,
      },
      borderRadius: {
        md: designTokens.radii.md,
        lg: designTokens.radii.lg,
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(24 24 27 / 0.06)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'PingFang SC',
          'Microsoft YaHei',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [animate],
} satisfies Partial<Config>;
