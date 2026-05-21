import { Injectable, Logger } from '@nestjs/common';

type RagItem = { content: string; id: string; metadata: Record<string, unknown>; title: string; type: string; vector: number[] };

@Injectable()
export class RagIndexerService {
  private readonly index = new Map<string, RagItem>();
  private readonly logger = new Logger(RagIndexerService.name);

  /** Embeds a golden record into DashVector when enabled; mock mode uses deterministic keyword vectors. */
  async upsertGolden(input: { content: string; id?: string; metadata?: Record<string, unknown>; title: string; type: string }): Promise<RagItem> {
    const id = input.id ?? crypto.randomUUID();
    const item = { content: input.content, id, metadata: { golden: true, mode: this.mode(), ...(input.metadata ?? {}) }, title: input.title, type: input.type, vector: this.embed(input.title + '\n' + input.content) };
    this.index.set(id, item);
    this.logger.log('rag.upsert ' + id + ' mode=' + this.mode());
    return item;
  }

  /** Recalls top-5 items for prompt few-shot and AI assistant context. */
  async retrieve(input: { query: string; topK?: number; type?: string }): Promise<Array<RagItem & { score: number }>> {
    const queryVector = this.embed(input.query);
    return [...this.index.values()].filter((item) => !input.type || item.type === input.type).map((item) => ({ ...item, score: this.cosine(queryVector, item.vector) })).sort((a, b) => b.score - a.score).slice(0, input.topK ?? 5);
  }

  /** Seeds national templates so empty customer samples do not block prompt quality. */
  seedNationalStandards(): number {
    const seeds = [
      ['standard-contract-gf2017', 'GF-2017-0201 construction contract', 'Agreement, general terms, special terms and attachments; payment, schedule, quality, variation, claim and dispute resolution.'],
      ['standard-epc-gf2020', 'GF-2020-0214 EPC contract', 'Design, procurement and construction responsibility boundary, milestone payment, consortium liability and completion acceptance.'],
      ['standard-doc-gbt9704', 'GB/T 9704 official document', 'Request, report, notice, letter and meeting minutes skeleton for government-facing document drafting.'],
    ] as const;
    for (const [id, title, content] of seeds) void this.upsertGolden({ content, id, metadata: { source: 'national_standard' }, title, type: 'standard-template' });
    return seeds.length;
  }

  private mode(): 'dashvector' | 'mock-sqlite-keyword' { const key = process.env.DASHVECTOR_API_KEY; return key && !key.includes('PLACEHOLDER') ? 'dashvector' : 'mock-sqlite-keyword'; }
  private embed(text: string): number[] { const tokens = text.split(/[,.;:\s/]+/).filter(Boolean); return Array.from({ length: 24 }, (_, index) => tokens.reduce((sum, token) => sum + (token.charCodeAt(index % token.length) || 0), 0) / Math.max(tokens.length, 1) / 1000); }
  private cosine(a: number[], b: number[]): number { const dot = a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0); const na = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0)); const nb = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0)); return na === 0 || nb === 0 ? 0 : dot / (na * nb); }
}
