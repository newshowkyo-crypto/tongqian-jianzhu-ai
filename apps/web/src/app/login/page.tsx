'use client';

import { createApiClient, type AuthLoginResult, type AuthRegistrationRole } from '@tongqian/api-client';
import { Building2, Shield, Sparkles, UserCheck } from '@tongqian/ui';
import { useSearchParams } from 'next/navigation';
import { type ComponentType, type FormEvent, useMemo, useState } from 'react';

type RoleKey = 'boss' | 'agent' | 'gov' | 'admin';
type AuthMode = 'login' | 'register';

interface RoleOption {
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  key: RoleKey;
  label: string;
  role: string;
  registrationRole: AuthRegistrationRole;
}

const defaultRole: RoleOption = {
  description: '企业经营、风险雷达、合同审查、报告中心',
  href: '/Boss/dashboard',
  icon: Building2,
  key: 'boss',
  label: '企业主老板端',
  registrationRole: 'BUILDING_COMPANY_USER',
  role: 'owner',
};

const roleOptions: RoleOption[] = [
  defaultRole,
  {
    description: '线下跑腿、客户跟进、服务订单与佣金',
    href: '/agent/dashboard',
    icon: UserCheck,
    key: 'agent',
    label: '智能管家端',
    registrationRole: 'AGENT',
    role: 'agent',
  },
  {
    description: '政策项目、招商服务、政企协同工作台',
    href: '/gov/dashboard',
    icon: Shield,
    key: 'gov',
    label: '政企服务端',
    registrationRole: 'GOV_USER',
    role: 'gov_user',
  },
  {
    description: '平台运营、模型监控、凭证与审计后台',
    href: '/admin/dashboard',
    icon: Sparkles,
    key: 'admin',
    label: '平台后台',
    registrationRole: 'PLATFORM',
    role: 'platform_owner',
  },
];
const authClient = createApiClient({ mock: false });

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

function roleForDashboard(dashboard: string, fallback: RoleOption): string {
  if (dashboard === 'admin') return 'platform_owner';
  if (dashboard === 'agent') return 'agent';
  if (dashboard === 'gov') return 'gov_user';
  return fallback.role;
}

function destinationForDashboard(dashboard: string, next: string, selected: RoleOption): string {
  if (next.startsWith('/') && isSamePortal(next, selected)) return next;
  if (dashboard === 'admin') return '/admin/dashboard';
  if (dashboard === 'agent') return '/agent/dashboard';
  if (dashboard === 'gov') return '/gov/dashboard';
  return resolveLoginDestination(next, selected);
}

function persistSession(result: AuthLoginResult, selected: RoleOption): void {
  const expires = 60 * 60 * 24 * 30;
  const role = roleForDashboard(result.defaultDashboard, selected);
  window.localStorage.setItem('tongqian.jwt', result.accessToken);
  window.localStorage.setItem('tongqian.refreshToken', result.refreshToken);
  window.localStorage.setItem('tongqian.tenantId', result.tenantId);
  window.localStorage.setItem('tongqian.userId', result.userId);
  window.localStorage.setItem('tongqian.defaultDashboard', result.defaultDashboard);
  document.cookie = `tq_auth_token=${result.accessToken}; path=/; max-age=${expires}; SameSite=Lax`;
  document.cookie = `tq_role=${role}; path=/; max-age=${expires}; SameSite=Lax`;
}

function defaultDisplayName(role: RoleKey): string {
  if (role === 'agent') return '智能管家申请人';
  if (role === 'gov') return '政企单位用户';
  if (role === 'admin') return '平台运营人员';
  return '建筑企业用户';
}

export default function LoginPage() {
  const params = useSearchParams();
  const [roleKey, setRoleKey] = useState<RoleKey>(() => roleFromQuery(params.get('role')));
  const [mode, setMode] = useState<AuthMode>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [socialCreditCode, setSocialCreditCode] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const selected = useMemo(
    () => roleOptions.find((item) => item.key === roleKey) ?? defaultRole,
    [roleKey],
  );
  const next = params.get('next') ?? '';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setMessage('');
    try {
      const normalizedPhone = phone.trim();
      const normalizedPassword = password.trim();
      if (mode === 'register') {
        if (selected.key === 'admin') {
          setMessage('平台后台账号不开放公开注册，请由 PLATFORM_OWNER 在后台创建。');
          return;
        }
        await authClient.auth.register({
          agentSubtype: selected.key === 'agent' ? 'AGENT_GENERAL' : undefined,
          domain: typeof window === 'undefined' ? undefined : window.location.hostname,
          name: name.trim() || defaultDisplayName(selected.key),
          password: normalizedPassword || undefined,
          phone: normalizedPhone,
          role: selected.registrationRole,
          smsCode: smsCode.trim() || undefined,
          socialCreditCode: socialCreditCode.trim() || undefined,
        });
        setMessage(selected.key === 'boss' ? '注册成功，正在登录...' : '申请已提交，正在进入审核态工作台...');
      }
      const result = await authClient.auth.login({
        deviceId: typeof navigator === 'undefined' ? undefined : navigator.userAgent.slice(0, 120),
        password: normalizedPassword || undefined,
        phone: normalizedPhone,
        smsCode: smsCode.trim() || undefined,
      });
      persistSession(result, selected);
      window.location.replace(destinationForDashboard(result.defaultDashboard, next, selected));
    } catch (error) {
      const fallback = mode === 'register' ? '注册失败，请检查手机号、密码、信用代码或审核角色。' : '登录失败，请检查手机号、密码或验证码。';
      const detail = error instanceof Error && error.message ? error.message : fallback;
      setMessage(detail === 'Network Error' ? '无法连接 API，请确认后端服务或 NEXT_PUBLIC_API_BASE_URL。' : fallback);
    } finally {
      setPending(false);
    }
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
              当前入口已接入真实注册与登录 API。短信、微信扫码和支付凭证可在生产环境替换 provider。
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
                  onClick={() => {
                    setRoleKey(item.key);
                    if (item.key === 'admin') setMode('login');
                    setMessage('');
                  }}
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

          <div className="mt-5 grid grid-cols-2 rounded-md border border-[#d8d3cc] bg-[#f7f3ee] p-1 text-sm font-semibold">
            {(['login', 'register'] as const).map((item) => (
              <button
                className={`rounded px-3 py-2 transition ${mode === item ? 'bg-white text-[#10233f] shadow-sm' : 'text-[#526073]'}`}
                disabled={item === 'register' && selected.key === 'admin'}
                key={item}
                onClick={() => setMode(item)}
                type="button"
              >
                {item === 'login' ? '登录' : '注册 / 申请'}
              </button>
            ))}
          </div>

          <form className="mt-5 space-y-4" onSubmit={submit}>
            {mode === 'register' ? (
              <label className="block text-sm font-medium text-[#10233f]">
                企业 / 申请人名称
                <input
                  className="mt-2 h-11 w-full rounded-md border border-[#d8d3cc] bg-white/80 px-3 text-sm outline-none transition focus:border-[#c98a75]"
                  onChange={(event) => setName(event.target.value)}
                  placeholder={defaultDisplayName(selected.key)}
                  value={name}
                />
              </label>
            ) : null}
            <label className="block text-sm font-medium text-[#10233f]">
              手机号
              <input
                className="mt-2 h-11 w-full rounded-md border border-[#d8d3cc] bg-white/80 px-3 text-sm outline-none transition focus:border-[#c98a75]"
                inputMode="tel"
                onChange={(event) => setPhone(event.target.value)}
                placeholder="请输入 11 位手机号"
                required
                value={phone}
              />
            </label>
            <label className="block text-sm font-medium text-[#10233f]">
              密码
              <input
                className="mt-2 h-11 w-full rounded-md border border-[#d8d3cc] bg-white/80 px-3 text-sm outline-none transition focus:border-[#c98a75]"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="至少 8 位，建议字母数字组合"
                type="password"
                value={password}
              />
            </label>
            {mode === 'register' && selected.key === 'boss' ? (
              <label className="block text-sm font-medium text-[#10233f]">
                统一社会信用代码
                <input
                  className="mt-2 h-11 w-full rounded-md border border-[#d8d3cc] bg-white/80 px-3 text-sm uppercase outline-none transition focus:border-[#c98a75]"
                  onChange={(event) => setSocialCreditCode(event.target.value.toUpperCase())}
                  placeholder="可选，用于企业去重"
                  value={socialCreditCode}
                />
              </label>
            ) : null}
            <label className="block text-sm font-medium text-[#10233f]">
              短信验证码
              <input
                className="mt-2 h-11 w-full rounded-md border border-[#d8d3cc] bg-white/80 px-3 text-sm outline-none transition focus:border-[#c98a75]"
                inputMode="numeric"
                onChange={(event) => setSmsCode(event.target.value)}
                placeholder="开发 / 验收环境可用 000000，生产需真实短信"
                value={smsCode}
              />
            </label>
            {message ? (
              <div className="rounded-md border border-[#d8d3cc] bg-[#fffaf7] px-4 py-3 text-xs leading-5 text-[#9e3f35]">
                {message}
              </div>
            ) : null}
            <button
              className="h-12 w-full rounded-md bg-[#10233f] px-4 text-sm font-semibold text-[#fffaf7] shadow-[0_14px_34px_rgba(16,35,63,0.22)] transition hover:bg-[#172f52] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={pending}
              type="submit"
            >
              {pending ? '正在处理...' : mode === 'register' ? `注册并进入${selected.label}` : `进入${selected.label}`}
            </button>
          </form>

          <div className="mt-5 rounded-md border border-[#d8d3cc] bg-[#f7f3ee]/70 px-4 py-3 text-xs leading-5 text-[#526073]">
            公网首页为品牌展示页，点击试用或登录进入本页。老板端固定在 /Boss/，后台、智能管家端和政企端保持各自独立入口。
          </div>
        </div>
      </section>
    </main>
  );
}
