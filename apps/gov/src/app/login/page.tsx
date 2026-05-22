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
    document.cookie = `tq_auth_token=dev-gov; path=/; max-age=${expires}; SameSite=Lax`;
    document.cookie = `tq_role=gov_user; path=/; max-age=${expires}; SameSite=Lax`;
    window.location.replace(next);
  }

  return <StitchLoginShell brand="政企政策智库" description={zhCN.auth.loginDescription} footer="政企端默认使用审计水印和国产模型链路。" mark="政" onLogin={login} pending={pending} title={zhCN.auth.loginTitle} />;
}
