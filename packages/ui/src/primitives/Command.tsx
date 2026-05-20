'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { cn } from '../utils.js';

export interface CommandResult {
  href?: string;
  id: string;
  subtitle?: string;
  title: string;
  type?: string;
}

export interface CommandProps {
  apiBaseUrl?: string;
  className?: string;
  defaultOpen?: boolean;
  onNavigate?: (result: CommandResult) => void;
  placeholder?: string;
  seedResults?: CommandResult[];
}

const FALLBACK_RESULTS: CommandResult[] = [
  { href: '/dashboard', id: 'dashboard', subtitle: '今日机会、风险红灯和待办审批', title: '老板首页', type: 'page' },
  { href: '/admin/credentials', id: 'credentials', subtitle: '凭证 mock/real 切换与审批', title: '凭证管理', type: 'admin' },
  { href: '/reports/history', id: 'reports', subtitle: 'AI 报告、Tier 和信心度', title: '报告中心', type: 'report' },
];

export function Command({
  apiBaseUrl = '',
  className,
  defaultOpen = false,
  onNavigate,
  placeholder = '搜索客户、项目、合同、报告、智能管家、招标、政策',
  seedResults = FALLBACK_RESULTS,
}: CommandProps): ReactNode {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommandResult[]>(seedResults);
  const [activeIndex, setActiveIndex] = useState(0);
  const endpoint = useMemo(() => `${apiBaseUrl}/api/v1/search?q=${encodeURIComponent(query)}`, [apiBaseUrl, query]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      if (!query.trim()) {
        setResults(seedResults);
        return;
      }
      void fetch(endpoint, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : undefined))
        .then((payload) => {
          const items = (payload?.data?.items ?? []) as CommandResult[];
          setResults(items.length > 0 ? items : seedResults.filter((item) => item.title.includes(query) || item.subtitle?.includes(query)));
          setActiveIndex(0);
        })
        .catch(() => setResults(seedResults));
    }, 180);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [endpoint, open, query, seedResults]);

  const choose = (result: CommandResult) => {
    onNavigate?.(result);
    if (!onNavigate && result.href) window.location.assign(result.href);
    setOpen(false);
  };

  return (
    <>
      <button
        aria-label="打开全局搜索"
        className={cn('flex h-10 min-w-0 flex-1 items-center rounded-md border border-neutral-300 bg-neutral-50 px-3 text-sm text-neutral-500', className)}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="truncate">{placeholder}</span>
        <kbd className="ml-auto hidden rounded bg-white px-1.5 py-0.5 text-xs text-neutral-500 sm:inline">Ctrl K</kbd>
      </button>
      {open ? (
        <div className="fixed inset-0 z-[90] bg-neutral-950/30 px-4 pt-[12vh]" role="dialog" aria-modal="true">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-2xl">
            <div className="flex h-14 items-center gap-3 border-b border-neutral-200 px-4">
              <Search className="h-5 w-5 text-primary-600" />
              <input
                autoFocus
                className="h-full flex-1 bg-transparent text-base outline-none"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') setActiveIndex((value) => Math.min(value + 1, results.length - 1));
                  if (event.key === 'ArrowUp') setActiveIndex((value) => Math.max(value - 1, 0));
                  if (event.key === 'Enter' && results[activeIndex]) choose(results[activeIndex]);
                }}
                placeholder={placeholder}
                value={query}
              />
              <button aria-label="关闭搜索" className="grid h-9 w-9 place-items-center rounded-md hover:bg-neutral-100" onClick={() => setOpen(false)} type="button">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[420px] overflow-auto p-2">
              {results.length === 0 ? <div className="p-8 text-center text-sm text-neutral-500">暂无结果</div> : null}
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className={cn('flex min-h-14 w-full flex-col rounded-md px-3 py-2 text-left transition-colors', index === activeIndex ? 'bg-primary-50' : 'hover:bg-neutral-50')}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(result)}
                  type="button"
                >
                  <span className="text-sm font-semibold text-neutral-900">{result.title}</span>
                  <span className="text-xs text-neutral-500">{result.type ?? 'result'} · {result.subtitle ?? result.href}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
