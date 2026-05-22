'use client';

import { StitchLoginShell } from '@tongqian/ui';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { zhCN } from '../../i18n/zh-CN';

export default function LoginPage() {
  const params = useSearchParams();
  const next = params.get('next') ?? '/';
  const [pending, setPending] = useState(false);

  function login() {
    if (pending) return;
    setPending(true);
    const expires = 60 * 60 * 24 * 7;
    document.cookie = `tq_auth_token=dev-admin; path=/; max-age=${expires}; SameSite=Lax`;
    document.cookie = `tq_role=platform_owner; path=/; max-age=${expires}; SameSite=Lax`;
    window.location.replace(next);
  }

  return <StitchLoginShell brand="平台运营后台" description={zhCN.auth.loginDescription} footer="后台默认进入运营驾驶舱，生产环境保留 2FA 与审计链路。" mark="管" onLogin={login} pending={pending} title={zhCN.auth.loginTitle} />;
}
