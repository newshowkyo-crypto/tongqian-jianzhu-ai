export const zhCN = {
  chat: {
    actions: { consult: '专家咨询', execute: '自己执行', govActions: ['自己执行', '申请同乾方略', '专家咨询'], tongqian: '申请同乾方略' },
    input: '输入个人合同、证书、考试政策或办公问题',
    title: '个人办公 AI 助手',
  },
  home: {
    eyebrow: '个人办公',
    meta: {
      consult: '个人咨询入口，复杂事项转人工复核。',
      docs: '个人合同、简历、证书材料和常用文档。',
      policy: '考试政策、继续教育、证书到期提醒。',
      projects: '个人事项和资料库。',
      sourcing: '个人机会和考试提醒。',
    },
    modules: { consult: '咨询入口', docs: '个人文档', policy: '政策提醒', projects: '个人事项', sourcing: '机会提醒' },
    title: '同乾方略 · 个人办公',
  },
  navigation: {
    current: '当前页面',
    home: '个人首页',
    items: [
      { href: '/', icon: 'policy', label: '个人首页' },
      { href: '/documents', icon: 'docs', label: '个人文档' },
      { href: '/assistant', icon: 'consult', label: 'AI 助手' },
      { href: '/personal/cert-monitor', icon: 'projects', label: '证书监控' },
    ],
    notifications: '通知',
    search: '搜索证书、合同、考试政策',
    tenant: '个人用户',
    theme: '主题',
  },
  states: { errorDescription: '服务暂时不可用，请稍后重试。', errorTitle: '加载失败', loading: '数据加载中', retry: '重试' },
  auth: {
    forbiddenDescription: '当前账号没有访问个人办公的权限。',
    forbiddenTitle: '无权访问',
    loginAction: '进入个人办公',
    loginDescription: '开发环境会写入模拟登录 Cookie。',
    loginTitle: '登录个人办公',
  },
} as const;
