import animate from 'tailwindcss-animate';

import { designTokens } from './tokens.js';

type TailwindPresetConfig = {
  darkMode?: string[];
  plugins?: unknown[];
  theme?: Record<string, unknown>;
};

const fontFamily = Object.fromEntries(
  Object.entries(designTokens.typography.fontFamily).map(([key, value]) => [key, [...value]]),
) as Record<string, string[]>;

const fontSize = Object.fromEntries(
  Object.entries(designTokens.typography.fontSize).map(([key, [size, config]]) => [
    key,
    [size, { ...config }],
  ]),
) as Record<string, [string, { lineHeight: string }]>;

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
        ...designTokens.radius,
      },
      boxShadow: {
        ...designTokens.shadows,
      },
      fontFamily: {
        ...fontFamily,
      },
      fontSize: {
        ...fontSize,
      },
      fontWeight: {
        ...designTokens.typography.fontWeight,
      },
      spacing: {
        ...designTokens.spacing,
      },
    },
  },
  plugins: [animate],
} satisfies TailwindPresetConfig;
