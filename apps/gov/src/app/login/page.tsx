'use client';

import { Button } from '@tongqian/ui';
import { useRouter } from 'next/navigation';

import { zhCN } from '../../i18n/zh-CN';

export default function LoginPage() {
  const router = useRouter();

  function login() {
    document.cookie = 'tq_auth_token=dev-gov; path=/; SameSite=Lax';
    document.cookie = 'tq_role=gov_user; path=/; SameSite=Lax';
    router.push('/');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-neutral-300 bg-white p-6 shadow-card">
        <h1 className="text-2xl font-semibold text-neutral-950">{zhCN.auth.loginTitle}</h1>
        <p className="mt-2 text-sm text-neutral-600">{zhCN.auth.loginDescription}</p>
        <Button className="mt-6 min-h-11 w-full" onClick={login}>{zhCN.auth.loginAction}</Button>
      </section>
    </main>
  );
}
