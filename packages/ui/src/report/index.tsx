import type { RequiredElements } from '@tongqian/types';
import { type ReactNode } from 'react';

import { ReportHeader } from '../domain/index.js';
import { Card, CardContent } from '../primitives/feedback.js';
import { cn } from '../utils.js';

export function BrandHeader({ className, name }: { className?: string; name: ReactNode }): ReactNode {
  return <div className={cn('border-b border-border pb-3 text-sm font-semibold text-primary-700', className)}>{name}</div>;
}

export function DisclaimerFooter({ children, className }: { children: ReactNode; className?: string }): ReactNode {
  return <footer className={cn('pt-4 text-xs leading-5 text-neutral-400', className)}>{children}</footer>;
}

export function ReportCardH5({ children, className, requiredElements, title }: { children: ReactNode; className?: string; requiredElements: RequiredElements; title: ReactNode }): ReactNode {
  return <Card className={cn('mx-auto max-w-3xl', className)}><CardContent className="space-y-4 pt-4"><ReportHeader requiredElements={requiredElements} title={title} />{children}<DisclaimerFooter>{requiredElements.disclaimer}</DisclaimerFooter></CardContent></Card>;
}

export function ReportFullPdf({ children, className, requiredElements, title }: { children: ReactNode; className?: string; requiredElements: RequiredElements; title: ReactNode }): ReactNode {
  return <article className={cn('mx-auto max-w-4xl space-y-6 bg-white p-8 text-neutral-900', className)}><ReportHeader requiredElements={requiredElements} title={title} />{children}<DisclaimerFooter>{requiredElements.disclaimer}</DisclaimerFooter></article>;
}
