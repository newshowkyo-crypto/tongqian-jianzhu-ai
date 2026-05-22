'use client';

import { Button } from '@tongqian/ui';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { zhCN } from '../../i18n/zh-CN';

export default function LoginPage() {
  const params = useSearchParams();
  const next = params.get('next') ?? '/dashboard';
  const [pending, setPending] = useState(false);

  function login() {
    if (pending) return;
    setPending(true);
    const expires = 60 * 60 * 24 * 7;
    document.cookie = `tq_auth_token=dev-web; path=/; max-age=${expires}; SameSite=Lax`;
    document.cookie = `tq_role=owner; path=/; max-age=${expires}; SameSite=Lax`;
    window.location.replace(next);
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-navy-deepest px-4">
      <div aria-hidden className="absolute inset-0 bg-[var(--gradient-navy-hero)] opacity-90" />
      <div aria-hidden className="absolute inset-x-8 top-16 h-px bg-silver-main/30" />
      <section className="relative w-full max-w-md rounded-xl border border-silver-main/30 bg-white/5 p-8 shadow-md backdrop-blur">
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-rose-main/20 text-rose-light">
            <span className="text-lg font-semibold">同</span>
          </div>
          <div>
            <p className="text-xs text-silver-light">同乾方略</p>
            <p className="text-sm font-semibold text-white">建筑 AI 经营管家</p>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-white">{zhCN.auth.loginTitle}</h1>
        <p className="mt-2 text-sm leading-6 text-silver-light">{zhCN.auth.loginDescription}</p>
        <Button className="mt-6 min-h-11 w-full bg-rose-main text-navy-deepest hover:bg-rose-deep" disabled={pending} onClick={login}>
          {pending ? '登录中...' : zhCN.auth.loginAction}
        </Button>
        <p className="mt-5 text-xs leading-6 text-silver-light">老板端默认直达经营大盘，生产环境将接入统一认证。</p>
      </section>
    </main>
  );
}
