import { BaseFetcher, type CrawlerItem } from './base-fetcher.js';

export class WenshuFetcher extends BaseFetcher<CrawlerItem> {
  sourceName = 'wenshu';
  sourceUrl = 'https://wenshu.court.gov.cn';

  async fetch(): Promise<CrawlerItem[]> {
    const response = await fetch('https://wenshu.court.gov.cn/website/wenshu/181107ANFZ0BXSK4/index.html', { headers: { 'User-Agent': this.userAgent } });
    if (!response.ok) throw new Error(`wenshu ${response.status}`);
    const html = await response.text();
    return this.parse(html);
  }

  parse(html: string): CrawlerItem[] {
    const matches = [...html.matchAll(/(建设工程合同纠纷|施工合同|工程款)[\s\S]{0,80}/g)];
    return matches.slice(0, 20).map((match, index) => ({
      sourceUrl: `${this.sourceUrl}/case-${index + 1}`,
      title: String(match[0]).replace(/\s+/g, '').slice(0, 80),
      type: 'judgment',
    }));
  }

  async dedup(items: CrawlerItem[]): Promise<CrawlerItem[]> {
    return this.unique(items);
  }
}
