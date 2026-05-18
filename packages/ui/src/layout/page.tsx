import { type ComponentPropsWithoutRef, type ReactNode } from 'react';

import { Skeleton, Spinner } from '../primitives/data.js';
import { CardContent, CardHeader } from '../primitives/feedback.js';
import { Button } from '../primitives/form.js';
import { cardClassName } from '../primitives.js';
import { cn } from '../utils.js';

export interface PageLayoutProps extends ComponentPropsWithoutRef<'div'> {
  footer?: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
}

export function PageLayout({ children, className, footer, header, sidebar, ...props }: PageLayoutProps): ReactNode {
  return (
    <div className={cn('min-h-screen bg-neutral-50 text-foreground', className)} {...props}>
      {header}
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[16rem_1fr] lg:px-6">
        {sidebar ? <aside className="hidden lg:block">{sidebar}</aside> : null}
        <main className={cn('min-w-0', sidebar ? '' : 'lg:col-span-2')}>{children}</main>
      </div>
      {footer}
    </div>
  );
}

export interface PageHeaderProps extends Omit<ComponentPropsWithoutRef<'header'>, 'title'> {
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}

export function PageHeader({
  actions,
  breadcrumbs,
  className,
  description,
  title,
  ...props
}: PageHeaderProps): ReactNode {
  return (
    <header className={cn('mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between', className)} {...props}>
      <div className="min-w-0 space-y-2">
        {breadcrumbs ? <div className="text-sm text-neutral-500">{breadcrumbs}</div> : null}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">{title}</h1>
          {description ? <p className="max-w-3xl text-sm text-neutral-600">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export type PageContentProps = ComponentPropsWithoutRef<'section'>;

export function PageContent({ className, ...props }: PageContentProps): ReactNode {
  return <section className={cn('space-y-4', className)} {...props} />;
}

export interface SectionCardProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  actions?: ReactNode;
  description?: ReactNode;
  title?: ReactNode;
}

export function SectionCard({
  actions,
  children,
  className,
  description,
  title,
  ...props
}: SectionCardProps): ReactNode {
  return (
    <section className={cn(cardClassName, 'transition-shadow duration-200 hover:shadow-md', className)} {...props}>
      {title || description || actions ? (
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            {title ? <h2 className="text-base font-semibold text-neutral-900">{title}</h2> : null}
            {description ? <p className="text-sm text-neutral-600">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </CardHeader>
      ) : null}
      <CardContent className={title || description || actions ? '' : 'pt-4'}>{children}</CardContent>
    </section>
  );
}

export type FilterBarProps = ComponentPropsWithoutRef<'div'>;

export function FilterBar({ className, ...props }: FilterBarProps): ReactNode {
  return (
    <div
      className={cn('flex flex-col gap-2 rounded-md border border-border bg-background p-3 sm:flex-row sm:items-center', className)}
      {...props}
    />
  );
}

export interface EmptyStateProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  action?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}

export function EmptyState({ action, className, description, title, ...props }: EmptyStateProps): ReactNode {
  return (
    <div className={cn('flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-border p-6 text-center', className)} {...props}>
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-neutral-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export interface LoadingStateProps extends ComponentPropsWithoutRef<'div'> {
  label?: ReactNode;
  rows?: number;
}

export function LoadingState({ className, label, rows = 3, ...props }: LoadingStateProps): ReactNode {
  return (
    <div className={cn('space-y-3 rounded-md border border-border bg-background p-4', className)} {...props}>
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <Spinner />
        {label}
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-9 w-full" />
      ))}
    </div>
  );
}

export interface ErrorStateProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  actionLabel?: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  title: ReactNode;
}

export function ErrorState({
  actionLabel,
  className,
  description,
  onRetry,
  title,
  ...props
}: ErrorStateProps): ReactNode {
  return (
    <div className={cn('rounded-md border border-danger-100 bg-danger-50 p-4 text-danger-700', className)} {...props}>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description ? <p className="mt-1 text-sm">{description}</p> : null}
      {onRetry && actionLabel ? (
        <Button className="mt-3" onClick={onRetry} size="sm" variant="outline">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export interface SidebarItem {
  active?: boolean;
  href: string;
  icon?: ReactNode;
  label: ReactNode;
}

export interface SidebarProps extends ComponentPropsWithoutRef<'nav'> {
  items: SidebarItem[];
  logo?: ReactNode;
}

export function Sidebar({ className, items, logo, ...props }: SidebarProps): ReactNode {
  return (
    <nav className={cn('rounded-lg border border-border bg-background p-3 shadow-sm', className)} {...props}>
      {logo ? <div className="mb-4 px-2 py-2">{logo}</div> : null}
      <div className="space-y-1">
        {items.map((item) => (
          <a
            key={item.href}
            className={cn(
              'flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              item.active ? 'bg-primary-50 text-primary-700' : 'text-neutral-700 hover:bg-neutral-100',
            )}
            href={item.href}
          >
            {item.icon ? <span className="text-neutral-500">{item.icon}</span> : null}
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

export interface TopNavProps extends ComponentPropsWithoutRef<'header'> {
  avatar?: ReactNode;
  notifications?: ReactNode;
  search?: ReactNode;
  tenantSwitcher?: ReactNode;
  themeToggle?: ReactNode;
}

export function TopNav({ avatar, className, notifications, search, tenantSwitcher, themeToggle, ...props }: TopNavProps): ReactNode {
  return (
    <header className={cn('sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur', className)} {...props}>
      <div className="min-w-0 flex-1">{search}</div>
      {tenantSwitcher}
      {themeToggle}
      {notifications}
      {avatar}
    </header>
  );
}
