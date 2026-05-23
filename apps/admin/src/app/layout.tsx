import { IcpFooter } from '@tongqian/ui';
import type { ReactNode } from 'react';

import '../styles/globals.css';
import { AppShell } from '../app-shell';
import { QueryProvider } from '../components/query-provider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-theme="dark" lang="zh-CN">
      <body><QueryProvider><AppShell>{children}</AppShell><IcpFooter /></QueryProvider></body>
    </html>
  );
}
