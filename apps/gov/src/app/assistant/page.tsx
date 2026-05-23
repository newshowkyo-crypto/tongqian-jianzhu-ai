'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import { Badge, Button, PageContent, PageHeader, PageLayout, SectionCard, Textarea } from '@tongqian/ui';
import { useState } from 'react';

export default function GovAssistantPage() {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Array<{ content: string; role: 'assistant' | 'user' }>>([{ content: '我是政策智库。政企材料强制走 DeepSeek 国产路由，输出 PDF 时会提示添加客户姓名水印。', role: 'assistant' }]);
  const mutation = useMutation({
    mutationFn: (content: string) => apiClient.ai.chat([...messages, { content: `<role>gov</role><domesticOnly>true</domesticOnly><message>${content}</message>`, role: 'user' }], 'gov.policy_impact'),
    onSuccess(reply, content) {
      setMessages((current) => [...current, { content, role: 'user' }, { content: reply.message.content, role: 'assistant' }]);
      setDraft('');
    },
  });
  const submit = (content = draft) => { if (content.trim()) mutation.mutate(content.trim()); };
  return (
    <PageLayout>
      <PageHeader description="中央政策库、公文模板、政策性资金，庄重口径输出。" title="政策智库" />
      <PageContent className="grid gap-4 text-lg lg:grid-cols-[1fr_340px]">
        <SectionCard title="政企 AI 助手">
          <div className="min-h-[520px] space-y-4 rounded-lg bg-red-50/30 p-4">
            {messages.map((message, index) => <article key={index} className={`max-w-[84%] rounded-md border px-5 py-4 leading-7 ${message.role === 'user' ? 'ml-auto border-red-200 bg-white' : 'border-primary-200 bg-white'}`}>{message.content}</article>)}
            {mutation.isPending ? <p className="text-base text-neutral-500">DeepSeek 国产路径分析中...</p> : null}
          </div>
          <Textarea className="mt-3 min-h-28 text-lg" onChange={(event) => setDraft(event.target.value)} placeholder="问：专项债怎么申报？" value={draft} />
          <Button className="mt-3" disabled={!draft.trim() || mutation.isPending} onClick={() => submit()}>发送</Button>
        </SectionCard>
        <SectionCard title="边界与动作">
          <Badge tone="success">国产模型 DeepSeek</Badge>
          <p className="mt-4 text-base leading-7 text-neutral-600">数据不出境，材料导出自动提示客户姓名水印、材料编号和审计留痕。</p>
          <div className="mt-5 space-y-4">{['自己执行', '申请同乾方略', '专家小时咨询'].map((item) => <Button key={item} className="w-full" variant="outline">{item}</Button>)}</div>
        </SectionCard>
      </PageContent>
    </PageLayout>
  );
}
