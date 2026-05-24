import { BaseFetcher, type CrawlerItem } from './base-fetcher.js';

export class MohurdFetcher extends BaseFetcher<CrawlerItem> {
  sourceName = 'mohurd';
  sourceUrl = 'https://www.mohurd.gov.cn';

  async fetch(): Promise<CrawlerItem[]> {
    const html = await this.fetchText('https://www.mohurd.gov.cn/gongkai/zhengce/');
    return this.parse(html);
  }

  parse(html: string): CrawlerItem[] {
    return [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]{6,120})<\/a>/gi)]
      .slice(0, 30)
      .map((match) => ({ sourceUrl: new URL(match[1] ?? '/', this.sourceUrl).toString(), title: (match[2] ?? '').trim(), type: 'policy' }));
  }

  async dedup(items: CrawlerItem[]): Promise<CrawlerItem[]> {
    return this.unique(items);
  }
}
