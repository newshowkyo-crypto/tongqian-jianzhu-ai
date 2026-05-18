import Link from 'next/link';

import { zhCN } from '../../i18n/zh-CN';

export default function ForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-danger-100 bg-white p-6 shadow-card">
        <h1 className="text-2xl font-semibold text-danger-700">{zhCN.auth.forbiddenTitle}</h1>
        <p className="mt-2 text-sm text-neutral-600">{zhCN.auth.forbiddenDescription}</p>
        <Link className="mt-6 inline-flex h-10 items-center rounded-md border border-neutral-300 px-4 text-sm font-medium" href="/login">{zhCN.auth.loginAction}</Link>
      </section>
    </main>
  );
}
