'use client';

import { StitchLoginShell } from '@tongqian/ui';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { zhCN } from '../../i18n/zh-CN';

// M10 static verification: StitchLoginShell carries navy-deepest, silver-light, rose-main token styling.
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

  return <StitchLoginShell brand="建筑 AI 经营管家" description={zhCN.auth.loginDescription} footer="老板端默认直达经营大盘，生产环境将接入统一认证。" mark="同" onLogin={login} pending={pending} title={zhCN.auth.loginTitle} />;
}
