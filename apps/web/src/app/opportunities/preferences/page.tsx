'use client';

import { apiClient } from '@tongqian/api-client';
import { Badge, Button, Checkbox, Input, PageContent, PageLayout, Radio, SectionCard, Select } from '@tongqian/ui';
import { useState } from 'react';

const regionOptions = ['武汉', '西安', '鄂州', '孝感', '咸宁'];
const businessOptions = ['房建', '市政', '公路', '水利', '机电'];
const channelOptions = ['公众号', '短信', '站内'];
const frequencyOptions = [
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '实时', value: 'realtime' },
];

export default function OpportunityPreferencesPage() {
  const [regions, setRegions] = useState(['武汉', '西安']);
  const [industries, setIndustries] = useState(['市政', '房建']);
  const [channels, setChannels] = useState(['站内']);
  const [amountMin, setAmountMin] = useState('1000');
  const [amountMax, setAmountMax] = useState('5000');
  const [qualification, setQualification] = useState('施工总承包二级');
  const [frequency, setFrequency] = useState('daily');
  const [savedTrace, setSavedTrace] = useState<string | null>(null);

  function toggle(list: string[], value: string, setter: (next: string[]) => void): void {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  async function savePreference(): Promise<void> {
    const result = await apiClient.opportunity.savePreference({
      amountMaxCny: Number(amountMax) * 10_000,
      amountMinCny: Number(amountMin) * 10_000,
      channels,
      frequency,
      industries,
      qualification,
      regions,
    });
    setSavedTrace(result.traceId);
  }

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <Badge className="bg-[var(--surface-container-low)] text-[var(--primary)]">Opportunity Preference</Badge>
          <h1 className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">订阅机会偏好</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            用地区、业务线、金额、资质和推送方式约束每日机会雷达，保存后由 apiClient.opportunity.savePreference 写入后端。
          </p>
        </section>

        <SectionCard title="地区与业务线">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <p className="text-sm font-medium text-[var(--text-primary)]">关注地区</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {regionOptions.map((item) => (
                  <label key={item} className="flex min-h-11 items-center gap-4 rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 text-sm">
                    <Checkbox checked={regions.includes(item)} onChange={() => toggle(regions, item, setRegions)} />
                    {item}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium text-[var(--text-primary)]">业务线</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {businessOptions.map((item) => (
                  <label key={item} className="flex min-h-11 items-center gap-4 rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 text-sm">
                    <Checkbox checked={industries.includes(item)} onChange={() => toggle(industries, item, setIndustries)} />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="金额与资质">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              <span>金额下限（万元）</span>
              <Input min="0" onChange={(event) => setAmountMin(event.target.value)} type="number" value={amountMin} />
            </label>
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              <span>金额上限（万元）</span>
              <Input min="0" onChange={(event) => setAmountMax(event.target.value)} type="number" value={amountMax} />
            </label>
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              <span>资质要求</span>
              <Select
                onChange={(event) => setQualification(event.target.value)}
                options={[
                  { label: '施工总承包二级', value: '施工总承包二级' },
                  { label: '市政公用一级', value: '市政公用一级' },
                  { label: '建筑工程一级', value: '建筑工程一级' },
                ]}
                value={qualification}
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard title="推送频率与渠道">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <p className="text-sm font-medium text-[var(--text-primary)]">频率</p>
              {frequencyOptions.map((option) => (
                <label key={option.value} className="flex min-h-11 items-center gap-4 rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 text-sm">
                  <Radio checked={frequency === option.value} name="frequency" onChange={() => setFrequency(option.value)} />
                  {option.label}
                </label>
              ))}
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium text-[var(--text-primary)]">渠道</p>
              {channelOptions.map((item) => (
                <label key={item} className="flex min-h-11 items-center gap-4 rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 text-sm">
                  <Checkbox checked={channels.includes(item)} onChange={() => toggle(channels, item, setChannels)} />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </SectionCard>

        <section className="flex flex-wrap items-center gap-4 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
          <Button onClick={savePreference} variant="primary">保存偏好</Button>
          {savedTrace ? <span className="text-sm text-[var(--text-secondary)]">已保存，traceId: {savedTrace}</span> : null}
        </section>
      </PageContent>
    </PageLayout>
  );
}
