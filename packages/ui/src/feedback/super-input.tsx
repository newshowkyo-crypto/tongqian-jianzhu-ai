'use client';

import { Upload, Link as LinkIcon, Send } from 'lucide-react';
import { useState } from 'react';

import { VoiceInputButton } from '../primitives/voice-input-button.js';

type InputItem = { label: string; type: 'document' | 'image' | 'text' | 'url' | 'voice' };

export function SuperInput({ onSubmit }: { onSubmit?: (items: InputItem[]) => void }): JSX.Element {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [items, setItems] = useState<InputItem[]>([]);

  function add(type: InputItem['type'], label: string) {
    if (!label.trim()) return;
    setItems((current) => [...current, { label, type }]);
  }

  return (
    <div className="rounded-md border border-outline-variant bg-surface p-4">
      <textarea className="min-h-24 w-full resize-none rounded-md border border-outline-variant bg-transparent p-3 text-sm" placeholder="Text, image, document, voice, or URL..." value={text} onChange={(event) => setText(event.target.value)} />
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded-md border border-outline-variant px-3 py-2 text-sm" type="button" onClick={() => add('text', text)}>Add text</button>
        <button className="inline-flex items-center gap-2 rounded-md border border-outline-variant px-3 py-2 text-sm" type="button" onClick={() => add('image', 'pasted image')}><Upload className="h-4 w-4" />Image</button>
        <button className="inline-flex items-center gap-2 rounded-md border border-outline-variant px-3 py-2 text-sm" type="button" onClick={() => add('document', 'PDF / Word / Excel')}><Upload className="h-4 w-4" />Document</button>
        <VoiceInputButton onClick={() => add('voice', 'voice transcript')} />
      </div>
      <div className="mt-3 flex gap-2">
        <input className="min-w-0 flex-1 rounded-md border border-outline-variant bg-transparent px-3 py-2 text-sm" placeholder="https://example.com" value={url} onChange={(event) => setUrl(event.target.value)} />
        <button className="inline-flex items-center gap-2 rounded-md border border-outline-variant px-3 py-2 text-sm" type="button" onClick={() => add('url', url)}><LinkIcon className="h-4 w-4" />URL</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item, index) => <span className="rounded-md bg-surface-container-low px-2 py-1 text-xs" key={`${item.type}-${index}`}>{item.type}: {item.label}</span>)}
      </div>
      <button className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm text-white" type="button" onClick={() => onSubmit?.(items)}><Send className="h-4 w-4" />Submit</button>
    </div>
  );
}
