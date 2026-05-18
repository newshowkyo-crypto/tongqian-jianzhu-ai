import type { ReactNode } from 'react';

import '../styles/globals.css';
import { AppShell } from '../app-shell';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
