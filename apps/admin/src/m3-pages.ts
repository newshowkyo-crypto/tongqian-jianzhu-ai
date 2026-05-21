export interface AdminModulePageCopy {
  readonly action: string;
  readonly description: string;
  readonly focus: readonly string[];
  readonly title: string;
}

export const adminModulePages = {
  agents: {
    action: '复核资质',
    description: '管理智能管家实名、等级、培训、信誉分、接单权限和客户保护期。',
    focus: ['等级与信誉', '培训状态', '接单权限'],
    title: '智能管家管理',
  },
  approvals: {
    action: '处理审批',
    description: '统一处理凭证替换、退款、权限变更、模型路由和数据导出审批。',
    focus: ['platform-owner 审批', '双人复核', '审计留痕'],
    title: '审批工作台',
  },
  audit: {
    action: '导出日志',
    description: '查询平台关键动作、配置变更、AI 调用、凭证审批和数据导出审计日志。',
    focus: ['不可删除', '按租户过滤', 'traceId 追踪'],
    title: '系统日志',
  },
  billing: {
    action: '发起对账',
    description: '核对订阅、点数、充值、分润、退款和发票流水。',
    focus: ['日终对账', '异常差异', '退款扣回'],
    title: '财务对账',
  },
  config: {
    action: '保存配置',
    description: '维护 system_configs 中的开关、阈值、模板版本和运营参数。',
    focus: ['热更新', '回滚版本', '审批后生效'],
    title: '系统配置',
  },
  credits: {
    action: '调整点数',
    description: '查看点数消耗、冻结、补偿、退款退回和异常扣点。',
    focus: ['BR-405', '幂等扣点', '补偿审批'],
    title: '点数账本',
  },
  dataExports: {
    action: '审批导出',
    description: '审批和追踪数据导出、脱敏、出境授权和季度报告。',
    focus: ['导出授权', '脱敏检查', '季度自查'],
    title: '数据导出',
  },
  featureFlags: {
    action: '切换开关',
    description: '管理 M1-M3 关闭 PARTNER、灰度范围和实验开关。',
    focus: ['FEATURE_FLAG_PARTNER_ENABLED=false', '灰度名单', '回滚'],
    title: '功能开关',
  },
  gov: {
    action: '新建单位',
    description: '管理政企租户、审批链路、单位用户、报送口径和数据边界。',
    focus: ['单位租户', '审批角色', '数据边界'],
    title: '政企租户',
  },
  incidents: {
    action: '创建事件',
    description: '记录生产事件、安全告警、支付异常和模型故障处理过程。',
    focus: ['严重级别', '恢复时限', '复盘结论'],
    title: '事件中心',
  },
  jobs: {
    action: '重跑任务',
    description: '监控 cron、队列、月度自检、报表生成和异步任务。',
    focus: ['重试次数', '死信队列', '月度自检'],
    title: '任务队列',
  },
  models: {
    action: '调整路由',
    description: '管理阿里百炼 qwen3-max / qwen3-vl-max 与 DeepSeek deepseek-reasoner 国产双主路径。',
    focus: ['主备模型', '成本阈值', '失败切换'],
    title: '模型路由',
  },
  notifications: {
    action: '发送测试',
    description: '配置站内信、企微、短信、公众号模板和反感推送反馈。',
    focus: ['频率控制', '退订反馈', '模板审批'],
    title: '通知中心',
  },
  opportunities: {
    action: '审核机会',
    description: '监控机会雷达、客户推送、风险红灯和高端咨询转化。',
    focus: ['价值密度', '风险分层', '咨询转化'],
    title: '机会运营',
  },
  orders: {
    action: '查看派单',
    description: '运营派单大厅、归属池、跨域池、公开抢单和验收状态。',
    focus: ['客户保护期', '抢单质量', '验收节点'],
    title: '派单运营',
  },
  operations: {
    action: '刷新看板',
    description: '查看平台核心运营指标、租户健康、AI 成本和服务质量。',
    focus: ['OPC 指标', '红线监控', '服务质量'],
    title: '业务运营',
  },
  promptTests: {
    action: '运行测试',
    description: '维护 29-prompt-testing 黄金测试集、语义相似度和专家待办。',
    focus: ['≥0.7 相似度', '专家内容占位', '回归报告'],
    title: 'Prompt 测试',
  },
  prompts: {
    action: '发布版本',
    description: '管理 Prompt 版本、变量、fallback、价值密度自检和输出 4 要素。',
    focus: ['版本化', '价值密度 6 题', '强制 4 要素'],
    title: 'Prompt 管理',
  },
  refunds: {
    action: '审核退款',
    description: '处理退款政策、服务争议、分润扣回和点数退回。',
    focus: ['BR-104', '分润扣回', '客户保护'],
    title: '退款管理',
  },
  reports: {
    action: '生成报表',
    description: '平台经营、合规、红线、财务和客户成功报表中心。',
    focus: ['月度报告', '红线指标', '截图留档'],
    title: '运营报表',
  },
  rules: {
    action: '新增规则',
    description: '维护商业宪法、红线规则、防黑暗模式和权限策略。',
    focus: ['红线不可绕过', '防黑暗模式', '审批保护'],
    title: '规则审核',
  },
  risk: {
    action: '下发风控',
    description: '监控反薅、私下交易、成本异常、客户信誉和智能管家服务质量风险。',
    focus: ['反薅命中', '私下交易', '成本异常'],
    title: '风控仪表盘',
  },
  security: {
    action: '查看告警',
    description: '监控跨租户、敏感数据、API Key、越权和海外模型脱敏风险。',
    focus: ['跨租户拦截', '密钥扫描', '出境脱敏'],
    title: '安全中心',
  },
  systemConfig: {
    action: '热更新配置',
    description: '管理 system_configs、配置历史、Redis 失效广播和高敏感 key 审批锁。',
    focus: ['配置热更新', '版本回滚', '审批锁'],
    title: '系统配置中心',
  },
  caseMarket: {
    action: '审核案例',
    description: '审核智能管家 UGC 案例，完成 AI 预审、专家复核、上架奖励和抄袭检测。',
    focus: ['AI 预审', '专家复核', '奖励发放'],
    title: '案例市场审核',
  },
  policyFunds: {
    action: '立即扫描',
    description: '维护 30+ 政策资金、待审池、增量扫描、专家审核和 5/25/50/100% 灰度发布。',
    focus: ['政策扫描', '待审池', '灰度发布'],
    title: '政策资金管理',
  },
  addictionConfig: {
    action: '调整钩子',
    description: '管理 16 个上瘾机制开关、阈值、抽点概率、奖励配置和反黑暗模式。',
    focus: ['16 钩子', '奖励阈值', '可关闭'],
    title: '上瘾机制配置',
  },
  rewardClaims: {
    action: '清算奖励',
    description: '处理点数、实物、现金奖励的审批、物流、对公转账和个税代扣。',
    focus: ['点数入账', '实物物流', '个税代扣'],
    title: '奖励清算',
  },
  services: {
    action: '配置服务',
    description: '维护十类同乾方略高端服务、价格、预约和转化漏斗。',
    focus: ['服务货架', '咨询预约', '转化漏斗'],
    title: '服务货架',
  },
  subscriptions: {
    action: '调整套餐',
    description: '管理 trial、39、199、499、999 订阅档和复活窗策略。',
    focus: ['套餐状态机', '阶梯折扣', '复活窗'],
    title: '订阅套餐',
  },
  tenants: {
    action: '新建租户',
    description: '管理建筑老板、政企、智能管家和平台后台多租户。',
    focus: ['租户隔离', '套餐状态', '管理员'],
    title: '租户管理',
  },
  users: {
    action: '邀请用户',
    description: '管理用户、角色、权限点、登录状态和 401/403 路由守卫。',
    focus: ['角色权限', '登录状态', '审计日志'],
    title: '用户与权限',
  },
} as const satisfies Record<string, AdminModulePageCopy>;
