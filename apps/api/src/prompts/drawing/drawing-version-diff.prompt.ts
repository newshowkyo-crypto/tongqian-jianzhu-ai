export const drawingVersionDiffPrompt = {
  fallback: '若版本来源、页码或比例不一致，先要求人工复核，不输出定量差异。',
  fewShots: [
    { input: '梁截面 300x600 改为 350x650', output: '列为结构工程量变化，提示混凝土和钢筋复核。' },
    { input: '材料说明 C30 改 C35', output: '列为质量和成本影响，提示同步预算清单。' },
    { input: '门窗编号调整', output: '列为建筑专业清单变化，提示门窗表联动。' },
    { input: '局部未显示旧版', output: '标记证据不足，不判断是否变更。' },
  ],
  taskType: 'DRAWING_VERSION_DIFF',
  user: '对比两版图纸截图和批注，输出变更位置、影响专业、工程量影响和复核动作。',
  version: 'v1',
};
