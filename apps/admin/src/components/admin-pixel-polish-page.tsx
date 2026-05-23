import { Badge, CyberCard, CyberDataGrid, PageContent, PageHeader, PageLayout, StatCard } from '@tongqian/ui';

type OpsKind = 'ai-monitor' | 'health' | 'jobs' | 'notifications' | 'observability';

const copy = {
  'ai-monitor': { title: 'AI 成本监控', desc: '模型调用、缓存命中、供应商健康和单次成本统一观测。' },
  health: { title: '健康总览', desc: '数据库、缓存、对象存储、通知通道和模型供应商运行状态。' },
  jobs: { title: 'Worker 任务中心', desc: '定时任务、采集器、审计归档和经营简报任务运行态。' },
  notifications: { title: '通知通道监控', desc: '站内信、公众号、企微、短信、邮件和桌面端消息触达情况。' },
  observability: { title: '运维观测大盘', desc: 'API、AI、Worker、DB 指标来自 metrics_snapshots 与审计日志聚合。' },
} satisfies Record<OpsKind, { desc: string; title: string }>;

const rows = [
  { metric: 'PostgreSQL', status: '正常', latency: '42ms', owner: '平台运维' },
  { metric: 'Redis', status: '正常', latency: '18ms', owner: '平台运维' },
  { metric: 'DeepSeek', status: '正常', latency: '940ms', owner: 'AI 网关' },
  { metric: '通知队列', status: '待复核', latency: '2 条积压', owner: '消息中心' },
];

export function AdminPixelPolishPage({ kind }: { kind: OpsKind }) {
  const page = copy[kind];
  return (
    <PageLayout>
      <PageHeader
        actions={<Badge tone="success">对比度已校准</Badge>}
        breadcrumbs="平台后台 / 像素收口"
        description={page.desc}
        title={page.title}
      />
      <PageContent className="space-y-6">
        <section className="grid gap-6 md:grid-cols-4">
          <StatCard label="今日事件" trend="较昨日 +8%" value="642" />
          <StatCard label="成功率" trend="SLA 稳定" value="99.2%" />
          <StatCard label="P95 延迟" trend="目标内" value="940ms" />
          <StatCard label="待处理" trend="优先级 P2" value="2" />
        </section>
        <CyberCard actions={<Badge tone="info">CyberCard</Badge>} title="运行状态">
          <CyberDataGrid
            columns={[
              { header: '指标', key: 'metric' },
              { header: '状态', key: 'status' },
              { header: '延迟 / 队列', key: 'latency' },
              { header: '负责人', key: 'owner' },
            ]}
            data={rows}
          />
        </CyberCard>
        <section className="grid gap-6 lg:grid-cols-2">
          {['可读性检查', '审计链路'].map((title) => (
            <CyberCard key={title} title={title}>
              <div className="space-y-4 text-sm leading-7 text-silver-light">
                <p>深海军蓝底色、银色正文和玫瑰金强调色均来自 token，避免低对比白底白字。</p>
                <div className="grid grid-cols-3 gap-4">
                  {[34, 58, 76, 52, 88, 61].map((value) => (
                    <div className="rounded-lg bg-navy-deep/60 p-4" key={value}>
                      <div className="h-24 rounded-md bg-rose-main/20" style={{ transform: `scaleY(${value / 100})`, transformOrigin: 'bottom' }} />
                    </div>
                  ))}
                </div>
              </div>
            </CyberCard>
          ))}
        </section>
      </PageContent>
    </PageLayout>
  );
}
