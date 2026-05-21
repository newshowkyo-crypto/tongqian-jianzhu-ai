'use client';

export type OwnerPersonaId = 'analyst' | 'lawyer' | 'serious' | 'warm';

export interface OwnerPersona {
  accent: string;
  avatar: string;
  description: string;
  id: OwnerPersonaId;
  model: 'deepseek-reasoner' | 'qwen3-max';
  name: string;
  systemPrompt: string;
}

export const ownerPersonas: OwnerPersona[] = [
  {
    accent: 'bg-primary-900 text-white',
    avatar: '顾',
    description: '西装、深蓝、克制，先讲经营判断和风险边界。',
    id: 'serious',
    model: 'deepseek-reasoner',
    name: '严肃顾问',
    systemPrompt: '你是严肃顾问。用董事会汇报口径回答，先结论、再证据、再动作，避免情绪化表达。',
  },
  {
    accent: 'bg-amber-50 text-amber-900',
    avatar: '同',
    description: '米色、暖金、共情，适合老板压力大时梳理优先级。',
    id: 'warm',
    model: 'qwen3-max',
    name: '温暖管家',
    systemPrompt: '你是温暖管家。先承接用户压力，再把事项拆成今天、三天内、本周可执行动作。',
  },
  {
    accent: 'bg-cyan-50 text-cyan-900',
    avatar: '析',
    description: '白衬衫、数据图表、一针见血，适合 KPI 和现金流判断。',
    id: 'analyst',
    model: 'qwen3-max',
    name: '干练分析师',
    systemPrompt: '你是干练分析师。用数据、阈值、排序和取舍回答，少寒暄，给出关键指标和下一步。',
  },
  {
    accent: 'bg-neutral-900 text-white',
    avatar: '律',
    description: '黑袍、卷宗、法条引用，适合合同条款和证据链问题。',
    id: 'lawyer',
    model: 'deepseek-reasoner',
    name: '资深律师',
    systemPrompt: '你是资深律师。引用《民法典》合同编、GF-2017-0201 和行业惯例，用“建议关注”表述。',
  },
];

export function PersonalitySelector({ onChange, value }: { onChange: (persona: OwnerPersona) => void; value: OwnerPersonaId }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {ownerPersonas.map((persona) => {
        const active = persona.id === value;
        return (
          <button
            key={persona.id}
            className={`min-h-[116px] rounded-lg border p-3 text-left transition-all ${
              active ? 'border-primary-500 bg-primary-50 shadow-card' : 'border-neutral-200 bg-white hover:border-primary-200'
            }`}
            onClick={() => onChange(persona)}
            type="button"
          >
            <span className={`grid h-10 w-10 place-items-center rounded-full text-sm font-semibold ${persona.accent}`}>{persona.avatar}</span>
            <span className="mt-3 block text-sm font-semibold text-neutral-950">{persona.name}</span>
            <span className="mt-1 block text-xs leading-5 text-neutral-500">{persona.description}</span>
          </button>
        );
      })}
    </div>
  );
}
