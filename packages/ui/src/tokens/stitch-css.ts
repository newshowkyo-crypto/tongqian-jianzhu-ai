import { stitchColors, stitchRounded, stitchShadows, stitchSpacing } from './stitch-tokens.js';

const toCssVars = (tokens: Record<string, string>, prefix: string): string =>
  Object.entries(tokens).map(([key, value]) => `  --stitch-${prefix}-${key}: ${value};`).join('\n');

export const stitchCssVariables = `:root {
${toCssVars(stitchColors, 'color')}
${toCssVars(stitchSpacing, 'space')}
${toCssVars(stitchRounded, 'radius')}
${toCssVars(stitchShadows, 'shadow')}
}

.dark {
  --stitch-color-surface: #191b22;
  --stitch-color-background: #191b22;
  --stitch-color-on-surface: #f0f0f9;
  --stitch-color-surface-container: #2e3037;
  --stitch-color-outline-variant: #424752;
}`;
