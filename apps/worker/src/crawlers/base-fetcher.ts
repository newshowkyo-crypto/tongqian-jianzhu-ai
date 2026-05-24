import crypto from 'node:crypto';

export interface FetchResult<TItem> {
  durationMs: number;
  errors: string[];
  failedCount: number;
  fetchedCount: number;
  items: TItem[];
  traceId: string;
  upsertedCount: number;
}

export interface CrawlerItem {
  sourceUrl: string;
  title: string;
  type: string;
}

export abstract class BaseFetcher<TItem extends CrawlerItem> {
  abstract sourceName: string;
  abstract sourceUrl: string;
  protected maxRetries = 5;
  protected requestIntervalMs = 2000;
  protected userAgent = 'Tongqian research crawler + biz@tongqian.xin';

  abstract dedup(items: TItem[]): Promise<TItem[]>;
  abstract fetch(): Promise<TItem[]>;
  abstract parse(html: string): TItem[];

  async run(): Promise<FetchResult<TItem>> {
    const traceId = crypto.randomUUID();
    const start = Date.now();
    const result: FetchResult<TItem> = { durationMs: 0, errors: [], failedCount: 0, fetchedCount: 0, items: [], traceId, upsertedCount: 0 };
    if (!(await this.checkRobotsTxt())) {
      result.errors.push('robots.txt disallow');
      result.durationMs = Date.now() - start;
      await this.writeIngestRun(result);
      return result;
    }
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const items = await this.fetch();
        result.fetchedCount = items.length;
        result.items = await this.dedup(items);
        result.upsertedCount = result.items.length;
        break;
      } catch (error) {
        result.failedCount++;
        result.errors.push(`attempt ${attempt}: ${error instanceof Error ? error.message : 'unknown'}`);
        if (attempt + 1 < this.maxRetries) await this.exponentialBackoff(attempt + 1);
      }
    }
    result.durationMs = Date.now() - start;
    await this.writeIngestRun(result);
    return result;
  }

  protected async checkRobotsTxt(): Promise<boolean> {
    try {
      const robotsUrl = new URL('/robots.txt', this.sourceUrl).toString();
      const response = await fetch(robotsUrl, { headers: { 'User-Agent': this.userAgent } });
      const text = await response.text();
      const firstPath = new URL(this.sourceUrl).pathname.split('/').filter(Boolean)[0] ?? '';
      return !text.includes(`Disallow: /${firstPath}`);
    } catch {
      return true;
    }
  }

  protected async fetchText(url = this.sourceUrl): Promise<string> {
    const response = await fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!response.ok) throw new Error(`${this.sourceName} ${response.status}`);
    return response.text();
  }

  protected hashItem(item: TItem): string {
    return crypto.createHash('sha256').update(`${item.sourceUrl}:${item.title}`).digest('hex');
  }

  protected unique(items: TItem[]): TItem[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = this.hashItem(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  protected async exponentialBackoff(attempt: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, Math.min(this.requestIntervalMs * 2 ** attempt, 60_000)));
  }

  protected async writeIngestRun(result: FetchResult<TItem>): Promise<void> {
    void {
      ingest_runs: {
        errors: result.errors,
        failed_count: result.failedCount,
        fetched_count: result.fetchedCount,
        source_name: this.sourceName,
        trace_id: result.traceId,
        upserted_count: result.upsertedCount,
      },
    };
  }
}
