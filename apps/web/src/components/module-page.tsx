'use client';

import { apiClient } from '@tongqian/api-client';
import {
  Button,
  CyberCard,
  CyberDataGrid,
  CyberHero,
  CyberKpi,
  LoadingState,
  type CyberDataGridColumn,
} from '@tongqian/ui';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';

import type { WebModuleAction, WebModulePageCopy, WebModuleRow } from '../m3-pages';

const columns: Array<CyberDataGridColumn<WebModuleRow>> = [
  { header: '事项 / 项目', key: 'project' },
  { header: '金额', key: 'amount' },
  { header: '截止时间', key: 'deadline' },
  { header: '区域', key: 'region' },
  { header: '匹配度', key: 'match' },
  { header: '状态', key: 'status' },
];

const journeyLinks = [
  { href: '/opportunities', label: '发现机会' },
  { href: '/tenders', label: '招标中心' },
  { href: '/qualifications', label: '资格自查' },
  { href: '/contracts', label: '合同审查' },
  { href: '/dispatch', label: '派单' },
];

export function ModulePage({ copy }: { copy: WebModulePageCopy }) {
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<{ taskType: string; text: string; traceId?: string } | null>(null);

  async function runAction(action: WebModuleAction): Promise<void> {
    if (running) return;
    setRunning(action.taskType);
    setResult(null);
    try {
      const reply = await apiClient.aiGateway.invoke({
        context: { module: copy.title, rows: copy.seedRows },
        taskType: action.taskType,
        userInput: `请基于“${copy.title}”模块的5行经营数据，给出“${action.label}”的具体执行清单。`,
      });
      const text = reply.summary ?? reply.text ?? reply.message?.content ?? JSON.stringify(reply, null, 2);
      setResult({ taskType: action.taskType, text, traceId: reply.traceId });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI 调用失败';
      setResult({ taskType: action.taskType, text: `AI 调用失败：${message}` });
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="space-y-6">
      <CyberHero className="overflow-hidden border border-[var(--border-silver)] bg-[var(--surface)] p-6 text-[var(--text-primary)]">
        <p className="text-sm text-[var(--text-secondary)]">同乾方略 / 可用工作台</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">{copy.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{copy.description}</p>
          </div>
          <Button>{copy.action}</Button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
          {journeyLinks.map((item, index) => (
            <span key={item.href} className="flex items-center gap-2">
              <Link className="rounded-md border border-[var(--border-silver)] bg-[var(--surface-muted)] px-2 py-1 hover:border-[var(--accent-rose)]" href={item.href}>
                {item.label}
              </Link>
              {index < journeyLinks.length - 1 ? <span>→</span> : null}
            </span>
          ))}
        </div>
      </CyberHero>

      <section className="grid gap-4 md:grid-cols-4">
        {copy.seedKpis.map((item) => (
          <CyberKpi key={item.label} label={item.label} trend={item.trend} value={item.value} />
        ))}
      </section>

      <CyberCard
        actions={<Button variant="outline">导出经营数据</Button>}
        description="表格、金额、截止时间、状态和下一步动作均可直接用于演示和人工复核。"
        title="重点事项列表"
      >
        <CyberDataGrid columns={columns as unknown as CyberDataGridColumn<Record<string, ReactNode>>[]} data={copy.seedRows as unknown as Record<string, ReactNode>[]} />
      </CyberCard>

      <CyberCard
        description="点击后立即调用 AI Gateway，真实链路会走 DeepSeek 并返回结构化建议。"
        title="AI 已为您准备的下一步建议"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {copy.seedActions.map((action, index) => (
            <button
              key={`${action.taskType}-${index}-${action.label}`}
              className="rounded-md border border-[var(--border-silver)] bg-[var(--surface)] p-4 text-left text-sm text-[var(--text-primary)] transition-all hover:border-[var(--accent-rose)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!!running}
              onClick={() => void runAction(action)}
              type="button"
            >
              <span className="block font-semibold">{action.label}</span>
              <span className="mt-2 block text-xs text-[var(--text-muted)]">
                {running === action.taskType ? 'DeepSeek 生成中...' : '点击运行 AI 任务'}
              </span>
            </button>
          ))}
        </div>

        {running ? <LoadingState className="mt-5" label="DeepSeek 正在生成执行建议" rows={2} /> : null}
        {result ? (
          <div className="mt-6 rounded-md border border-[var(--border-silver)] bg-[var(--surface-muted)] p-4">
            <p className="mb-2 text-xs text-[var(--text-muted)]">
              AI 任务 · {result.taskType}{result.traceId ? ` · traceId ${result.traceId}` : ''}
            </p>
            <article className="whitespace-pre-wrap text-sm leading-6 text-[var(--text-primary)]">{result.text}</article>
          </div>
        ) : null}
      </CyberCard>
    </div>
  );
}
