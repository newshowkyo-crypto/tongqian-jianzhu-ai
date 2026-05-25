export interface AgentModulePageCopy {
  readonly action: string;
  readonly description: string;
  readonly emptyDescription: string;
  readonly highlights: readonly string[];
  readonly metrics: readonly { label: string; value: string; trend: string }[];
  readonly primaryList: readonly { meta: string; status: 'active' | 'completed' | 'pending' | 'processing'; title: string }[];
  readonly title: string;
}

const baseMetrics = [
  { label: '本周事项', value: '12', trend: '较上周 +3' },
  { label: '客户满意度', value: '98%', trend: '保持优秀' },
  { label: '风险提醒', value: '1', trend: '需要复核' },
] as const;

const baseList = [
  { meta: '高优先级', status: 'active', title: '湖北宏建合同现场协助' },
  { meta: '今日到期', status: 'processing', title: '西安城投资料窗口跑办' },
  { meta: '待客户确认', status: 'pending', title: '苏州建安资质材料预审' },
] as const;

function page(title: string, action: string, description: string): AgentModulePageCopy {
  return {
    action,
    description,
    emptyDescription: `${title}暂无待处理事项，请继续关注派单和客户服务记录。`,
    highlights: ['客户保护期', '执行凭证', '平台审计'],
    metrics: baseMetrics,
    primaryList: baseList,
    title,
  };
}

export const agentModulePages = {
  appeals: page('申诉中心', '提交申诉', '集中处理扣分、低评、服务争议和平台复核请求。'),
  calendar: page('服务日历', '同步日程', '合并窗口跑办、客户回访、培训任务和提现节点。'),
  cases: page('案例库', '沉淀案例', '沉淀可复用的行业案例，形成智能管家的专业背书。'),
  clients: page('客户工作台', '新增客户', '维护客户保护期、服务偏好、跟进阶段和咨询转化机会。'),
  commissions: page('分润明细', '查看规则', '展示分润来源、退款扣回、推荐费上限和结算规则。'),
  earnings: page('收益提现', '申请提现', '跟踪可提现余额、冻结余额、发票状态和结算周期。'),
  leaderboard: page('信誉榜单', '查看规则', '以信誉、响应、成交和满意度形成健康榜单。'),
  orders: page('订单中心', '去接单', '按待接单、执行中、验收中和已归档组织服务订单。'),
  ordersActive: page('执行中订单', '更新进度', '管理进行中的派单，确保每一步都有客户确认和凭证。'),
  ordersHistory: page('历史订单', '导出记录', '复盘历史订单、客户评分、分润状态和服务经验。'),
  profile: page('个人资料', '完善资料', '维护服务地区、资质经验、案例背书和平台展示资料。'),
  settings: page('设置中心', '保存设置', '配置通知、接单偏好、隐私展示和反馈通道。'),
  shareCards: page('分享卡片', '生成卡片', '生成收益、升级、客户邀请和服务推广卡片。'),
  training: page('培训中心', '继续学习', '完成平台规则、客户保护、线下跑办和咨询转介培训。'),
  withdrawals: page('提现记录', '发起提现', '查看提现申请、账户校验、税务资料和审批进度。'),
  workspace: page('客户工作台', '打开工作台', '整合客户上下文、AI 方案、服务进度和待办协作。'),
} as const satisfies Record<string, AgentModulePageCopy>;
