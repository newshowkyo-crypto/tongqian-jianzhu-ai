import type { ReactNode } from 'react';

export function IcpFooter(): ReactNode {
  const icp = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.NEXT_PUBLIC_ICP_RECORD_NO ?? '鄂 ICP 备案中';
  return (
    <footer className="mt-12 py-4 text-center text-xs text-[var(--text-muted)]">
      <p>湖北省同乾咨询有限公司 · 万婷婷创办 · www.tongqian.xin</p>
      <p className="mt-1">{icp} · © 2026</p>
    </footer>
  );
}
