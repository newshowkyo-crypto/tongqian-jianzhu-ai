export interface AgentModulePageCopy {
  readonly action: string;
  readonly description: string;
  readonly emptyDescription: string;
  readonly highlights: readonly string[];
  readonly metrics: readonly { label: string; value: string; trend: string }[];
  readonly primaryList: readonly { meta: string; status: 'active' | 'completed' | 'pending' | 'processing'; title: string }[];
  readonly title: string;
}

export const agentModulePages = {
  appeals: {
    action: '提交申诉',
    description: '集中处理扣分、低评、服务争议和平台复核请求，保留完整证据链。',
    emptyDescription: '暂无待处理申诉，出现争议时请先补充客户沟通记录和执行凭证。',
    highlights: ['证据材料完整度', '平台复核时限', '客户保护期校验'],
    metrics: [
      { label: '本月申诉', value: '3', trend: '2 件已完结' },
      { label: '平均响应', value: '4.5h', trend: '低于 8 小时 SLA' },
      { label: '追回信誉', value: '+35', trend: '近 30 天' },
    ],
    primaryList: [
      { meta: '客户低评复核', status: 'processing', title: '湖北宏建合同现场协助评价争议' },
      { meta: '资料补齐中', status: 'pending', title: '西安城投窗口跑办材料时限申诉' },
      { meta: '平台已通过', status: 'completed', title: '苏州建安资质材料预审评分修正' },
    ],
    title: '申诉中心',
  },
  calendar: {
    action: '同步日程',
    description: '把窗口跑办、客户回访、培训任务和提现节点合并到一张执行日历。',
    emptyDescription: '暂无日程冲突，请继续保持按时响应和服务记录回填。',
    highlights: ['今日窗口预约', '客户回访提醒', '培训截止时间'],
    metrics: [
      { label: '今日事项', value: '7', trend: '2 个高优先级' },
      { label: '本周回访', value: '12', trend: '完成 8 个' },
      { label: '逾期风险', value: '0', trend: '保持良好' },
    ],
    primaryList: [
      { meta: '09:30 合同面谈', status: 'active', title: '湖北宏建法务负责人线上复核' },
      { meta: '14:00 窗口材料', status: 'pending', title: '西安城投投标资料递交' },
      { meta: '18:00 客户回访', status: 'pending', title: '苏州建安满意度确认' },
    ],
    title: '服务日历',
  },
  cases: {
    action: '沉淀案例',
    description: '沉淀可复用的行业案例，形成智能管家的专业背书和客户转化素材。',
    emptyDescription: '暂无可发布案例，请优先选择客户授权且已脱敏的项目沉淀。',
    highlights: ['客户授权状态', '脱敏检查', '同乾方略推荐价值'],
    metrics: [
      { label: '案例库', value: '28', trend: '本月新增 5' },
      { label: '可公开', value: '9', trend: '已脱敏' },
      { label: '带来线索', value: '16', trend: '近 30 天' },
    ],
    primaryList: [
      { meta: '综合经营报告', status: 'completed', title: '区域建筑企业现金流预警与回款动作' },
      { meta: '政策资金', status: 'active', title: '专精特新补贴匹配与窗口跑办' },
      { meta: '合同审查', status: 'pending', title: '总包分包付款条款风险处置' },
    ],
    title: '案例库',
  },
  clients: {
    action: '新增客户',
    description: '维护客户保护期、服务偏好、跟进阶段和高端咨询转化机会。',
    emptyDescription: '暂无客户分组，请先从派单或邀请页沉淀客户线索。',
    highlights: ['7 天客户保护期', '服务偏好', '复购机会'],
    metrics: [
      { label: '保护客户', value: '18', trend: '7 天内' },
      { label: '本周回访', value: '11', trend: '已完成 8' },
      { label: '咨询机会', value: '4', trend: '建议转同乾方略' },
    ],
    primaryList: [
      { meta: '保护期剩 4 天', status: 'active', title: '湖北宏建工程' },
      { meta: '待回访', status: 'pending', title: '西安城投项目部' },
      { meta: '高端服务潜力', status: 'processing', title: '苏州建安集团' },
    ],
    title: '客户工作台',
  },
  commissions: {
    action: '查看规则',
    description: '展示分润来源、退款扣回、推荐费上限和平台结算规则。',
    emptyDescription: '暂无分润记录，接单成交后会自动生成可追踪流水。',
    highlights: ['退款扣回分润', '推荐费上限', '平台审计日志'],
    metrics: [
      { label: '本月分润', value: '¥18,420', trend: '+22%' },
      { label: '待确认', value: '¥3,600', trend: '2 笔订单' },
      { label: '扣回风险', value: '¥0', trend: '无退款争议' },
    ],
    primaryList: [
      { meta: 'ABS 咨询推荐', status: 'completed', title: '苏州建安高端服务分润' },
      { meta: '合同现场协助', status: 'active', title: '湖北宏建执行服务费' },
      { meta: '窗口跑办', status: 'pending', title: '西安城投待客户确认' },
    ],
    title: '分润明细',
  },
  earnings: {
    action: '申请提现',
    description: '跟踪可提现余额、冻结余额、发票状态和 T+N 结算周期。',
    emptyDescription: '暂无可提现款项，服务完成且客户确认后进入结算周期。',
    highlights: ['T+3 提现周期', '发票状态', '异常扣回提醒'],
    metrics: [
      { label: '可提现', value: '¥12,860', trend: 'T+3' },
      { label: '冻结中', value: '¥5,560', trend: '等待验收' },
      { label: '本月到账', value: '¥24,300', trend: '+18%' },
    ],
    primaryList: [
      { meta: '预计 5/21 到账', status: 'processing', title: '第 20260518-08 批提现' },
      { meta: '客户验收中', status: 'pending', title: '政策资金跑办服务费' },
      { meta: '已到账', status: 'completed', title: '合同审查现场协助分润' },
    ],
    title: '收益提现',
  },
  leaderboard: {
    action: '查看榜单规则',
    description: '用信誉、响应、成交和客户满意度形成健康榜单，避免单纯刺激抢单。',
    emptyDescription: '暂无榜单数据，完成首个服务周期后展示同区域排名。',
    highlights: ['防黑暗模式反馈', '质量优先', '同区域比较'],
    metrics: [
      { label: '区域排名', value: '#6', trend: '华中服务区' },
      { label: '满意度', value: '98%', trend: '高于均值' },
      { label: '响应速度', value: '12m', trend: '近 7 天' },
    ],
    primaryList: [
      { meta: 'LV5 首席', status: 'active', title: '武汉服务区 Top 3' },
      { meta: 'LV4 金牌', status: 'completed', title: '本周高质量服务榜' },
      { meta: '新星榜', status: 'pending', title: '连续成长智能管家' },
    ],
    title: '信誉榜单',
  },
  ordersActive: {
    action: '更新进度',
    description: '管理进行中的派单，确保每一步都有客户确认、凭证和平台审计。',
    emptyDescription: '暂无执行中的订单，请从派单大厅选择合适服务。',
    highlights: ['执行凭证', '客户确认', '风险升级'],
    metrics: [
      { label: '进行中', value: '6', trend: '2 个今日到期' },
      { label: '需复核', value: '1', trend: '合同条款风险' },
      { label: '已上传凭证', value: '84%', trend: '+9%' },
    ],
    primaryList: [
      { meta: '现场协助', status: 'active', title: '湖北宏建合同风险处置' },
      { meta: '窗口跑办', status: 'processing', title: '西安城投资料递交' },
      { meta: '资料预审', status: 'pending', title: '苏州建安资质升级' },
    ],
    title: '执行中订单',
  },
  ordersHistory: {
    action: '导出记录',
    description: '复盘历史订单、客户评分、分润状态和可复用服务经验。',
    emptyDescription: '暂无历史订单，完成服务后会自动归档到这里。',
    highlights: ['客户评分', '分润状态', '服务复盘'],
    metrics: [
      { label: '累计订单', value: '126', trend: '近 12 个月' },
      { label: '五星评价', value: '91%', trend: '+4%' },
      { label: '复购客户', value: '22', trend: '高价值' },
    ],
    primaryList: [
      { meta: '五星评价', status: 'completed', title: '政策资金申报材料跑办' },
      { meta: '已结算', status: 'completed', title: '投标资料窗口递交' },
      { meta: '已归档', status: 'completed', title: '合同条款现场协助' },
    ],
    title: '历史订单',
  },
  orders: {
    action: '去接单',
    description: '按待接单、执行中、验收中和已归档组织智能管家服务订单。',
    emptyDescription: '暂无订单变化，请关注跨域池和公开抢单机会。',
    highlights: ['订单状态', '验收节点', '服务凭证'],
    metrics: [
      { label: '待接单', value: '9', trend: '3 个优先推荐' },
      { label: '验收中', value: '4', trend: '48 小时内' },
      { label: '超时风险', value: '0', trend: '状态健康' },
    ],
    primaryList: [
      { meta: '优质客户', status: 'pending', title: '央国企融资材料初筛' },
      { meta: '执行中', status: 'active', title: '合同现场协助' },
      { meta: '验收中', status: 'processing', title: '资质升级材料预审' },
    ],
    title: '订单中心',
  },
  profile: {
    action: '完善资料',
    description: '维护服务地区、资质经验、案例背书和平台展示资料。',
    emptyDescription: '资料越完整，匹配分越高；请补齐服务地区和擅长领域。',
    highlights: ['服务地区', '资质背书', '案例证明'],
    metrics: [
      { label: '资料完整度', value: '92%', trend: '+8%' },
      { label: '擅长领域', value: '6', trend: '合同/资质/资金' },
      { label: '平台认证', value: 'LV4', trend: '金牌' },
    ],
    primaryList: [
      { meta: '已认证', status: 'completed', title: '建筑工程合同审查经验' },
      { meta: '待补充', status: 'pending', title: '政企窗口跑办案例' },
      { meta: '展示中', status: 'active', title: '华中服务区智能管家名片' },
    ],
    title: '个人资料',
  },
  settings: {
    action: '保存设置',
    description: '配置通知、接单偏好、隐私展示和反感推送反馈通道。',
    emptyDescription: '暂无自定义设置，建议先配置接单半径和通知偏好。',
    highlights: ['接单偏好', '通知频率', '反感推送反馈'],
    metrics: [
      { label: '接单半径', value: '80km', trend: '可跨域' },
      { label: '通知渠道', value: '3', trend: '站内/企微/短信' },
      { label: '安静时段', value: '22-8', trend: '已启用' },
    ],
    primaryList: [
      { meta: '已启用', status: 'active', title: '高价值派单即时提醒' },
      { meta: '可调整', status: 'pending', title: '公开抢单频率控制' },
      { meta: '合规保留', status: 'completed', title: '隐私展示和审计记录' },
    ],
    title: '设置中心',
  },
  shareCards: {
    action: '生成卡片',
    description: '生成收益、升级、客户邀请和服务推广卡片，帮助智能管家有面子地分享。',
    emptyDescription: '暂无可分享卡片，完成订单或等级升级后会自动生成。',
    highlights: ['二维码占位', '客户邀请', '收益日历'],
    metrics: [
      { label: '可用模板', value: '10', trend: '横版/竖版' },
      { label: '本周分享', value: '26', trend: '+12%' },
      { label: '带来注册', value: '8', trend: '近 7 天' },
    ],
    primaryList: [
      { meta: '朋友圈方图', status: 'active', title: '昨日入账收益日历卡' },
      { meta: '竖屏海报', status: 'completed', title: 'LV4 升级庆贺卡' },
      { meta: '邀请客户', status: 'pending', title: '客户邀请二维码卡片' },
    ],
    title: '分享卡片',
  },
  training: {
    action: '继续学习',
    description: '完成平台规则、客户保护、线下跑办和高端咨询转介培训。',
    emptyDescription: '暂无待学课程，请按月复训平台红线和服务标准。',
    highlights: ['6 节培训', '红线测验', '服务演练'],
    metrics: [
      { label: '完成课程', value: '5/6', trend: '剩余 18 分钟' },
      { label: '测验分', value: '96', trend: '可接高价值单' },
      { label: '复训到期', value: '12d', trend: '提前提醒' },
    ],
    primaryList: [
      { meta: '必修', status: 'active', title: '客户保护期与分润扣回规则' },
      { meta: '演练', status: 'processing', title: '窗口跑办异常处理' },
      { meta: '已完成', status: 'completed', title: 'AI 方案执行边界' },
    ],
    title: '培训中心',
  },
  withdrawals: {
    action: '发起提现',
    description: '查看提现申请、账户校验、税务资料和平台审批进度。',
    emptyDescription: '暂无提现申请，可提现余额满足门槛后即可发起。',
    highlights: ['账户校验', '税务资料', '审批进度'],
    metrics: [
      { label: '申请中', value: '2', trend: 'T+3' },
      { label: '本月提现', value: '¥21,800', trend: '+16%' },
      { label: '资料状态', value: '正常', trend: '已校验' },
    ],
    primaryList: [
      { meta: '平台审批', status: 'processing', title: '第 20260518-08 批提现' },
      { meta: '银行处理中', status: 'active', title: '第 20260515-04 批提现' },
      { meta: '已完成', status: 'completed', title: '第 20260510-03 批提现' },
    ],
    title: '提现记录',
  },
  workspace: {
    action: '打开工作台',
    description: '整合客户上下文、AI 方案、服务进度和待办协作，确保服务不脱节。',
    emptyDescription: '暂无工作台事项，请从订单或客户列表进入具体客户工作台。',
    highlights: ['客户上下文', 'AI 方案', '执行待办'],
    metrics: [
      { label: '活跃客户', value: '12', trend: '本周' },
      { label: '待办事项', value: '19', trend: '5 个今日到期' },
      { label: '风险升级', value: '1', trend: '需平台复核' },
    ],
    primaryList: [
      { meta: '合同审查', status: 'active', title: '湖北宏建客户工作台' },
      { meta: '投标材料', status: 'processing', title: '西安城投客户工作台' },
      { meta: '资质升级', status: 'pending', title: '苏州建安客户工作台' },
    ],
    title: '客户工作台',
  },
} as const satisfies Record<string, AgentModulePageCopy>;
