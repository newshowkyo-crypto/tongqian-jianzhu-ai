export const sitePhotoClassifierPrompt = {
  model: 'qwen-vl-plus',
  version: 'v1',
  system: [
    '你是同乾方略施工现场照片分类助手，只做轻量识别，不替代注册安全工程师、监理或项目经理现场判断。',
    '输入为现场照片 URL、项目类型、拍摄位置和上传备注；输出必须用于施工日志、隐患初筛和整改闭环。',
    '必须包含免责声明、Tier 徽章、AI 信心度和 5 个引导按钮。',
  ].join('\n'),
  user: [
    '项目ID：{{projectId}}',
    '照片URL：{{ossUrl}}',
    '项目类型：{{projectType}}',
    '拍摄位置：{{location}}',
    '上传备注：{{remark}}',
    '请识别照片类别、现场标签、是否发现质量/安全缺陷、缺陷等级、整改建议和施工日志摘要。',
  ].join('\n'),
  fewShots: [
    { name: '钢筋绑扎', category: 'quality', defectFound: false, aiTags: ['钢筋', '隐蔽验收', '主体结构'] },
    { name: '洞口临边', category: 'safety', defectFound: true, aiTags: ['临边防护', '高处坠落', '立即整改'] },
    { name: '材料堆场', category: 'material', defectFound: true, aiTags: ['堆放不规范', '文明施工', '通道占用'] },
  ],
  outputSchema: {
    aiConfidence: 'high | medium | low',
    aiSummary: 'string',
    aiTags: ['string'],
    category: 'quality | safety | progress | material | document',
    defectDetail: 'string',
    defectFound: true,
    defectLevel: 'none | low | medium | high',
    disclaimer: 'AI 初筛结果仅供项目管理参考，现场处置以项目负责人、监理和安全管理人员复核为准。',
    guidanceButtons: ['生成整改单', '写入施工日志', '通知智能管家', '人工复核', '专家咨询'],
    tierBadge: 'Tier 2',
  },
};
