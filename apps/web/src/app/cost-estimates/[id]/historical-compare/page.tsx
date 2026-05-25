'use client';

import { type ReactNode } from 'react';

const points = [{ x: 120, y: 180, name: '历史 A' }, { x: 260, y: 120, name: '历史 B' }, { x: 420, y: 150, name: '当前项目' }];

export default function HistoricalComparePage(): ReactNode {
  return (
    <main className="min-h-screen bg-[#101820] p-6 text-white">
      <h1 className="text-2xl font-semibold">历史项目造价对比</h1>
      <svg className="mt-6 h-72 w-full rounded-md border border-white/15 bg-white/5" viewBox="0 0 640 260">
        <line stroke="white" strokeOpacity=".3" x1="60" x2="600" y1="220" y2="220" />
        <line stroke="white" strokeOpacity=".3" x1="60" x2="60" y1="20" y2="220" />
        {points.map((point) => <g key={point.name}><circle cx={point.x} cy={point.y} fill={point.name.includes('当前') ? '#d6ad60' : '#5d8aa8'} r="8" /><text fill="white" fontSize="12" x={point.x + 12} y={point.y + 4}>{point.name}</text></g>)}
      </svg>
      <button className="mt-4 rounded-md bg-[#d6ad60] px-4 py-2 text-black" type="button">AI 解读</button>
    </main>
  );
}
