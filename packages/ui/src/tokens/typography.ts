export const typography = {
  fontFamily: {
    mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
    sans: [
      'var(--font-sans)',
      'Inter',
      'PingFang SC',
      'Microsoft YaHei',
      'ui-sans-serif',
      'system-ui',
      'sans-serif',
    ],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
  },
  fontWeight: {
    bold: '700',
    medium: '500',
    semibold: '600',
  },
} as const;
