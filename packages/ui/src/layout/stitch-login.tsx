import { type ReactNode } from 'react';

import { Building2, Radar, Shield, Sparkles } from '../icons/index.js';
import { Button } from '../primitives/form.js';

export function StitchLoginShell({
  brand,
  description,
  footer,
  mark,
  onLogin,
  pending,
  title,
}: {
  brand: string;
  description: string;
  footer: string;
  mark: string;
  onLogin: () => void;
  pending: boolean;
  title: string;
}): ReactNode {
  const highlights = [
    { icon: Shield, text: '统一身份与审计链路' },
    { icon: Building2, text: '建筑经营数据自动归集' },
    { icon: Radar, text: 'AI 风险提示与下一步动作' },
  ];

  return (
    <main className="tq-camellia-login grid place-items-center px-4 py-8">
      <section className="tq-camellia-login-card relative z-10 grid w-full max-w-6xl overflow-hidden rounded-lg lg:grid-cols-[1.08fr_0.92fr]">
        <div className="tq-camellia-hero-panel space-y-8 p-8 lg:p-10">
          <div className="relative z-10 flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-lg border border-[rgba(255,250,247,0.22)] bg-[rgba(255,250,247,0.08)] text-lg font-semibold text-[#fffaf7] shadow-[var(--shadow-rose-glow)]">
              {mark}
            </div>
            <div>
              <p className="text-xs text-[#ead0c8]">同乾方略</p>
              <p className="text-base font-semibold text-[#fffaf7]">{brand}</p>
            </div>
          </div>
          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(234,208,200,0.28)] bg-[rgba(255,250,247,0.08)] px-3 py-1 text-xs font-medium text-[#ead0c8]">
              <Sparkles className="h-3.5 w-3.5" />
              建筑业 AI × 高端战略咨询
            </div>
            <h1 className="max-w-xl text-3xl font-semibold leading-10 text-[#fffaf7] md:text-4xl md:leading-[3rem]">
              {title}
            </h1>
            <p className="max-w-lg text-sm leading-7 text-[#d8d3cc]">{description}</p>
            <div className="tq-camellia-login-line" />
          </div>
          <div className="relative z-10 grid gap-3 text-sm text-[#d8d3cc]">
            {highlights.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 rounded-lg border border-[rgba(216,211,204,0.2)] bg-[rgba(255,250,247,0.07)] p-4"
              >
                <span className="grid h-9 w-9 place-items-center rounded-md bg-[rgba(201,138,117,0.18)] text-[#ead0c8]">
                  <item.icon className="h-4 w-4" />
                </span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center bg-[rgba(255,250,247,0.72)] p-8 lg:p-10">
          <div className="space-y-6 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                <Shield className="h-4 w-4" />
                安全登录
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                开发环境使用一键进入，生产环境接入统一认证与二次校验。
              </p>
            </div>
            <Button
              className="min-h-11 w-full border border-[var(--accent-rose)] bg-[var(--primary)] text-[#fffaf7] shadow-[var(--shadow-rose-glow)] hover:bg-[#203a5d]"
              disabled={pending}
              onClick={onLogin}
            >
              {pending ? '登录中...' : '进入工作台'}
            </Button>
            <p className="text-xs leading-5 text-[var(--text-secondary)]">{footer}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
