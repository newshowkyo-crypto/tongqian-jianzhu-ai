import { Injectable } from '@nestjs/common';

type SearchType = 'agents' | 'contracts' | 'customers' | 'policies' | 'projects' | 'reports' | 'tenders';

interface SearchItem {
  href: string;
  id: string;
  matched: string[];
  subtitle: string;
  tenantId: string;
  title: string;
  type: SearchType;
}

@Injectable()
export class SearchService {
  private readonly index: SearchItem[] = [];

  constructor() {
    this.seed();
  }

  search(input: { q?: string; tenantId?: string; types?: string }): { items: SearchItem[]; query: string; tookMs: number; total: number } {
    const started = Date.now();
    const query = (input.q ?? '').trim().toLowerCase();
    const tenantId = input.tenantId ?? 'demo-tenant';
    const types = new Set(
      (input.types ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean) as SearchType[],
    );
    const scoped = this.index.filter((item) => item.tenantId === tenantId || item.tenantId === 'public');
    const filtered = scoped.filter((item) => (types.size === 0 || types.has(item.type)) && this.matches(item, query));
    const ranked = filtered
      .map((item) => ({ item, score: this.score(item, query) }))
      .sort((left, right) => right.score - left.score)
      .slice(0, 12)
      .map(({ item }) => item);
    return { items: ranked, query, tookMs: Date.now() - started, total: filtered.length };
  }

  suggest(tenantId = 'demo-tenant'): SearchItem[] {
    return this.index
      .filter((item) => item.tenantId === tenantId || item.tenantId === 'public')
      .slice(0, 8);
  }

  upsert(item: SearchItem): SearchItem {
    const index = this.index.findIndex((existing) => existing.id === item.id && existing.type === item.type);
    if (index >= 0) this.index[index] = item;
    else this.index.push(item);
    return item;
  }

  remove(type: SearchType, id: string): { id: string; removed: boolean; type: SearchType } {
    const before = this.index.length;
    for (let index = this.index.length - 1; index >= 0; index -= 1) {
      if (this.index[index]?.id === id && this.index[index]?.type === type) this.index.splice(index, 1);
    }
    return { id, removed: this.index.length !== before, type };
  }

  stats(): Record<string, unknown> {
    return {
      byType: this.index.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.type]: (acc[item.type] ?? 0) + 1 }), {}),
      indexed: this.index.length,
      tenants: [...new Set(this.index.map((item) => item.tenantId))],
    };
  }

  private matches(item: SearchItem, query: string): boolean {
    if (!query) return true;
    const haystack = [item.title, item.subtitle, item.type, ...item.matched].join(' ').toLowerCase();
    return query
      .split(/\s+/)
      .filter(Boolean)
      .every((part) => haystack.includes(part));
  }

  private score(item: SearchItem, query: string): number {
    if (!query) return 1;
    const title = item.title.toLowerCase();
    let score = 0;
    for (const part of query.split(/\s+/).filter(Boolean)) {
      if (title === part) score += 20;
      else if (title.startsWith(part)) score += 12;
      else if (title.includes(part)) score += 8;
      if (item.subtitle.toLowerCase().includes(part)) score += 4;
      if (item.matched.some((tag) => tag.toLowerCase().includes(part))) score += 3;
    }
    return score;
  }

  private seed(): void {
    const rows: SearchItem[] = [
      { href: '/admin/agents', id: 'agent-lv5-zs', matched: ['LV5', 'dispatch', 'reputation'], subtitle: '首席管家，华东合同审查与派单兜底', tenantId: 'demo-tenant', title: '张三智能管家', type: 'agents' },
      { href: '/contracts/reviews', id: 'contract-risk-001', matched: ['付款延迟', '无限连带责任', '红灯'], subtitle: '施工总承包合同深度审查报告', tenantId: 'demo-tenant', title: '万达广场二期合同', type: 'contracts' },
      { href: '/projects/site', id: 'project-001', matched: ['上海', '总包', '现金流'], subtitle: '上海浦东 EPC 项目，预计 5200 万', tenantId: 'demo-tenant', title: '浦东科创园项目', type: 'projects' },
      { href: '/reports/history', id: 'report-001', matched: ['AI 报告', 'Tier 3', '合同'], subtitle: '昨日 AI 报告速览，建议人工复核', tenantId: 'demo-tenant', title: '合同风险红灯报告', type: 'reports' },
      { href: '/tenders/frameworks', id: 'tender-001', matched: ['招标', '标书框架', '市政'], subtitle: '市政道路改造项目，技术标待生成', tenantId: 'demo-tenant', title: '青浦市政道路招标', type: 'tenders' },
      { href: '/opportunities/matches', id: 'customer-001', matched: ['优质客户', '回款好', '央企'], subtitle: '近 90 天回款稳定，适合同乾方略咨询转化', tenantId: 'demo-tenant', title: '中建某区域公司', type: 'customers' },
      { href: '/funds', id: 'policy-001', matched: ['专精特新', '资金', '补贴'], subtitle: '上海市中小企业数字化转型补贴', tenantId: 'public', title: '政策资金匹配', type: 'policies' },
    ];
    this.index.push(...rows);
  }
}
