export interface WebModuleKpi {
  label: string;
  trend: string;
  value: string;
}

export interface WebModuleRow {
  amount: string;
  deadline: string;
  match: string;
  project: string;
  region: string;
  status: string;
}

export interface WebModuleAction {
  label: string;
  taskType: string;
}

export interface WebModulePageCopy {
  action: string;
  description: string;
  empty: string;
  metric: string;
  seedActions: WebModuleAction[];
  seedKpis: WebModuleKpi[];
  seedRows: WebModuleRow[];
  title: string;
}

type BaseCopy = Omit<WebModulePageCopy, 'seedActions' | 'seedKpis' | 'seedRows'>;

const basePages = {
  approvals: { action: '新建审批', description: '集中处理合同、报价、退款与凭证相关审批。', empty: '暂无待处理审批。', metric: '待办审批', title: '审批工作台' },
  approvalFlows: { action: '查看流程', description: '跟踪审批节点、签署记录与超时提醒。', empty: '暂无审批流程。', metric: '流转中', title: '审批流程' },
  cashflow: { action: '生成预测', description: '查看应收、应付、现金缺口与资金预警。', empty: '暂无现金流数据。', metric: '现金缺口', title: '财务现金流' },
  cashflowForecast: { action: '刷新预测', description: '按项目和客户滚动预测未来 90 天现金流。', empty: '暂无预测记录。', metric: '预测准确率', title: '现金流预测' },
  cashflowReceivables: { action: '新增催收', description: '跟踪应收账龄、催收动作与风险红灯。', empty: '暂无应收款。', metric: '逾期金额', title: '应收账款' },
  contracts: { action: '上传合同', description: '合同审查、条款库、修改函和月度复盘入口。', empty: '暂无合同。', metric: '本月审查', title: '合同审查' },
  contractClauses: { action: '新增条款', description: '沉淀高风险条款、标准措辞与修订建议。', empty: '暂无条款。', metric: '风险条款', title: '条款库' },
  contractReviews: { action: '发起审查', description: '跟踪 AI 审查进度、风险等级和人工复核。', empty: '暂无审查记录。', metric: '红灯合同', title: '合同审查记录' },
  dispatch: { action: '申请协助', description: '线下跑腿、窗口沟通与兜底服务派单入口。', empty: '暂无派单。', metric: '进行中', title: '派单大厅' },
  documents: { action: '上传资料', description: '资料归档、完整性检查和项目文档检索。', empty: '暂无资料。', metric: '资料完整度', title: '资料库' },
  documentArchive: { action: '生成目录', description: '按项目、合同和资质维度生成归档目录。', empty: '暂无归档。', metric: '归档批次', title: '资料归档' },
  finance: { action: '导出报表', description: '经营指标、利润、回款和项目现金流综合报表。', empty: '暂无经营报表。', metric: '经营评分', title: '经营报表' },
  financeKpi: { action: '配置指标', description: '维护老板首页 KPI、红线阈值和看板排序。', empty: '暂无指标配置。', metric: '启用指标', title: 'KPI 指标库' },
  opportunities: { action: '订阅机会', description: '从政策、招标和央国企渠道筛选今日机会。', empty: '暂无机会。', metric: '今日机会', title: '机会雷达' },
  opportunityMatches: { action: '重新匹配', description: '按资质、区域、金额和关系资源计算机会匹配度。', empty: '暂无匹配结果。', metric: '高匹配', title: '机会匹配' },
  opportunityPreferences: { action: '保存偏好', description: '设置区域、行业、金额和推送频率。', empty: '暂无偏好配置。', metric: '推送规则', title: '机会偏好' },
  projects: { action: '新建项目', description: '项目台账、现场记录、成本、图纸和风险联动。', empty: '暂无项目。', metric: '在建项目', title: '项目部' },
  projectCost: { action: '测算成本', description: '材料、人工、机械和分包成本快速测算。', empty: '暂无成本测算。', metric: '成本偏差', title: '项目成本' },
  projectDrawings: { action: '上传图纸', description: '图纸识别、版本对比和错漏碰缺提示。', empty: '暂无图纸。', metric: '识别批次', title: '图纸识别' },
  projectSite: { action: '新增日志', description: '施工日志、重大隐患、进度和现场签证管理。', empty: '暂无现场记录。', metric: '现场风险', title: '项目现场' },
  qualifications: { action: '发起体检', description: '资质证书、人员证书、安全许可和升级路径。', empty: '暂无资质。', metric: '临期证书', title: '资质护航' },
  qualificationCerts: { action: '新增证书', description: '统一管理企业资质、人员证书和安全许可证。', empty: '暂无证书。', metric: '有效证书', title: '证书台账' },
  qualificationCheckups: { action: '开始体检', description: '按资质等级自动检查缺口、临期和升级条件。', empty: '暂无体检记录。', metric: '合规项', title: '资质体检' },
  reports: { action: '生成报告', description: 'AI 报告中心，汇总合同、投标、资质和经营报告。', empty: '暂无报告。', metric: '本周报告', title: '报告中心' },
  reportHistory: { action: '筛选历史', description: '按项目、客户、风险等级和生成时间检索报告。', empty: '暂无历史报告。', metric: '已归档', title: '报告历史' },
  reportTemplates: { action: '新建模板', description: '管理 H5、PDF 和联合品牌报告模板。', empty: '暂无模板。', metric: '启用模板', title: '报告模板' },
  settings: { action: '保存设置', description: '企业资料、通知、权限和安全偏好。', empty: '暂无设置项。', metric: '安全项', title: '设置' },
  settingsProfile: { action: '更新资料', description: '维护企业名称、联系人、资质和经营区域。', empty: '暂无企业资料。', metric: '资料完整度', title: '企业资料' },
  tenders: { action: '新建标书', description: '招标机会、资格检查、标书框架和分包策略。', empty: '暂无标书。', metric: '投标准备', title: '招标中心' },
  tenderEligibility: { action: '立即检查', description: '自动核验招标资格、人员、业绩和风险条款。', empty: '暂无资格检查。', metric: '匹配度', title: '投标资格检查' },
  tenderFrameworks: { action: '生成框架', description: '生成技术标、商务标和目录结构。', empty: '暂无标书框架。', metric: '框架草稿', title: '标书框架' },
  tenderPackages: { action: '打包资料', description: '汇总投标文件、证明材料和盖章清单。', empty: '暂无投标包。', metric: '资料缺口', title: '投标包' },
  tools: { action: '打开工具', description: '经营、法务、资料员和财务高频 AI 工具箱。', empty: '暂无工具记录。', metric: '本周调用', title: '工具箱' },
  toolsBusiness: { action: '生成函件', description: '客户备忘录、邀请函、商务沟通和投标准备。', empty: '暂无商务工具记录。', metric: '生成次数', title: '商务工具' },
  toolsLegal: { action: '法律咨询', description: '合同咨询、修改函、索赔策略和月度风险复盘。', empty: '暂无法务工具记录。', metric: '咨询次数', title: '法务工具' },
  workspace: { action: '邀请成员', description: '团队协作、任务分配和跨岗位上下文同步。', empty: '暂无协作任务。', metric: '团队任务', title: '团队协作' },
  workspaceTeam: { action: '新增成员', description: '维护老板、标书员、财务和项目经理角色。', empty: '暂无成员。', metric: '成员数', title: '团队成员' },
} satisfies Record<string, BaseCopy>;

const rowTemplates = [
  ['武汉地铁 12 号线配套工程', '3.2 亿', '2026-06-15', '湖北 武汉', '87%', '可推进'],
  ['西安城投综合管廊维护', '8500 万', '2026-06-10', '陕西 西安', '79%', '待复核'],
  ['广州番禺旧改一期', '1.8 亿', '2026-06-22', '广东 广州', '73%', '资料补齐'],
  ['合肥高新区学校改造', '4200 万', '2026-06-18', '安徽 合肥', '82%', '可投标'],
  ['成都天府新区园区道路', '9600 万', '2026-06-25', '四川 成都', '76%', '需审批'],
] as const;

function withSeeds(key: string, copy: BaseCopy): WebModulePageCopy {
  return {
    ...copy,
    seedActions: [
      { label: `${copy.action}并生成行动清单`, taskType: `${key}.action_plan` },
      { label: '让 AI 复核风险和证据链', taskType: `${key}.risk_review` },
      { label: '申请智能管家线下协助', taskType: `${key}.steward_handoff` },
    ],
    seedKpis: [
      { label: copy.metric, trend: '+12.3%', value: '18' },
      { label: '高优先级', trend: '本周新增 4 项', value: '7' },
      { label: 'AI 已处理', trend: '平均 42 秒', value: '26' },
      { label: '待人工确认', trend: '红灯 2 项', value: '3' },
    ],
    seedRows: rowTemplates.map(([project, amount, deadline, region, match, status], index) => ({
      amount,
      deadline,
      match,
      project: `${copy.title} / ${project}`,
      region,
      status: index === 0 ? '重点跟进' : status,
    })),
  };
}

export const webModulePages = Object.fromEntries(
  Object.entries(basePages).map(([key, copy]) => [key, withSeeds(key, copy)]),
) as { [K in keyof typeof basePages]: WebModulePageCopy };
