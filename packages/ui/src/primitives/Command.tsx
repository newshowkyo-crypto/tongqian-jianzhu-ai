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
  { href: '/dashboard', id: 'dashboard', subtitle: '\u4eca\u65e5\u673a\u4f1a\u3001\u98ce\u9669\u7ea2\u706f\u548c\u5f85\u529e\u5ba1\u6279', title: '\u8001\u677f\u9996\u9875', type: 'page' },
  { href: '/admin/credentials', id: 'credentials', subtitle: '\u51ed\u8bc1 mock/real \u5207\u6362\u4e0e\u5ba1\u8ba1', title: '\u51ed\u8bc1\u7ba1\u7406', type: 'admin' },
  { href: '/reports/history', id: 'reports', subtitle: 'AI \u62a5\u544a\u3001Tier \u548c\u4fe1\u5fc3\u5ea6', title: '\u62a5\u544a\u4e2d\u5fc3', type: 'report' },
];

export function Command({
  apiBaseUrl = '',
  className,
  defaultOpen = false,
  onNavigate,
  placeholder = '\u641c\u7d22\u5ba2\u6237\u3001\u9879\u76ee\u3001\u5408\u540c\u3001\u62a5\u544a\u3001\u667a\u80fd\u7ba1\u5bb6\u3001\u62db\u6807\u3001\u653f\u7b56',
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
        aria-label="\u6253\u5f00\u5168\u5c40\u641c\u7d22"
        className={cn('tq-cyber-control flex h-10 min-w-0 flex-1 items-center rounded-md px-3 text-sm', className)}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search className="mr-2 h-4 w-4 text-[var(--cyber-blue)]" />
        <span className="truncate text-[var(--text-secondary)]">{placeholder}</span>
        <kbd className="ml-auto hidden rounded border border-[var(--border-silver)] bg-[var(--bg-glass-hover)] px-1.5 py-0.5 text-xs text-[var(--text-secondary)] sm:inline">Ctrl K</kbd>
      </button>
      {open ? (
        <div className="fixed inset-0 z-[90] bg-[#020817]/70 px-4 pt-[12vh] backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="tq-cyber-panel mx-auto max-w-2xl overflow-hidden">
            <div className="flex h-14 items-center gap-3 border-b border-[var(--border-silver)] px-4">
              <Search className="h-5 w-5 text-[var(--cyber-blue)]" />
              <input
                autoFocus
                className="h-full flex-1 bg-transparent text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') setActiveIndex((value) => Math.min(value + 1, results.length - 1));
                  if (event.key === 'ArrowUp') setActiveIndex((value) => Math.max(value - 1, 0));
                  if (event.key === 'Enter' && results[activeIndex]) choose(results[activeIndex]);
                }}
                placeholder={placeholder}
                value={query}
              />
              <button aria-label="\u5173\u95ed\u641c\u7d22" className="grid h-9 w-9 place-items-center rounded-md hover:bg-white/10" onClick={() => setOpen(false)} type="button">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[420px] overflow-auto p-2">
              {results.length === 0 ? <div className="p-8 text-center text-sm text-[var(--text-secondary)]">{'\u6682\u65e0\u7ed3\u679c'}</div> : null}
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className={cn('flex min-h-14 w-full flex-col rounded-md px-3 py-2 text-left transition-colors', index === activeIndex ? 'bg-[rgba(74,142,255,0.14)]' : 'hover:bg-white/5')}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(result)}
                  type="button"
                >
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{result.title}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{result.type ?? 'result'} / {result.subtitle ?? result.href}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
