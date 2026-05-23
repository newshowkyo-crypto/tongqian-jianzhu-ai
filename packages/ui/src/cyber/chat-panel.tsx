'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';

export interface ChatContext {
  module: 'contract' | 'dashboard' | 'opportunity' | 'qualification' | 'report' | 'tender';
  pathname: string;
  resourceId?: string;
  selectedRow?: unknown;
}

export interface CyberChatMessage {
  content: string;
  role: 'assistant' | 'user';
}

export interface CyberChatPanelProps {
  currentContext: ChatContext;
  onConvert?: (targetTask: 'dispatch' | 'report' | 'risk-review' | 'tender', messages: CyberChatMessage[]) => Promise<void>;
  onSend?: (input: { context: ChatContext; messages: CyberChatMessage[]; personaId: string; userInput: string }) => Promise<{ content: string; confidence?: 'high' | 'low' | 'medium'; tier?: 1 | 2 | 3 | 4 }>;
}

const personas = {
  'butler-tongtong': { name: '管家小同', tone: '严肃顾问', greeting: '我会先把经营风险拆成可执行动作。', endpoint: 'chat.long' },
  'dispatch-veteran': { name: '派单老司机', tone: '实战派', greeting: '我重点看线下跑腿、窗口关系和兜底路径。', endpoint: 'chat.dispatch' },
  'policy-think-tank': { name: '政策智库', tone: '体制内参谋', greeting: '我会按政策口径梳理依据和申报窗口。', endpoint: 'chat.policy' },
  'ops-advisor': { name: '运营顾问', tone: '产品经理', greeting: '我帮你把问题转成任务、指标和负责人。', endpoint: 'chat.ops' },
};

export function CyberChatPanel({ currentContext, onConvert, onSend }: CyberChatPanelProps): ReactNode {
  const [personaId, setPersonaId] = useState<keyof typeof personas>('butler-tongtong');
  const [draft, setDraft] = useState('');
  const storageKey = `tongqian.chatHub.${personaId}`;
  const [messages, setMessages] = useState<CyberChatMessage[]>([{ content: personas[personaId].greeting, role: 'assistant' }]);
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    setMessages(stored ? JSON.parse(stored) as CyberChatMessage[] : [{ content: personas[personaId].greeting, role: 'assistant' }]);
  }, [personaId, storageKey]);
  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);
  const quickActions = useMemo(() => {
    if (currentContext.pathname.includes('/contracts')) return ['审查我刚上传的合同', '找类似合同模板', '问合同条款的法律依据'];
    if (currentContext.pathname.includes('/tenders')) return ['分析这份招标书', '评分预测', '生成投标框架'];
    if (currentContext.pathname.includes('/qualifications')) return ['资质升级路径', '临期预警', '升级路径成本'];
    return ['生成行动清单', '识别现金流风险', '转为派单'];
  }, [currentContext.pathname]);
  async function send(content = draft) {
    const trimmed = content.trim();
    if (!trimmed) return;
    const next = [...messages, { content: trimmed, role: 'user' } satisfies CyberChatMessage];
    setDraft('');
    setMessages(next);
    const reply = await onSend?.({ context: { ...currentContext }, messages: next.slice(-3), personaId, userInput: trimmed });
    setMessages([...next, { content: reply?.content ?? `已按 ${personas[personaId].endpoint} 分析上下文，建议转正式任务。`, role: 'assistant' }]);
  }
  return (
    <aside className="fixed bottom-24 right-6 z-[80] h-[80vh] w-[min(92vw,420px)] overflow-hidden rounded-xl border bg-white shadow-md">
      <header className="border-b bg-navy-deepest p-4 text-white">
        <div className="flex gap-2">{Object.entries(personas).map(([key, persona]) => <button className="rounded-md border px-2 py-1 text-xs" key={key} onClick={() => setPersonaId(key as keyof typeof personas)} type="button">{persona.name}</button>)}</div>
        <p className="mt-2 text-xs text-rose-main">{personas[personaId].tone} · {currentContext.pathname}</p>
      </header>
      <section className="h-[46vh] space-y-3 overflow-y-auto p-4">{messages.map((message, index) => <article className={message.role === 'user' ? 'ml-10 rounded-md bg-primary-50 p-3' : 'mr-10 rounded-md border p-3'} key={`${message.role}-${index}`}>{message.content}<p className="text-xs text-neutral-500">Tier 徽章 · 信心度</p></article>)}</section>
      <section className="border-t p-3">
        <div className="mb-2 flex flex-wrap gap-2">{quickActions.map((action) => <button className="rounded-md border px-2 py-1 text-xs" key={action} onClick={() => void send(action)} type="button">{action}</button>)}</div>
        <textarea className="min-h-20 w-full rounded-md border p-2" onChange={(event) => setDraft(event.target.value)} value={draft} />
        <div className="mt-2 flex flex-wrap gap-2"><button className="rounded-md bg-rose-main px-3 py-2 text-navy-deepest" onClick={() => void send()} type="button">发送</button><button className="rounded-md border px-3 py-2" onClick={() => setMessages([])} type="button">清空对话</button><button className="rounded-md border px-3 py-2" type="button">导出对话</button></div>
        {messages.some((item) => item.role === 'assistant') ? <div className="mt-2 flex flex-wrap gap-2">{(['risk-review', 'tender', 'dispatch', 'report'] as const).map((target) => <button className="rounded-md border px-2 py-1 text-xs" key={target} onClick={() => void onConvert?.(target, messages)} type="button">转为{target}</button>)}<button className="rounded-md border px-2 py-1 text-xs" type="button">保存到收藏</button></div> : null}
      </section>
    </aside>
  );
}
