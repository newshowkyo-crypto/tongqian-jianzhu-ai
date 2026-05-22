import { type ReactNode } from 'react';

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
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] shadow-md lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6 bg-[var(--surface-container-low)] p-8">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-[var(--primary)] text-lg font-semibold text-white">{mark}</div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">同乾方略</p>
              <p className="text-base font-semibold text-[var(--text-primary)]">{brand}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-9 text-[var(--text-primary)]">{title}</h1>
            <p className="max-w-md text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
          </div>
          <div className="grid gap-4 text-sm text-[var(--text-secondary)]">
            {['统一身份与审计链路', '经营数据自动归集', 'AI 风险提示与下一步动作'].map((item) => (
              <div key={item} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">{item}</div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center p-8">
          <div className="space-y-6 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-[var(--primary)]">安全登录</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">开发环境使用一键进入，生产环境接入统一认证与二次校验。</p>
            </div>
            <Button className="min-h-11 w-full bg-[var(--accent-rose)] text-[var(--text-primary)] hover:bg-rose-deep" disabled={pending} onClick={onLogin}>
              {pending ? '登录中...' : '进入工作台'}
            </Button>
            <p className="text-xs leading-5 text-[var(--text-secondary)]">{footer}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
