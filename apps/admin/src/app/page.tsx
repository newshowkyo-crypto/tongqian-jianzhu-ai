import { zhCN } from '../i18n/zh-CN';

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-900">
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-card">
        <p className="text-sm font-medium text-primary-700">{zhCN.home.title}</p>
      </section>
    </main>
  );
}
