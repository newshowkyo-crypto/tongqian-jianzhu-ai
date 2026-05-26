'use client';

import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

interface AiDisclaimerProps {
  className?: string;
  customText?: ReactNode;
  variant?: 'banner' | 'footer' | 'inline';
}

const DEFAULT_TEXT = 'AI also can make mistakes. Please verify important information.';

export function AiDisclaimer({ className, customText, variant = 'inline' }: AiDisclaimerProps): JSX.Element {
  const baseClasses = 'flex items-center gap-2 text-xs text-on-surface-variant';
  const variantClasses = {
    banner: 'my-3 rounded-md bg-surface-container-low px-3 py-2',
    footer: 'mt-4 border-t border-outline-variant pt-3',
    inline: 'mt-2',
  }[variant];

  return (
    <div aria-label="AI disclaimer" className={`${baseClasses} ${variantClasses} ${className ?? ''}`} role="note">
      <Sparkles aria-hidden className="h-3.5 w-3.5 shrink-0" />
      <span>{customText ?? DEFAULT_TEXT}</span>
    </div>
  );
}
