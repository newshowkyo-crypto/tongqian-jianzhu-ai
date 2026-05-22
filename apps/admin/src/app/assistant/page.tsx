'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import { Button, PageContent, PageHeader, PageLayout, SectionCard, Textarea } from '@tongqian/ui';
import { useState } from 'react';

export default function AdminAssistantPage() {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Array<{ content: string; role: 'assistant' | 'user' }>>([{ content: '我是运营顾问。可以问红线告警处理、反薅 5 维调优、客户成功 SOP、凭证切换和模型路由健康。', role: 'assistant' }]);
  const mutation = useMutation({
    mutationFn: (content: string) => apiClient.ai.chat([...messages, { content: `<role>admin</role><message>${content}</message>`, role: 'user' }], 'admin.prompt_test'),
    onSuccess(reply, content) {
      setMessages((current) => [...current, { content, role: 'user' }, { content: reply.message.content, role: 'assistant' }]);
      setDraft('');
    },
  });
  const submit = (content = draft) => { if (content.trim()) mutation.mutate(content.trim()); };
  return (
    <PageLayout>
      <PageHeader description="技术型产品经理口径，面向 OPC 平台运营。" title="运营顾问" />
      <PageContent className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <SectionCard title="后台运营对话">
          <div className="min-h-[460px] space-y-4 rounded-lg bg-neutral-50 p-4">{messages.map((message, index) => <article key={index} className={`max-w-[84%] rounded-md border px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'ml-auto bg-white' : 'bg-white'}`}>{message.content}</article>)}</div>
          <Textarea className="mt-3 min-h-28" onChange={(event) => setDraft(event.target.value)} placeholder="问：BR-901 红线告警如何处理？" value={draft} />
          <Button className="mt-3" disabled={!draft.trim() || mutation.isPending} onClick={() => submit()}>发送</Button>
        </SectionCard>
        <SectionCard title="常问问题">{['红线告警如何处理', '反薅 5 维如何调优', '客户成功 SOP', '模型路由健康'].map((item) => <Button key={item} className="mb-3 w-full" onClick={() => submit(item)} variant="outline">{item}</Button>)}</SectionCard>
      </PageContent>
    </PageLayout>
  );
}
