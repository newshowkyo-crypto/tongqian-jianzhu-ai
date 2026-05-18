export const zhCN = {
  credentialsPage: {
    approval: {
      approver: '审批人：PLATFORM_OWNER',
      field: '审批流 ID',
      required: '切换到真实凭证时必须走审批流',
      title: '审批流',
    },
    audit: {
      rows: ['credential.upsert', 'system_config.sync', 'audit_log.write'],
      title: '审计日志',
    },
    form: {
      key: '凭证 Key',
      mock: 'mock',
      mode: '凭证模式',
      operator: '操作人',
      provider: 'Provider',
      real: 'real',
      reason: '变更原因',
      submit: '提交替换申请',
      value: '真实凭证值',
    },
    hotUpdate: {
      items: ['写入 system_configs.credentials.*', '60 秒内热更新 provider 配置', '失败自动回退到 mock provider'],
      title: 'system_configs 热更新',
    },
    table: {
      approval: '审批状态',
      key: 'Key',
      mode: '模式',
      provider: 'Provider',
      updatedAt: '更新时间',
    },
    title: '系统配置 · 凭证管理',
    warning: '真实凭证只允许通过后台表单录入，不写入代码、不进入 Git。',
  },
  home: {
    credentials: {
      approval: '审批状态',
      mode: 'mock / real',
      title: '系统配置 · 凭证管理',
    },
    modules: ['业务运营', '规则审核', 'Prompt 管理', '模型路由', '审批工作台', '财务对账', '系统日志'],
    title: '同乾方略 · 平台后台',
  },
} as const;
