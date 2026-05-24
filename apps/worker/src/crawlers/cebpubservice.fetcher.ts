import { BaseFetcher, type CrawlerItem } from './base-fetcher.js';

export class CebpubserviceFetcher extends BaseFetcher<CrawlerItem> {
  sourceName = 'cebpubservice';
  sourceUrl = 'https://www.cebpubservice.com';

  async fetch(): Promise<CrawlerItem[]> {
    const response = await fetch('https://www.cebpubservice.com/ctpsp_iiss/searchbusinesstypebeforedooraction/getSearch.do', { headers: { 'User-Agent': this.userAgent } });
    if (!response.ok) throw new Error(`cebpubservice ${response.status}`);
    const html = await response.text();
    return this.parse(html);
  }

  parse(html: string): CrawlerItem[] {
    return [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]{6,120})<\/a>/gi)]
      .slice(0, 30)
      .map((match) => ({ sourceUrl: new URL(match[1] ?? '/', this.sourceUrl).toString(), title: (match[2] ?? '').trim(), type: 'tender' }));
  }

  async dedup(items: CrawlerItem[]): Promise<CrawlerItem[]> {
    return this.unique(items);
  }
}
