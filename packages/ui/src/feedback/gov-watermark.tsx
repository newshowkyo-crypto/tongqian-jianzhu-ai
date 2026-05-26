import type { ReactNode } from 'react';

export function GovWatermark({ children, generatorIp = '127.0.0.1', user = 'gov-user' }: { children: ReactNode; generatorIp?: string; user?: string }): JSX.Element {
  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center text-xs text-neutral-300 opacity-40">
        Internal use only · {user} · IP {generatorIp} · {new Date().toISOString().slice(0, 10)}
      </div>
      {children}
    </div>
  );
}
