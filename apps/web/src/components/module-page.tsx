'use client';

import {
  Button,
  CyberCard,
  CyberDataGrid,
  CyberHero,
  CyberKpi,
  type CyberDataGridColumn,
} from '@tongqian/ui';
import type { ReactNode } from 'react';

import type { WebModulePageCopy, WebModuleRow } from '../m3-pages';

const columns: Array<CyberDataGridColumn<WebModuleRow>> = [
  { header: '事项 / 项目', key: 'project' },
  { header: '金额', key: 'amount' },
  { header: '截止时间', key: 'deadline' },
  { header: '区域', key: 'region' },
  { header: '匹配度', key: 'match' },
  { header: '状态', key: 'status' },
];

export function ModulePage({ copy }: { copy: WebModulePageCopy }) {
  return (
    <div className="space-y-6">
      <CyberHero className="overflow-hidden bg-[var(--gradient-navy-hero)] p-6 text-white">
        <p className="text-sm text-silver-light">同乾方略 / 演示工作台</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">{copy.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-silver-light">{copy.description}</p>
          </div>
          <Button className="bg-rose-main text-navy-deepest hover:bg-rose-deep">{copy.action}</Button>
        </div>
      </CyberHero>

      <section className="grid gap-4 md:grid-cols-4">
        {copy.seedKpis.map((item) => (
          <CyberKpi key={item.label} label={item.label} trend={item.trend} value={item.value} />
        ))}
      </section>

      <CyberCard
        actions={<Button variant="outline">导出演示数据</Button>}
        description="这里展示可点击后的真实演示形态：表格、金额、截止时间、状态和下一步动作都已填充。"
        title="重点事项列表"
      >
        <CyberDataGrid columns={columns as unknown as CyberDataGridColumn<Record<string, ReactNode>>[]} data={copy.seedRows as unknown as Record<string, ReactNode>[]} />
      </CyberCard>

      <CyberCard
        description="点击后进入对应 AI 任务类型，演示时可直接说明会走 DeepSeek / 国产模型链路生成结构化建议。"
        title="AI 已为您准备的下一步建议"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {copy.seedActions.map((action) => (
            <button
              key={action.taskType}
              className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4 text-left text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-rose)] hover:text-white"
              onClick={() => window.dispatchEvent(new CustomEvent('tongqian:module-action', { detail: action }))}
              type="button"
            >
              <span className="block font-semibold text-white">{action.label}</span>
              <span className="mt-2 block text-xs">{action.taskType}</span>
            </button>
          ))}
        </div>
      </CyberCard>
    </div>
  );
}
