'use client';

import { type ReactNode, useState } from 'react';

import { CyberChatPanel, type CyberChatPanelProps } from './chat-panel.js';

export function CyberAiOrb(props: CyberChatPanelProps): ReactNode {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open ? <CyberChatPanel {...props} /> : null}
      <button aria-label="打开 AI 助理" className="fixed bottom-6 right-6 z-[81] h-14 w-14 rounded-full bg-rose-main text-sm font-semibold text-navy-deepest shadow-md [animation:tq-assistant-pulse_2s_ease-in-out_infinite]" onClick={() => setOpen((value) => !value)} type="button">AI</button>
    </>
  );
}

export const CyberAiOrbPanel = CyberChatPanel;
