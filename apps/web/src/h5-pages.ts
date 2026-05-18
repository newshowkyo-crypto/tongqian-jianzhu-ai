export interface H5ReportCopy {
  readonly confidence: 'high' | 'low' | 'medium';
  readonly findings: readonly string[];
  readonly title: string;
  readonly tier: 1 | 2 | 3 | 4;
  readonly type: string;
}

export const h5Reports = {
  businessSummary: {
    confidence: 'high',
    findings: ['现金流风险处于黄色预警，建议优先跟进 3 个逾期回款项目。', '高端咨询机会来自集团重组和央国企融资两类场景。', '本周可执行动作已裁剪为老板视角 5 个按钮。'],
    tier: 2,
    title: '综合经营报告',
    type: '经营总览',
  },
  contractReview: {
    confidence: 'medium',
    findings: ['付款节点与验收条件绑定不够清晰，建议补充可量化验收标准。', '违约责任存在单方加重风险，需要人工复核。', '可先按 AI 清单自行标注，再申请智能管家线下跑办。'],
    tier: 3,
    title: '合同审查 H5',
    type: '合同审查',
  },
  policyFund: {
    confidence: 'high',
    findings: ['当前企业画像匹配 4 个政策资金窗口。', '材料缺口集中在纳税证明、项目绩效和专利佐证。', '建议 7 天内完成第一批材料归集。'],
    tier: 2,
    title: '政策资金 H5',
    type: '政策资金',
  },
  qualificationUpgrade: {
    confidence: 'medium',
    findings: ['资质升级路径建议从人员证书和业绩证明两端同步推进。', '窗口材料需保留原件扫描和递交回执。', '若遇临场补正，可转智能管家线下兜底。'],
    tier: 2,
    title: '资质升级 H5',
    type: '资质护航',
  },
  tenderFramework: {
    confidence: 'high',
    findings: ['标书框架建议突出类似业绩、项目班子和风险控制。', '资格条件缺口有 2 项，投标前需确认原件。', '报价策略处于黄色区间，建议人工复核。'],
    tier: 3,
    title: '标书框架 H5',
    type: '标书框架',
  },
} as const satisfies Record<string, H5ReportCopy>;

export const wechatMenuConfig = {
  buttons: [
    { name: '产品', path: '/dashboard', type: 'view' },
    { name: '智能管家', path: '/h5/invite', type: 'view' },
    { name: '案例', path: '/reports/history', type: 'view' },
  ],
  oauth: {
    mode: 'silent',
    scope: 'snsapi_base',
    stateKey: 'wechat_oauth_state',
  },
} as const;
