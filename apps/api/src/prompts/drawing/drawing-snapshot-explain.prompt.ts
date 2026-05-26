export const drawingSnapshotExplainPrompt = {
  fallback: '无法确认图纸比例或轴网时，只输出需要人工复核的观察，不做施工结论。',
  fewShots: [
    { input: '结构平面图 A-3 轴梁标注不清', output: '先核对轴网、梁号、截面尺寸，再标出影响工程量的疑点。' },
    { input: '建筑首层 PDF 截图', output: '识别门窗洞口、层高、主要材料，并提示需设计单位确认。' },
    { input: '机电综合管线截图', output: '按专业拆分冲突点，优先列明净高和交叉位置。' },
    { input: '变更版图纸局部', output: '只解释新版截图里可见变化，不外推未显示区域。' },
  ],
  taskType: 'DRAWING_SNAPSHOT_EXPLAIN',
  user: '请基于图纸截图、页码、比例尺、轴网、批注和项目阶段，给出可执行但需复核的图纸快照解释。',
  version: 'v1',
};
