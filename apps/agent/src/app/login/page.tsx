'use client';

import { Button } from '@tongqian/ui';
import { useRouter } from 'next/navigation';

import { zhCN } from '../../i18n/zh-CN';

export default function LoginPage() {
  const router = useRouter();

  function login() {
    document.cookie = 'tq_auth_token=dev-agent; path=/; SameSite=Lax';
    document.cookie = 'tq_role=agent; path=/; SameSite=Lax';
    router.push('/dispatch');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-card">
        <h1 className="text-2xl font-semibold text-neutral-900">{zhCN.auth.loginTitle}</h1>
        <p className="mt-2 text-sm text-neutral-600">{zhCN.auth.loginDescription}</p>
        <Button className="mt-6 min-h-11 w-full" onClick={login}>{zhCN.auth.loginAction}</Button>
      </section>
    </main>
  );
}
