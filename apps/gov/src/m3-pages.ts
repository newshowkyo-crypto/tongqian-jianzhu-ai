export interface GovModulePageCopy {
  readonly action: string;
  readonly description: string;
  readonly emptyDescription: string;
  readonly indicators: readonly { label: string; value: string; trend: string }[];
  readonly notices: readonly string[];
  readonly records: readonly { meta: string; status: 'active' | 'completed' | 'pending' | 'processing'; title: string }[];
  readonly title: string;
}

export const govModulePages = {
  approvals: {
    action: '发起流转',
    description: '对政策发布、资金匹配、公文生成和项目寻源进行单位内部审批留痕。',
    emptyDescription: '暂无待审批事项，系统会在高风险或跨部门动作前要求确认。',
    indicators: [
      { label: '待审批', value: '11', trend: '3 件今日到期' },
      { label: '平均流转', value: '6.2h', trend: '低于 12 小时' },
      { label: '退回率', value: '4%', trend: '近 30 天' },
    ],
    notices: ['审批意见自动归档', '关键写操作不可绕过审批', '可导出月度审计表'],
    records: [
      { meta: '资金匹配', status: 'processing', title: '智能建造专项资金初筛结果确认' },
      { meta: '公文生成', status: 'pending', title: '调研纪要发布前复核' },
      { meta: '项目寻源', status: 'active', title: '产业园配套项目脱敏沟通授权' },
    ],
    title: '审批流转',
  },
  consulting: {
    action: '预约咨询',
    description: '面向复杂投融资、资产证券化、产业基金和央国企协同事项的高端咨询入口。',
    emptyDescription: '暂无咨询预约，复杂项目可先生成内部研判材料再提交。',
    indicators: [
      { label: '咨询线索', value: '8', trend: '2 个重点' },
      { label: '转同乾方略', value: '3', trend: '本月' },
      { label: '响应时限', value: '24h', trend: '工作日' },
    ],
    notices: ['AI 仅提供研判辅助', '重大事项必须人工复核', '输出含免责声明和信心度'],
    records: [
      { meta: 'ABS-REITs', status: 'active', title: '存量资产盘活路径研判' },
      { meta: '央国企融资', status: 'processing', title: '重点项目资金结构建议' },
      { meta: '产业基金', status: 'pending', title: '合作方清单和尽调框架' },
    ],
    title: '咨询入口',
  },
  dataReporting: {
    action: '生成报送包',
    description: '统一整理项目、资金、政策触达和企业服务数据，形成可审计报送材料。',
    emptyDescription: '暂无报送批次，请先选择统计周期和数据口径。',
    indicators: [
      { label: '本月报送', value: '6', trend: '已完成 4' },
      { label: '异常数据', value: '2', trend: '需复核' },
      { label: '脱敏覆盖', value: '100%', trend: '国产主路径' },
    ],
    notices: ['企业原文不得直接出境', '导出前记录审批人', '报送口径版本化'],
    records: [
      { meta: '月度报告', status: 'processing', title: '建筑企业服务成效报送' },
      { meta: '政策触达', status: 'completed', title: '惠企政策匹配统计' },
      { meta: '项目寻源', status: 'pending', title: '双向寻源脱敏台账' },
    ],
    title: '数据报送',
  },
  documents: {
    action: '生成公文',
    description: '生成通知、纪要、调研报告、讲话稿和一案两书，输出带水印可追溯。',
    emptyDescription: '暂无公文草稿，请选择模板或从政策材料生成初稿。',
    indicators: [
      { label: '草稿', value: '14', trend: '5 件待复核' },
      { label: '模板', value: '36', trend: '单位专属' },
      { label: '水印覆盖', value: '100%', trend: '可追溯' },
    ],
    notices: ['公文发布前需人工确认', '自动保留版本记录', '敏感字段默认脱敏'],
    records: [
      { meta: '调研纪要', status: 'active', title: '建筑企业融资难点座谈会纪要' },
      { meta: '通知', status: 'pending', title: '专项资金申报材料补正提醒' },
      { meta: '讲话稿', status: 'processing', title: '产业项目签约活动发言稿' },
    ],
    title: '公文矩阵',
  },
  documentTemplates: {
    action: '新建模板',
    description: '管理单位常用公文模板、语气规范、红头占位和审批节点。',
    emptyDescription: '暂无自定义模板，可从平台模板库复制后调整。',
    indicators: [
      { label: '启用模板', value: '22', trend: '6 类场景' },
      { label: '待审核', value: '4', trend: '办公室复核' },
      { label: '引用次数', value: '186', trend: '近 30 天' },
    ],
    notices: ['模板变更需留痕', '正文变量强校验', '敏感抬头不可外传'],
    records: [
      { meta: '一案两书', status: 'active', title: '政策资金项目建议书模板' },
      { meta: '调研', status: 'completed', title: '企业走访调研纪要模板' },
      { meta: '通知', status: 'pending', title: '材料补正通知模板' },
    ],
    title: '公文模板',
  },
  funds: {
    action: '匹配资金',
    description: '按企业条件、政策窗口、资金方向和材料成熟度进行资金地图匹配。',
    emptyDescription: '暂无资金匹配结果，请先选择行业、区域和申报周期。',
    indicators: [
      { label: '可申报', value: '27', trend: '本季度' },
      { label: '重点资金', value: '6', trend: '建议跟进' },
      { label: '材料缺口', value: '13', trend: '可生成清单' },
    ],
    notices: ['只做辅助匹配', '申报结果不作承诺', '材料建议需人工确认'],
    records: [
      { meta: '智能建造', status: 'active', title: '省级专项资金匹配' },
      { meta: '绿色施工', status: 'processing', title: '节能改造补贴窗口' },
      { meta: '专精特新', status: 'pending', title: '企业资质材料补齐建议' },
    ],
    title: '资金地图',
  },
  fundsCalendar: {
    action: '订阅提醒',
    description: '跟踪资金申报窗口、材料截止日、现场核查和结果公示节点。',
    emptyDescription: '暂无资金日程，订阅政策后自动生成关键节点。',
    indicators: [
      { label: '申报窗口', value: '9', trend: '30 天内' },
      { label: '截止提醒', value: '5', trend: '需跟进' },
      { label: '公示批次', value: '3', trend: '已收藏' },
    ],
    notices: ['时间节点支持多渠道提醒', '材料清单可一键生成', '错过窗口会提示替代路径'],
    records: [
      { meta: '5/22 截止', status: 'active', title: '建筑业数字化转型专项' },
      { meta: '6/01 开始', status: 'pending', title: '中小企业技改补贴' },
      { meta: '已公示', status: 'completed', title: '绿色建造示范项目名单' },
    ],
    title: '资金日历',
  },
  policy: {
    action: '订阅政策',
    description: '学习、收藏、订阅政策，并评估政策对本单位服务企业的影响。',
    emptyDescription: '暂无政策收藏，请从政策库选择重点方向。',
    indicators: [
      { label: '新政策', value: '18', trend: '近 7 天' },
      { label: '已解读', value: '12', trend: '含影响分析' },
      { label: '订阅主题', value: '7', trend: '自动跟踪' },
    ],
    notices: ['政策解读带来源链接', '影响分析标注置信度', '重大事项建议专家复核'],
    records: [
      { meta: '住建方向', status: 'active', title: '智能建造试点城市申报口径' },
      { meta: '财政方向', status: 'processing', title: '专项债项目绩效管理要求' },
      { meta: '营商环境', status: 'completed', title: '涉企服务一站式办理机制' },
    ],
    title: '政策学习',
  },
  projects: {
    action: '新建项目',
    description: '管理项目线索、企业诉求、政府资源和双向脱敏沟通记录。',
    emptyDescription: '暂无项目线索，请从寻源或资金匹配结果转入。',
    indicators: [
      { label: '项目线索', value: '42', trend: '8 个重点' },
      { label: '推进中', value: '16', trend: '本周更新' },
      { label: '风险提示', value: '3', trend: '需复核' },
    ],
    notices: ['项目沟通默认脱敏', '关键节点保留见证痕迹', '跨部门协同走审批'],
    records: [
      { meta: '产业园配套', status: 'active', title: '装配式建筑示范项目' },
      { meta: '城市更新', status: 'processing', title: '老旧小区改造施工资源匹配' },
      { meta: '绿色建造', status: 'pending', title: '低碳材料供应链对接' },
    ],
    title: '项目寻源',
  },
  projectMatching: {
    action: '运行匹配',
    description: '根据企业能力、项目条件、区域约束和合规边界进行项目匹配。',
    emptyDescription: '暂无匹配结果，请补充项目条件和企业画像。',
    indicators: [
      { label: '匹配企业', value: '58', trend: '脱敏展示' },
      { label: '高匹配', value: '12', trend: '建议沟通' },
      { label: '冲突排除', value: '7', trend: '合规过滤' },
    ],
    notices: ['不展示敏感原文', '匹配解释可追溯', '人工确认后再建立联系'],
    records: [
      { meta: '匹配 91%', status: 'active', title: '智能建造总包能力匹配' },
      { meta: '匹配 86%', status: 'processing', title: '绿色施工供应链匹配' },
      { meta: '待补条件', status: 'pending', title: '园区改造项目企业筛选' },
    ],
    title: '项目匹配',
  },
  reports: {
    action: '生成报告',
    description: '输出政策触达、资金匹配、项目寻源和企业服务成效报告。',
    emptyDescription: '暂无报告，请选择周期和报表口径后生成。',
    indicators: [
      { label: '报告模板', value: '18', trend: '政企版' },
      { label: '本月生成', value: '24', trend: '+31%' },
      { label: '待复核', value: '5', trend: '含敏感数据' },
    ],
    notices: ['报告含免责声明', '导出前做脱敏检查', '可配置联合品牌封面'],
    records: [
      { meta: '月度', status: 'active', title: '建筑企业服务成效报告' },
      { meta: '专题', status: 'processing', title: '政策资金匹配专题报告' },
      { meta: '归档', status: 'completed', title: '项目寻源季度复盘' },
    ],
    title: '报告中心',
  },
  settings: {
    action: '保存配置',
    description: '配置单位信息、审批链路、通知渠道、数据脱敏和权限边界。',
    emptyDescription: '暂无自定义配置，请先完成单位和审批角色初始化。',
    indicators: [
      { label: '审批角色', value: '9', trend: '已启用' },
      { label: '通知渠道', value: '4', trend: '站内/短信/企微' },
      { label: '脱敏规则', value: '12', trend: '国产主路径' },
    ],
    notices: ['权限变更写审计', '敏感配置需双人复核', '可导出配置快照'],
    records: [
      { meta: '权限', status: 'active', title: '办公室审批角色配置' },
      { meta: '安全', status: 'completed', title: '数据脱敏规则启用' },
      { meta: '通知', status: 'pending', title: '资金窗口提醒策略' },
    ],
    title: '单位设置',
  },
  sourcing: {
    action: '发布寻源',
    description: '以脱敏方式连接企业需求、项目机会、政策资源和专业服务。',
    emptyDescription: '暂无寻源任务，请从项目或政策资金场景发起。',
    indicators: [
      { label: '寻源任务', value: '15', trend: '4 个重点' },
      { label: '脱敏沟通', value: '36', trend: '近 30 天' },
      { label: '见证留痕', value: '100%', trend: '已启用' },
    ],
    notices: ['双向脱敏沟通', '平台留痕见证', '敏感项目需人工审核'],
    records: [
      { meta: '企业找项目', status: 'active', title: '市政配套施工资源对接' },
      { meta: '项目找企业', status: 'processing', title: '园区改造候选企业筛选' },
      { meta: '专业服务', status: 'pending', title: '合规体检服务推荐' },
    ],
    title: '双向寻源',
  },
} as const satisfies Record<string, GovModulePageCopy>;
