'use client';

import { Building2, Shield, Sparkles, UserCheck } from '@tongqian/ui';
import { useSearchParams } from 'next/navigation';
import { type ComponentType, useMemo, useState } from 'react';

type RoleKey = 'boss' | 'agent' | 'gov' | 'admin';

interface RoleOption {
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  key: RoleKey;
  label: string;
  role: string;
  token: string;
}

const defaultRole: RoleOption = {
  description: '企业经营、风险雷达、合同审查、报告中心',
  href: '/Boss/dashboard',
  icon: Building2,
  key: 'boss',
  label: '企业主老板端',
  role: 'owner',
  token: 'dev-web',
};

const roleOptions: RoleOption[] = [
  defaultRole,
  {
    description: '线下跑腿、客户跟进、服务订单与佣金',
    href: '/agent/dashboard',
    icon: UserCheck,
    key: 'agent',
    label: '智能管家端',
    role: 'agent',
    token: 'dev-agent',
  },
  {
    description: '政策项目、招商服务、政企协同工作台',
    href: '/gov/dashboard',
    icon: Shield,
    key: 'gov',
    label: '政企服务端',
    role: 'gov_user',
    token: 'dev-gov',
  },
  {
    description: '平台运营、模型监控、凭证与审计后台',
    href: '/admin/dashboard',
    icon: Sparkles,
    key: 'admin',
    label: '平台后台',
    role: 'platform_owner',
    token: 'dev-admin',
  },
];

function roleFromQuery(value: string | null): RoleKey {
  return roleOptions.some((item) => item.key === value) ? (value as RoleKey) : 'boss';
}

function isOtherPortalPath(next: string): boolean {
  return next.startsWith('/admin') || next.startsWith('/agent') || next.startsWith('/gov');
}

function isSamePortal(next: string, selected: RoleOption): boolean {
  if (!next.startsWith('/')) return false;
  if (selected.key === 'boss') return next === '/Boss' || next.startsWith('/Boss/');
  return next === `/${selected.key}` || next.startsWith(`/${selected.key}/`);
}

function resolveLoginDestination(next: string, selected: RoleOption): string {
  if (!next.startsWith('/')) return selected.href;
  if (isSamePortal(next, selected)) return next;
  if (selected.key === 'boss' && !isOtherPortalPath(next)) {
    return next === '/' ? '/Boss/dashboard' : `/Boss${next}`;
  }
  return selected.href;
}

export default function LoginPage() {
  const params = useSearchParams();
  const [roleKey, setRoleKey] = useState<RoleKey>(() => roleFromQuery(params.get('role')));
  const [pending, setPending] = useState(false);
  const selected = useMemo(
    () => roleOptions.find((item) => item.key === roleKey) ?? defaultRole,
    [roleKey],
  );
  const next = params.get('next') ?? '';

  function login() {
    if (pending) return;
    setPending(true);
    const expires = 60 * 60 * 24 * 7;
    document.cookie = `tq_auth_token=${selected.token}; path=/; max-age=${expires}; SameSite=Lax`;
    document.cookie = `tq_role=${selected.role}; path=/; max-age=${expires}; SameSite=Lax`;
    window.location.replace(resolveLoginDestination(next, selected));
  }

  return (
    <main className="tq-camellia-login min-h-screen px-4 py-8 text-[#10233f]">
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="tq-camellia-hero-panel overflow-hidden rounded-lg border border-white/10 p-8 shadow-[0_24px_80px_rgba(16,35,63,0.18)]">
          <div className="relative z-10 space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#ead0c8]">Tongqian Strategy</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-normal text-[#fffaf7] md:text-5xl">
                同乾方略
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#d8d3cc]">
                建筑业 AI 经营管家统一入口。选择你的角色，进入对应工作台。
              </p>
            </div>
            <div className="tq-camellia-login-line" />
            <div className="grid gap-3 sm:grid-cols-2">
              {['方案质量 100%', '多租户隔离', '点数审计闭环', '国产 AI 可接入'].map((item) => (
                <div
                  className="rounded-md border border-white/15 bg-white/[0.08] px-4 py-3 text-sm text-[#fffaf7]"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="tq-camellia-login-card rounded-lg p-6 md:p-8">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#9e6e72]">统一登录</p>
            <h2 className="text-2xl font-semibold tracking-normal text-[#10233f]">选择角色进入系统</h2>
            <p className="text-sm leading-6 text-[#526073]">
              当前为上线验收入口，后续可平滑替换为短信、企业微信或正式账号体系。
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            {roleOptions.map((item) => {
              const Icon = item.icon;
              const active = item.key === selected.key;
              return (
                <button
                  className={`flex min-h-[76px] items-center gap-4 rounded-md border px-4 py-3 text-left transition ${
                    active
                      ? 'border-[#c98a75] bg-[#fffaf7] shadow-[0_12px_32px_rgba(201,138,117,0.18)]'
                      : 'border-[#d8d3cc] bg-white/55 hover:border-[#b98e91]'
                  }`}
                  key={item.key}
                  onClick={() => setRoleKey(item.key)}
                  type="button"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#f0e7e2] text-[#10233f]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#10233f]">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[#526073]">{item.description}</span>
                  </span>
                  <span
                    className={`h-3 w-3 rounded-full border ${
                      active ? 'border-[#c98a75] bg-[#c98a75]' : 'border-[#d8d3cc]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <button
            className="mt-6 h-12 w-full rounded-md bg-[#10233f] px-4 text-sm font-semibold text-[#fffaf7] shadow-[0_14px_34px_rgba(16,35,63,0.22)] transition hover:bg-[#172f52] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={pending}
            onClick={login}
            type="button"
          >
            {pending ? '正在进入...' : `进入${selected.label}`}
          </button>

          <div className="mt-5 rounded-md border border-[#d8d3cc] bg-[#f7f3ee]/70 px-4 py-3 text-xs leading-5 text-[#526073]">
            公网首页为品牌展示页，业务系统统一从本页分流。老板端固定在 /Boss/，后台、智能管家端和政企端保持各自独立入口。
          </div>
        </div>
      </section>
    </main>
  );
}
