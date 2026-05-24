import { BaseFetcher, type CrawlerItem } from './base-fetcher.js';

export class CreditchinaFetcher extends BaseFetcher<CrawlerItem> {
  sourceName = 'creditchina';
  sourceUrl = 'https://www.creditchina.gov.cn';

  async fetch(): Promise<CrawlerItem[]> {
    const text = await this.fetchText('https://www.creditchina.gov.cn/xinyongfuwu/?navPage=4');
    return this.parse(text);
  }

  parse(html: string): CrawlerItem[] {
    return [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]{4,120})<\/a>/gi)]
      .slice(0, 30)
      .map((match) => ({ sourceUrl: new URL(match[1] ?? '/', this.sourceUrl).toString(), title: (match[2] ?? '').trim(), type: 'credit' }));
  }

  async dedup(items: CrawlerItem[]): Promise<CrawlerItem[]> {
    return this.unique(items);
  }
}
