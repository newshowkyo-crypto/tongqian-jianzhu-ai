'use client';

import { Mic } from 'lucide-react';

export function VoiceInputButton({ className, onClick }: { className?: string; onClick?: () => void }): JSX.Element {
  return (
    <button aria-label="Voice input" className={`inline-flex items-center gap-2 rounded-md border border-outline-variant px-3 py-2 text-sm ${className ?? ''}`} type="button" onClick={onClick}>
      <Mic aria-hidden className="h-4 w-4" />
      Voice
    </button>
  );
}
