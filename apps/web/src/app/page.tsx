'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient, type AiChatMessage } from '@tongqian/api-client';
import { useState } from 'react';

const labels = {
  assistant: 'AI',
  briefing: 'Morning briefing',
  description: 'DeepSeek-first API client is connected. Local demo falls back to mock data when the backend is not available.',
  input: 'Ask about cash flow, contracts, tenders, qualifications, policy funds, or daily operations.',
  pending: 'Sending...',
  send: 'Send',
  title: 'Tongqian Strategy Workbench',
};

const starterMessages: AiChatMessage[] = [
  {
    content: 'Good morning. Today we suggest reviewing three tender windows, two payment milestones, and one qualification expiry risk.',
    role: 'assistant',
  },
];

export default function Page() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AiChatMessage[]>(starterMessages);
  const [toast, setToast] = useState<string>();

  const chat = useMutation({
    mutationFn: (nextMessages: AiChatMessage[]) => apiClient.ai.chat(nextMessages, 'chat.long'),
    onError: () => setToast('The AI channel is temporarily unavailable. Mock fallback stays enabled for local demos.'),
    onSuccess: (result) => {
      setMessages((current) => [...current, result.message]);
      setToast(`DeepSeek fallback completed: Tier ${result.tier} / ${result.confidence}`);
    },
  });

  function send() {
    const content = input.trim();
    if (!content) return;
    const nextMessages: AiChatMessage[] = [...messages, { content, role: 'user' }];
    setMessages(nextMessages);
    setInput('');
    chat.mutate(nextMessages);
  }

  function triggerMorningBriefing() {
    const nextMessages: AiChatMessage[] = [
      ...messages,
      {
        content: 'Generate a concise owner morning briefing with opportunities, risks, approvals, cash flow, and next actions.',
        role: 'user',
      },
    ];
    setMessages(nextMessages);
    chat.mutate(nextMessages);
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <header className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary-700">DeepSeek only / mock ready</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-normal">{labels.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">{labels.description}</p>
              </div>
              <button
                className="min-h-11 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={chat.isPending}
                onClick={triggerMorningBriefing}
                type="button"
              >
                {labels.briefing}
              </button>
            </div>
          </header>

          <section className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">AI operation thread</h2>
                <p className="mt-1 text-sm text-neutral-500">The same entry can later call contract review, tender framework, policy match, and briefing prompts.</p>
              </div>
              <span className="rounded-sm bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Clickable</span>
            </div>

            <div className="space-y-4">
              {messages.map((message, index) => (
                <article
                  className={`rounded-md border px-3 py-2 text-sm leading-6 ${
                    message.role === 'assistant'
                      ? 'border-primary-100 bg-primary-50 text-primary-950'
                      : 'border-neutral-200 bg-white text-neutral-800'
                  }`}
                  key={`${message.role}-${index}`}
                >
                  <span className="mr-2 font-semibold">{message.role === 'assistant' ? labels.assistant : 'You'}</span>
                  {message.content}
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold">AI assistant</h2>
            <span className="rounded-sm bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">DeepSeek</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-neutral-600">Send with Ctrl/Cmd + Enter. Mock fallback keeps this usable without backend services.</p>
          <textarea
            className="mt-3 h-28 w-full resize-none rounded-md border border-neutral-300 p-4 text-sm outline-none transition focus:border-primary-500"
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') send();
            }}
            placeholder={labels.input}
            value={input}
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              className="min-h-11 rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={chat.isPending}
              onClick={triggerMorningBriefing}
              type="button"
            >
              {labels.briefing}
            </button>
            <button
              className="min-h-11 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={chat.isPending || !input.trim()}
              onClick={send}
              type="button"
            >
              {chat.isPending ? labels.pending : labels.send}
            </button>
          </div>
        </aside>
      </section>

      {toast ? (
        <button
          className="fixed bottom-6 left-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm"
          onClick={() => setToast(undefined)}
          type="button"
        >
          {toast}
        </button>
      ) : null}
    </main>
  );
}
