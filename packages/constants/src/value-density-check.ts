export const VALUE_DENSITY_CHECK = [
  { id: 'Q1', label: '点数成本', threshold: '客户单次点数成本通常不高于 3 元' },
  { id: 'Q2', label: '替代成本', threshold: '外部律师、顾问或咨询替代成本至少 10x' },
  { id: 'Q3', label: '主观价值', threshold: '客户应感觉花得值' },
  { id: 'Q4', label: '免费钩子', threshold: '免费输出价值不低于 50-100 点' },
  { id: 'Q5', label: '干货比例', threshold: '干货不低于 70%' },
  { id: 'Q6', label: '平台独有', threshold: '依赖平台数据、知识库或业务规则' },
] as const;

export const VALUE_DENSITY_THRESHOLDS = {
  dryContentRatio: 0.7,
  maxCreditCostCny: 3,
  replacementCostMultiplier: 10,
} as const;
