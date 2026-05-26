import { PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const sends = [
  { channel: '站内信', debtor: '华东城投', status: '已送达' },
  { channel: '企业微信', debtor: '滨江建设', status: '已降级到站内信' },
  { channel: '邮件', debtor: '南城开发', status: '待跟进' },
];

export default function CashflowRemindersPage(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs="现金流 / 催收提醒" description="同一笔应收款可按站内信、企业微信和邮件多渠道提醒。" title="多渠道催收提醒" />
        <section className="grid gap-4 lg:grid-cols-3">
          {sends.map((send) => (
            <SectionCard key={`${send.channel}-${send.debtor}`} title={send.debtor}>
              <div className="text-sm text-stitch-on-surface-variant">{send.channel}</div>
              <p className="mt-3 text-sm text-stitch-on-surface">{send.status}</p>
            </SectionCard>
          ))}
        </section>
      </PageContent>
    </PageLayout>
  );
}
