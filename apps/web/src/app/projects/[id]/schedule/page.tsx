'use client';

import { type ReactNode } from 'react';

const tasks = [
  { end: 18, name: '基础施工', progress: 70, start: 1, critical: true },
  { end: 34, name: '主体结构', progress: 30, start: 19, critical: true },
  { end: 42, name: '机电安装', progress: 10, start: 28, critical: false },
  { end: 56, name: '装饰收尾', progress: 0, start: 43, critical: true },
];

export default function ProjectSchedulePage(): ReactNode {
  return (
    <main className="min-h-screen bg-[#101820] p-6 text-white">
      <header className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">进度计划</h1><p className="text-sm text-white/60">甘特图 + 关键路径 + 滞后预警</p></div>
        <button className="rounded-md bg-[#d6ad60] px-4 py-2 text-black" type="button">AI 风险提示</button>
      </header>
      <svg className="mt-6 h-72 w-full rounded-md border border-white/15 bg-white/5" viewBox="0 0 900 280">
        {tasks.map((task, index) => {
          const x = task.start * 14;
          const width = (task.end - task.start) * 14;
          const y = 35 + index * 55;
          return <g key={task.name}><text fill="white" fontSize="14" x="24" y={y + 16}>{task.name}</text><rect fill={task.critical ? '#d65f5f' : '#5d8aa8'} height="22" rx="4" width={width} x={x + 150} y={y} /><rect fill="#d6ad60" height="22" rx="4" width={width * task.progress / 100} x={x + 150} y={y} /><text fill="white" fontSize="12" x={x + 160 + width} y={y + 16}>{task.progress}%</text></g>;
        })}
      </svg>
    </main>
  );
}
