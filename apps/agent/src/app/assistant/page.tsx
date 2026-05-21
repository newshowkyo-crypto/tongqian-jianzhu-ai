'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import { Badge, Button, PageContent, PageHeader, PageLayout, SectionCard, Textarea } from '@tongqian/ui';
import { useState } from 'react';

const guideButtons = ['按方案执行', '推荐给同乾方略', '平台客服'];
const cases = ['5 万怎么报价', '客户嫌贵怎么说', '客户想私下交易怎么办', '材料缺口怎么催'];

export default function StewardAssistantPage() {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Array<{ content: string; role: 'assistant' | 'user' }>>([{ content: '我是派单老司机。报价、客户话术、线下跑办和平台规则都可以问我；私下交易绕平台的问题不会提供做法。', role: 'assistant' }]);
  const mutation = useMutation({
    mutationFn: (content: string) => apiClient.ai.chat([...messages, { content: `<role>steward</role><message>${content}</message>`, role: 'user' }], 'agent.assistant_reply'),
    onSuccess(reply, content) {
      setMessages((current) => [...current, { content, role: 'user' }, { content: reply.message.content, role: 'assistant' }]);
      setDraft('');
    },
  });

  function submit(content = draft): void {
    const trimmed = content.trim();
    if (trimmed) mutation.mutate(trimmed);
  }

  return (
    <PageLayout>
      <PageHeader description="实战派老智能管家话术库，客户敏感信息默认脱敏，禁止绕过平台私下交易。" title="派单老司机" />
      <PageContent className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <SectionCard title="智能管家对话">
          <div className="min-h-[520px] space-y-3 rounded-lg bg-rose-50/40 p-4">
            {messages.map((message, index) => <article key={index} className={`max-w-[82%] rounded-lg border px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'ml-auto border-rose-200 bg-white' : 'border-amber-200 bg-white'}`}>{message.content}</article>)}
            {mutation.isPending ? <p className="text-sm text-neutral-500">正在生成实战话术...</p> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">{cases.map((item) => <Button key={item} onClick={() => submit(item)} size="sm" variant="outline">{item}</Button>)}</div>
          <Textarea className="mt-3 min-h-28" onChange={(event) => setDraft(event.target.value)} placeholder="问：这单 5 万怎么报价？" value={draft} />
          <Button className="mt-3" disabled={!draft.trim() || mutation.isPending} onClick={() => submit()}>发送</Button>
        </SectionCard>
        <SectionCard title="动作按钮">
          <div className="space-y-3">{guideButtons.map((button) => <Button key={button} className="w-full" variant="outline">{button}</Button>)}</div>
          <Badge className="mt-4" tone="warning">客户手机号、身份证、营业执照号仅脱敏显示</Badge>
        </SectionCard>
      </PageContent>
    </PageLayout>
  );
}
