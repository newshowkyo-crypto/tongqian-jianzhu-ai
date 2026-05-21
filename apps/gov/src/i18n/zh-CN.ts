export const zhCN = {
  chat: {
    actions: {
      consult: '专家小时咨询',
      execute: '自己执行',
      tongqian: '申请同乾方略',
    },
    input: '仅触发政策、资金、公文和政企咨询相关任务',
    title: 'AI 全局经营助手',
  },
  home: {
    eyebrow: '政企独立工作台',
    meta: {
      consult: '复杂投融资与资产证券化入口，强制人工接管。',
      docs: '公文、讲话稿、纪要与调研报告生成，自动水印。',
      funds: '政策性资金日历、匹配、模板与一案两书。',
      policy: '政策学习、收藏、订阅与单位影响解读。',
      sourcing: '项目寻源、双向脱敏沟通与见证留痕。',
    },
    modules: {
      consult: '咨询入口',
      docs: '公文矩阵',
      funds: '资金地图',
      policy: '政策学习',
      sourcing: '项目寻源',
    },
    title: '同乾方略 · 政企工作台',
  },
  navigation: {
    current: '当前页面',
    home: '政企首页',
    notifications: '通知',
    search: '搜索政策、项目、资金、报告',
    tenant: '示范区管委会',
    theme: '主题',
    items: [
      { href: '/', icon: 'policy', label: '政策学习' },
      { href: '/documents', icon: 'docs', label: '公文矩阵' },
      { href: '/projects', icon: 'projects', label: '项目寻源' },
      { href: '/funds', icon: 'funds', label: '资金地图' },
      { href: '/consulting', icon: 'consult', label: '咨询入口' },
      { href: '/sourcing', icon: 'sourcing', label: '双向寻源' },
      { href: '/ingest-watch', icon: 'policy', label: 'Ingest watch' },
    ],
  },
  states: {
    errorDescription: '网络或服务暂时不可用，请稍后重试。',
    errorTitle: '加载失败',
    loading: '数据加载中',
    retry: '重试',
  },
  auth: {
    forbiddenDescription: '当前账号没有访问政企工作台的权限，请联系单位管理员。',
    forbiddenTitle: '无权访问',
    loginAction: '进入工作台',
    loginDescription: '开发环境会写入模拟登录 Cookie，生产环境接入统一认证。',
    loginTitle: '登录政企工作台',
  },
} as const;
