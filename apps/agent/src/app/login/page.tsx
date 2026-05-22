'use client';

import { StitchLoginShell } from '@tongqian/ui';
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
    document.cookie = `tq_auth_token=dev-agent; path=/; max-age=${expires}; SameSite=Lax`;
    document.cookie = `tq_role=agent; path=/; max-age=${expires}; SameSite=Lax`;
    window.location.replace(next);
  }

  return <StitchLoginShell brand="智能管家工作台" description={zhCN.auth.loginDescription} footer="智能管家端默认进入派单、收益和客户服务工作台。" mark="管" onLogin={login} pending={pending} title={zhCN.auth.loginTitle} />;
}
