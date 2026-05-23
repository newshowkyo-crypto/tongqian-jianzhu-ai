import { Badge, Button, Calculator, FileSearch, HardHat, Megaphone, MessageSquare, Radar, SectionCard, Wallet } from '@tongqian/ui';
import Link from 'next/link';

const features = [
  ['机会雷达', '每天自动筛出高匹配项目，按地区、金额、资质和截止时间排序。', Radar],
  ['招标中心', '把招标文件拆成资格、废标、报价和证据链四类清单。', Megaphone],
  ['合同审查', '重点检查付款、违约、签证变更和争议解决条款。', FileSearch],
  ['资质护航', '跟踪证书到期、人员社保、业绩证明和升级窗口。', HardHat],
  ['AI 助理', '把经营问题压缩成老板能执行的下一步动作。', MessageSquare],
] as const;

const plans = [
  ['体验版', '¥0', '注册即送 500 点'],
  ['基础版', '¥39', '适合偶发投标'],
  ['专业版', '¥199', '适合经营团队'],
  ['旗舰版', '¥499', '适合多项目公司'],
  ['顾问版', '¥999', '含同乾方略服务入口'],
] as const;

const cases = ['某市政施工企业 30 天内追回逾期回款 2 笔', '某房建企业投标前发现 4 条废标风险', '某园区承包商用资质清单提前 60 天补证'];
const faqs = ['数据从哪里来？', 'AI 会不会替代人工？', '点数怎么扣？', '智能管家做什么？', '能不能多人协作？', '生产环境如何部署？'];

export default function WelcomePage() {
  return (
    <main className="bg-[var(--bg)] text-[var(--text-primary)]">
      <section className="mx-auto grid min-h-screen max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <Badge className="bg-[var(--surface-container-low)] text-[var(--primary)]">同乾方略 · 建筑 AI 经营管家</Badge>
          <h1 className="max-w-3xl text-3xl font-semibold leading-9">把机会、招标、合同、资质和现金流接成一条经营主线</h1>
          <p className="max-w-2xl text-base leading-6 text-[var(--text-secondary)]">面向中国中小建筑企业的 AI 工具平台，让老板每天先看能赚钱的机会、会出事的风险，以及下一步该交给谁。</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard"><Button>立即试用</Button></Link>
            <Link href="/h5/reports/contract-review"><Button variant="outline">查看报告样例</Button></Link>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-md">
          <div className="aspect-video rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6">
            <div className="grid h-full place-items-center text-center">
              <div>
                <Wallet className="mx-auto h-10 w-10 text-[var(--primary)]" />
                <p className="mt-4 text-xl font-semibold">经营驾驶舱演示</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">备案后接入视频与微信扫码</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-6 py-12">
        <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="五大核心功能">
          <div className="grid gap-4 md:grid-cols-5">
            {features.map(([title, text, Icon]) => (
              <article key={title} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
                <Icon className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="mt-4 text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{text}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="演示案例">
            <div className="space-y-4">
              {cases.map((item) => <p key={item} className="rounded-lg bg-[var(--surface-container-low)] p-4 text-sm leading-6">{item}<span className="ml-2 text-xs text-[var(--text-secondary)]">演示数据，上线前替换</span></p>)}
            </div>
          </SectionCard>
          <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="订阅价格">
            <div className="grid gap-4 md:grid-cols-5">
              {plans.map(([name, price, desc]) => (
                <article key={name} className="rounded-lg border border-[var(--outline-variant)] p-4">
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--primary)]">{price}</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{desc}</p>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="常见问题">
          <div className="grid gap-4 md:grid-cols-3">
            {faqs.map((item) => <p key={item} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4 text-sm">{item}</p>)}
          </div>
        </SectionCard>

        <section className="grid gap-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-6 md:grid-cols-[1fr_220px] md:items-center">
          <div>
            <h2 className="text-2xl font-semibold leading-8">输入手机号，预约演示</h2>
            <div className="mt-4 flex gap-4">
              <input className="h-10 flex-1 rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 text-sm" placeholder="请输入手机号" />
              <Button><Calculator className="mr-2 h-4 w-4" />提交</Button>
            </div>
          </div>
          <div className="grid aspect-square place-items-center rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-sm text-[var(--text-secondary)]">二维码占位</div>
        </section>
      </section>
    </main>
  );
}
