'use client';

import { CyberError } from '@tongqian/ui/cyber';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <CyberError actionLabel="重试" description={error.message} onRetry={reset} title="页面加载失败" />;
}
