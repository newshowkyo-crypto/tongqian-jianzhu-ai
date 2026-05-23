import { Badge, Button, CyberCard, CyberDataGrid, PageContent, PageHeader, PageLayout, StatCard } from '@tongqian/ui';

type FuelKind = 'golden' | 'knowledge' | 'rule';

const ruleRows = [
  { action: '通过并上线', confidence: '91%', name: '付款节点缺失风险', source: 'GF-2017 合同范本', status: '待复核', type: '合同' },
  { action: '灰度 50%', confidence: '88%', name: '资质升级三项校验', source: '资质标准', status: '生产 v3', type: '资质' },
  { action: '回滚到 v2', confidence: '86%', name: '评标权重拆分', source: '招投标法实施条例', status: '生产 v4', type: '招标' },
];

const knowledgeRows = [
  { category: '国家法规', chunks: 46, name: '招标投标法核心条款', owner: '法规组', status: '已向量化' },
  { category: '行业规范', chunks: 64, name: 'GF-2017 建设工程施工合同', owner: '合同组', status: '已向量化' },
  { category: '真实招标文件', chunks: 38, name: '市政道路改造脱敏 RFP', owner: '招标组', status: '待复核' },
];

const goldenRows = [
  { coverage: '12/10', lastRun: '92%', owner: '合同专家', taskType: 'contract.review.basic' },
  { coverage: '10/10', lastRun: '88%', owner: '资质专家', taskType: 'qualification.checkup' },
  { coverage: '11/10', lastRun: '90%', owner: '投标专家', taskType: 'tender.summary' },
];

const pageCopy: Record<string, { eyebrow: string; title: string; description: string; focus: string }> = {
  '/admin/golden-tests': { description: '35 个 Prompt 任务型黄金样例覆盖、月度盲评与差异信号。', eyebrow: '黄金测试集', focus: '覆盖率', title: '黄金测试覆盖大盘' },
  '/admin/golden-tests/run': { description: '批量运行当前 Prompt，与 expected signals 做结构化比对。', eyebrow: '批量回归', focus: '通过率', title: '黄金测试批量运行' },
  '/admin/knowledge': { description: '法规、规范、案例、政策、RFP、模板统一导入、解析、向量化。', eyebrow: '知识库', focus: '向量片段', title: '知识库导入大盘' },
  '/admin/knowledge/upload': { description: '拖拽上传专家文档，选择类目后触发 OCR、解析与 mock 向量入库。', eyebrow: '知识导入', focus: '解析队列', title: '知识文档上传' },
  '/admin/rules': { description: 'AI 抽取候选规则，专家复核后进入生产规则库并支持版本回滚。', eyebrow: '规则采集', focus: '候选池', title: '规则采集大盘' },
  '/admin/rules/candidates': { description: '左侧保留命中原文，右侧编辑 AI 抽取结构，专家一键通过或拒绝。', eyebrow: '候选审核', focus: '待复核', title: '候选规则审核台' },
  '/admin/rules/contract': { description: '合同风险规则 CRUD、风险等级筛选、命中 ruleId 回填报告。', eyebrow: '合同规则', focus: '红黄绿', title: '合同风险规则库' },
  '/admin/rules/qualification': { description: '资质标准规则 CRUD、升级路径校验、v(n+1) 灰度发布。', eyebrow: '资质规则', focus: '版本回滚', title: '资质规则库' },
  '/admin/rules/reference-price': { description: '智能管家服务参考价、PBT 标色预览、区域样本数审计。', eyebrow: '参考价', focus: 'PBT 标色', title: '参考价规则库' },
  '/admin/rules/tender': { description: '招标评分、资格门槛、陷阱条款进入生产规则链路。', eyebrow: '招标规则', focus: '评分办法', title: '招标规则库' },
};

const categoryCopy: Record<string, string> = {
  case: '案例',
  policy: '政策资金',
  regulation: '国家法规',
  rfp: '真实招标文件',
  standard: '行业规范',
  template: '内部模板',
};

function detectKind(path: string): FuelKind {
  if (path.includes('golden-tests')) return 'golden';
  if (path.includes('knowledge')) return 'knowledge';
  return 'rule';
}

export function BusinessFuelPage({ path, taskType }: { path: string; taskType?: string }) {
  const kind = detectKind(path);
  const category = path.split('/').at(-1) ?? '';
  const copy = pageCopy[path] ?? {
    description: `${categoryCopy[category] ?? taskType ?? '业务样例'} 的专家维护、元数据复核和链路审计。`,
    eyebrow: kind === 'knowledge' ? '知识类目' : '黄金样例',
    focus: kind === 'knowledge' ? '文档列表' : '新增样例',
    title: kind === 'knowledge' ? `${categoryCopy[category] ?? '知识'}文档库` : `${taskType ?? 'taskType'} 样例录入`,
  };
  const rows: Array<Record<string, number | string>> = kind === 'golden' ? goldenRows : kind === 'knowledge' ? knowledgeRows : ruleRows;

  return (
    <PageLayout className="min-h-screen bg-navy-deepest text-slate-100">
      <PageHeader
        actions={<Button variant="primary">{copy.focus}</Button>}
        breadcrumbs={copy.eyebrow}
        description={copy.description}
        title={copy.title}
      />
      <PageContent>
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="候选 / 文档" value={kind === 'rule' ? '128' : kind === 'knowledge' ? '216' : '387'} />
          <StatCard label="待专家复核" value={kind === 'rule' ? '34' : kind === 'knowledge' ? '19' : '28'} />
          <StatCard label="生产可用" value={kind === 'rule' ? '276' : kind === 'knowledge' ? '1,842' : '86%'} />
          <StatCard label="本月新增" value={kind === 'rule' ? '42' : kind === 'knowledge' ? '73' : '51'} />
        </section>
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <CyberCard
            actions={<Badge tone="success">已接入 AI Prompt 链路</Badge>}
            title={kind === 'golden' ? '黄金样例覆盖' : kind === 'knowledge' ? '知识文档队列' : '规则候选与生产库'}
          >
            <CyberDataGrid columns={Object.keys(rows[0] ?? {}).map((key) => ({ header: key, key }))} data={rows} />
          </CyberCard>
          <CyberCard title={kind === 'rule' ? '版本与灰度' : kind === 'knowledge' ? '解析与向量化' : '运行差异'}>
            <div className="space-y-4 text-sm leading-7 text-slate-200">
              <p>{kind === 'rule' ? 'v4 当前灰度 50%，可回滚 v2；AI 调用按 ruleId 与灰度 hash 命中版本。' : kind === 'knowledge' ? '上传后自动拆 chunk，mock 向量索引保留原文引用，报告底部可追溯资料来源。' : '每次 Prompt 改版触发 run-all，低于 70% 阈值不得灰度发布。'}</p>
              <div className="grid grid-cols-2 gap-4">
                {['专家复核', '审计留痕', '版本快照', '报告引用'].map((item) => (
                  <div className="rounded border border-cyan-300/25 bg-cyan-300/10 p-4" key={item}>{item}</div>
                ))}
              </div>
            </div>
          </CyberCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
