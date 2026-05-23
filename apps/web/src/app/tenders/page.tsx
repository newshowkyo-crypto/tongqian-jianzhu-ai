'use client';

import { type ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button, CyberDataGrid, CyberHero, CyberKpi, FileSearch, Input, Select, SectionCard } from '@tongqian/ui';
import { apiClient, type TenderListItem } from '@tongqian/api-client';

const seedRows: TenderListItem[] = [
  { amount: '3200 万元', deadline: '2026-06-02', id: 'demo-active', matchScore: 70, owner: '武汉东湖高新区', projectType: '市政道路', status: 'active', title: '高新区道路改造施工总包' },
  { amount: '860 万元', deadline: '2026-06-08', id: 'demo-perfect', matchScore: 95, owner: '黄陂区教育局', projectType: '学校维修', status: 'active', title: '中小学暑期维修项目' },
  { amount: '5100 万元', deadline: '2026-05-29', id: 'demo-risky', matchScore: 48, owner: '鄂州临空园区', projectType: '厂房建设', status: 'reviewing', title: '标准厂房二期施工' },
  { amount: '1800 万元', deadline: '2026-06-12', id: 'demo-bridge', matchScore: 82, owner: '湖北某投公司', projectType: '桥梁专业分包', status: 'completed', title: '市政桥梁专业分包' },
  { amount: '650 万元', deadline: '2026-06-16', id: 'demo-park', matchScore: 76, owner: '武汉某街道', projectType: '园林绿化', status: 'active', title: '口袋公园更新工程' },
];

export default function TendersPage() {
  const router = useRouter();
  const [projectType, setProjectType] = useState('all');
  const [qualification, setQualification] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [rows, setRows] = useState(seedRows);
  const visible = useMemo(() => rows.filter((row) => (projectType === 'all' || row.projectType.includes(projectType)) && row.title.includes(keyword)), [rows, projectType, keyword]);
  async function refreshRows() {
    setRows(await apiClient.tender.list({ keyword, projectType, qualification }));
  }

  return (
    <main className="space-y-6 p-6">
      <CyberHero className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">招标中心闭环</p>
          <h1 className="mt-2 text-3xl font-semibold leading-9 text-[var(--text-primary)]">招标文件速读、资格自查与投标框架生成</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">上传招标文件后，先看十项速读和资格差距，再决定是否生成投标框架。</p>
        </div>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--accent-rose)] px-4 text-sm font-medium text-[var(--text-primary)]" href="/tenders/new"><FileSearch className="mr-2 h-4 w-4" />上传招标文件</Link>
      </CyberHero>

      <section className="grid gap-4 md:grid-cols-4">
        <CyberKpi label="本月解析" value="36" trend="+11" />
        <CyberKpi label="资格匹配" value="82%" trend="均值" />
        <CyberKpi label="评分预判" value="18" trend="已完成" />
        <CyberKpi label="已生成框架" value="12" trend="本周" />
      </section>

      <SectionCard title="筛选与项目列表">
        <div className="mb-4 grid gap-4 md:grid-cols-[160px_180px_180px_1fr_auto]">
          <Select aria-label="项目类型" onChange={(event) => setProjectType(event.target.value)} options={[{ label: '全部类型', value: 'all' }, { label: '市政', value: '市政' }, { label: '学校', value: '学校' }, { label: '厂房', value: '厂房' }]} value={projectType} />
          <Select aria-label="资质要求" onChange={(event) => setQualification(event.target.value)} options={[{ label: '全部资质', value: 'all' }, { label: '建筑二级', value: '建筑二级' }, { label: '市政二级', value: '市政二级' }]} value={qualification} />
          <Input aria-label="截止日期" placeholder="截止日期" />
          <Input aria-label="关键词" onChange={(event) => setKeyword(event.target.value)} placeholder="关键词" value={keyword} />
          <Button onClick={refreshRows}>刷新</Button>
        </div>
        <CyberDataGrid
          columns={[
            { header: '项目', key: 'title' },
            { header: '业主', key: 'owner' },
            { header: '金额', key: 'amount' },
            { cell: (row) => <Badge tone={Number(row.matchScore) >= 85 ? 'success' : Number(row.matchScore) >= 70 ? 'warning' : 'danger'}>{String(row.matchScore)}%</Badge>, header: '匹配', key: 'matchScore' },
            { header: '截止', key: 'deadline' },
            { cell: (row) => <RowActions id={String(row.id)} />, header: '操作', key: 'id' },
          ]}
          data={visible as unknown as Array<Record<string, ReactNode>>}
          getRowKey={(row) => String(row.id)}
        />
      </SectionCard>
    </main>
  );

  function RowActions({ id }: { id: string }) {
    return <Select aria-label="招标操作" onChange={(event) => event.target.value === 'read' ? router.push(`/tenders/${id}`) : console.info(`tender:${event.target.value}:${id}`)} options={[{ label: '查看速读', value: 'read' }, { label: '资格自查', value: 'eligibility' }, { label: '生成框架', value: 'framework' }, { label: '删除', value: 'delete' }]} placeholder="选择" value="" />;
  }
}
