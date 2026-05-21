import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '../utils.js';

export type CyberHeroProps = ComponentPropsWithoutRef<'section'>;

export function CyberHero({ className, children, ...props }: CyberHeroProps): ReactNode {
  return (
    <section className={cn('rounded-md border border-[var(--border-silver)] bg-[var(--bg-glass)] p-5 shadow-[var(--shadow-card)]', className)} {...props}>
      {children}
    </section>
  );
}
