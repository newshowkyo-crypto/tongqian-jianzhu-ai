'use client';

import { type ComponentPropsWithoutRef, type ComponentType, type ReactNode, useEffect, useMemo, useState } from 'react';

import { Command } from '../primitives/Command.js';
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
    <div className={cn('tq-cyber-shell min-h-screen text-[var(--text-primary)]', className)} {...props}>
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
        {breadcrumbs ? <div className="text-sm text-[var(--text-secondary)]">{breadcrumbs}</div> : null}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-normal text-white">{title}</h1>
          {description ? <p className="max-w-3xl text-sm text-[var(--text-secondary)]">{description}</p> : null}
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
            {title ? <h2 className="text-base font-semibold text-white">{title}</h2> : null}
            {description ? <p className="text-sm text-[var(--text-secondary)]">{description}</p> : null}
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
      className={cn('tq-cyber-panel flex flex-col gap-2 p-3 sm:flex-row sm:items-center', className)}
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
    <div className={cn('flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-[var(--border-silver)] bg-white/5 p-6 text-center', className)} {...props}>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-[var(--text-secondary)]">{description}</p> : null}
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
    <div className={cn('tq-cyber-panel space-y-3 p-4', className)} {...props}>
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
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
    <div className={cn('rounded-md border border-danger-500/50 bg-danger-500/15 p-4 text-danger-100', className)} {...props}>
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
    <nav className={cn('tq-cyber-panel p-3', className)} {...props}>
      {logo ? <div className="mb-4 px-2 py-2">{logo}</div> : null}
      <div className="space-y-1">
        {items.map((item) => (
          <a
            key={item.href}
            className={cn(
              'flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              item.active ? 'tq-cyber-nav-item-active' : 'tq-cyber-nav-item',
            )}
            href={item.href}
          >
            {item.icon ? <span className="text-[var(--text-secondary)]">{item.icon}</span> : null}
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
    <header className={cn('tq-cyber-topbar sticky top-0 z-40 flex h-16 items-center gap-3 px-4', className)} {...props}>
      <div className="min-w-0 flex-1">{search}</div>
      {tenantSwitcher}
      {themeToggle}
      {notifications}
      {avatar}
    </header>
  );
}

export interface CyberShellNavigationItem {
  group?: string;
  groupLabel?: ReactNode;
  href: string;
  icon: string;
  label: ReactNode;
}

export interface CyberShellBrand {
  eyebrow?: ReactNode;
  href: string;
  title: ReactNode;
}

export interface CyberShellActionLabels {
  avatar: ReactNode;
  avatarTitle?: ReactNode;
  notifications: ReactNode;
  notificationsTitle?: ReactNode;
  tenant: ReactNode;
  tenantTitle?: ReactNode;
  theme: ReactNode;
}

export interface CyberShellProps {
  actionLabels: CyberShellActionLabels;
  assistant?: ReactNode;
  basePath?: string;
  brand: CyberShellBrand;
  children: ReactNode;
  currentLabel?: ReactNode;
  currentPath: string;
  homeLabel: ReactNode;
  iconMap: Record<string, ComponentType<{ className?: string }>>;
  navigation: CyberShellNavigationItem[];
  rightPanel?: ReactNode;
  searchPlaceholder: string;
  tabs?: ReactNode[];
}

export function CyberShell({
  actionLabels,
  assistant,
  basePath = '',
  brand,
  children,
  currentLabel,
  currentPath,
  homeLabel,
  iconMap,
  navigation,
  rightPanel,
  searchPlaceholder,
  tabs,
}: CyberShellProps): ReactNode {
  const [openPanel, setOpenPanel] = useState<'avatar' | 'notifications' | 'tenant' | null>(null);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('light');
  const toHref = (href: string): string => prefixBasePath(href, basePath);

  const activeItem = useMemo(
    () => navigation.find((item) => currentPath === item.href || currentPath.startsWith(`${item.href}/`)),
    [currentPath, navigation],
  );
  const crumb = currentLabel ?? activeItem?.label ?? homeLabel;

  function togglePanel(panel: 'avatar' | 'notifications' | 'tenant'): void {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  useEffect(() => {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const saved = window.localStorage.getItem('tongqian.theme');
    const next = saved === 'dark' || saved === 'light' ? saved : current;
    document.documentElement.dataset.theme = next;
    setThemeMode(next);
  }, []);

  function toggleTheme(): void {
    setThemeMode((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      window.localStorage.setItem('tongqian.theme', next);
      return next;
    });
  }

  return (
    <div className="tq-cyber-shell min-h-screen text-[var(--text-primary)]">
      <header className="tq-cyber-topbar fixed inset-x-0 top-0 z-40 flex h-16 items-center px-4 lg:pl-72">
        <div className="relative flex w-full items-center gap-3">
          <Command placeholder={searchPlaceholder} />
          <button
            aria-expanded={openPanel === 'tenant'}
            className="tq-cyber-control hidden h-10 rounded-md px-3 text-sm font-medium sm:block"
            onClick={() => togglePanel('tenant')}
            type="button"
          >
            {actionLabels.tenant}
          </button>
          <button
            aria-expanded={openPanel === 'notifications'}
            aria-label={String(actionLabels.notifications)}
            className="tq-cyber-control relative grid h-10 w-10 place-items-center rounded-md"
            onClick={() => togglePanel('notifications')}
            type="button"
          >
            <span aria-hidden="true" className="text-base leading-none">!</span>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--accent-rose)]" />
          </button>
          <button
            className="tq-cyber-control h-10 rounded-md px-3 text-sm"
            onClick={toggleTheme}
            type="button"
          >
            {actionLabels.theme} · {themeMode}
          </button>
          <button
            aria-expanded={openPanel === 'avatar'}
            aria-label={String(actionLabels.avatarTitle ?? actionLabels.avatar)}
            className="grid h-10 w-10 place-items-center rounded-full bg-[rgba(74,142,255,0.14)] text-sm font-semibold text-[var(--accent-rose)] ring-1 ring-[var(--border-silver)]"
            onClick={() => togglePanel('avatar')}
            type="button"
          >
            {actionLabels.avatar}
          </button>

          {openPanel ? (
            <div className="absolute right-0 top-12 z-50 w-72 rounded-md border border-[var(--border-silver)] bg-[var(--bg-glass)] p-3 text-sm text-[var(--text-secondary)] shadow-[var(--shadow-card)] backdrop-blur-xl">
              {openPanel === 'tenant' ? (
                <div className="space-y-2">
                  <p className="font-semibold text-[var(--text-primary)]">{actionLabels.tenantTitle ?? actionLabels.tenant}</p>
                  <button className="w-full rounded-md border border-[var(--border-silver)] px-3 py-2 text-left hover:border-[var(--accent-rose)] hover:text-[var(--text-primary)]" type="button">
                    {actionLabels.tenant}
                  </button>
                </div>
              ) : null}
              {openPanel === 'notifications' ? (
                <div className="space-y-2">
                  <p className="font-semibold text-[var(--text-primary)]">{actionLabels.notificationsTitle ?? actionLabels.notifications}</p>
                  <a className="block rounded-md border border-[var(--border-silver)] px-3 py-2 hover:border-[var(--accent-rose)] hover:text-[var(--text-primary)]" href={toHref('/reports')}>
                    AI 审计报告已生成
                  </a>
                  <a className="block rounded-md border border-[var(--border-silver)] px-3 py-2 hover:border-[var(--accent-rose)] hover:text-[var(--text-primary)]" href={toHref('/approvals')}>
                    审批队列已更新
                  </a>
                </div>
              ) : null}
              {openPanel === 'avatar' ? (
                <div className="space-y-2">
                  <p className="font-semibold text-[var(--text-primary)]">{actionLabels.avatarTitle ?? actionLabels.avatar}</p>
                  <a className="block rounded-md border border-[var(--border-silver)] px-3 py-2 hover:border-[var(--accent-rose)] hover:text-[var(--text-primary)]" href={toHref('/settings')}>
                    账号设置
                  </a>
                  <button className="w-full rounded-md border border-[var(--border-silver)] px-3 py-2 text-left hover:border-[var(--accent-rose)] hover:text-[var(--text-primary)]" type="button">
                    会话已启用
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <aside className="tq-cyber-sidebar fixed inset-y-0 left-0 z-50 hidden w-64 p-4 lg:block">
        <a className="tq-cyber-brand block rounded-lg p-4 text-[var(--text-primary)]" href={toHref(brand.href)}>
          {brand.eyebrow ? <p className="text-sm font-medium text-[var(--text-secondary)]">{brand.eyebrow}</p> : null}
          <p className="mt-1 text-base font-semibold">{brand.title}</p>
        </a>
        {tabs?.length ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className="h-9 rounded-md border border-[var(--border-silver)] bg-[var(--bg-glass)] text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent-rose)] hover:text-[var(--text-primary)]"
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        ) : null}
        <nav className="mt-4 space-y-3" data-navigation-config="CyberShell">
          {navigation.map((item, index) => {
            const Icon = iconMap[item.icon];
            const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
            const previous = navigation[index - 1];
            const showGroup = item.groupLabel && item.group !== previous?.group;
            return (
              <div key={item.href} className="space-y-1">
                {showGroup ? <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-normal text-[var(--text-muted)]">{item.groupLabel}</p> : null}
                <a
                  className={cn('flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors', active ? 'tq-cyber-nav-item-active' : 'tq-cyber-nav-item')}
                  href={toHref(item.href)}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {item.label}
                </a>
              </div>
            );
          })}
        </nav>
      </aside>

      <details className="fixed left-4 top-3 z-50 lg:hidden">
        <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-md border border-[var(--border-silver)] bg-[var(--bg-glass)] shadow-sm">
          菜单
        </summary>
        <nav className="mt-2 max-h-[80vh] w-64 overflow-auto rounded-lg border border-[var(--border-silver)] bg-[var(--bg-glass)] p-3 shadow-md">
          {navigation.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <a key={item.href} className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-[var(--text-secondary)]" href={toHref(item.href)}>
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {item.label}
              </a>
            );
          })}
        </nav>
      </details>

      <main className="px-4 pb-8 pt-20 lg:pl-72 lg:pr-8">
        <div className={cn('mx-auto max-w-7xl', rightPanel && 'grid gap-6 xl:grid-cols-[1fr_280px]')}>
          <section>
            <div className="mb-4 text-sm text-[var(--text-secondary)]">
              <a className="text-[var(--accent-rose)]" href={toHref(brand.href)}>{homeLabel}</a>
              <span className="px-2">/</span>
              <span>{crumb}</span>
            </div>
            {children}
          </section>
          {rightPanel}
        </div>
      </main>
      {assistant}
    </div>
  );
}

function prefixBasePath(href: string, basePath: string): string {
  if (
    !basePath ||
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  ) {
    return href;
  }

  const normalizedBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  if (href === '/') return normalizedBasePath || '/';
  if (!href.startsWith('/')) return href;
  if (href === normalizedBasePath || href.startsWith(`${normalizedBasePath}/`)) return href;
  return `${normalizedBasePath}${href}`;
}
