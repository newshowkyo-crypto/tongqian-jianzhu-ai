import { Injectable } from '@nestjs/common';

interface RfpDoc {
  name: string;
  ossUrl: string;
}

interface RfpChunk {
  content: string;
  docName: string;
  id: string;
  keywords: string[];
  pageNumber?: number;
  tenderId: string;
}

@Injectable()
export class RfpRagService {
  private readonly chunks = new Map<string, RfpChunk[]>();

  async ingestRfpDocs(tenderId: string, docs: RfpDoc[]): Promise<{ chunks: number; docs: number }> {
    const parsed = docs.flatMap((doc) => this.splitIntoChunks(tenderId, doc.name, `文档来源 ${doc.ossUrl}\n评分办法 废标条件 资格要求 工期 付款 履约保证金 不平衡报价限制 投标保证金。`));
    this.chunks.set(tenderId, [...(this.chunks.get(tenderId) ?? []), ...parsed]);
    return { chunks: parsed.length, docs: docs.length };
  }

  searchAcrossRfp(tenderId: string, query: string, topK = 8): RfpChunk[] {
    const tokens = this.keywords(query);
    return (this.chunks.get(tenderId) ?? [])
      .map((chunk) => ({ chunk, score: tokens.filter((token) => chunk.content.includes(token) || chunk.keywords.includes(token)).length }))
      .filter((row) => row.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, topK)
      .map((row) => row.chunk);
  }

  compareDocs(tenderId: string): Array<{ change: string; docName: string }> {
    return (this.chunks.get(tenderId) ?? []).filter((chunk) => /答疑|补遗|澄清/u.test(chunk.docName)).map((chunk) => ({ change: chunk.content.slice(0, 120), docName: chunk.docName }));
  }

  keyClauses(tenderId: string): Array<{ category: string; pageNumber?: number; risk: 'green' | 'red' | 'yellow'; suggestion: string }> {
    return ['评分办法', '废标条件', '资格预审', '投标保证金', '工期要求', '付款方式', '履约保证金', '不平衡报价限制'].map((category) => {
      const hit = this.searchAcrossRfp(tenderId, category, 1)[0];
      return { category, pageNumber: hit?.pageNumber, risk: category.includes('废标') ? 'red' : 'yellow', suggestion: `建议关注${category}原文和补遗差异。` };
    });
  }

  private splitIntoChunks(tenderId: string, docName: string, text: string): RfpChunk[] {
    const chunks: RfpChunk[] = [];
    for (let index = 0; index < text.length; index += 600) {
      const content = text.slice(Math.max(0, index - 200), index + 800);
      chunks.push({ content, docName, id: crypto.randomUUID(), keywords: this.keywords(content), pageNumber: Math.floor(index / 1600) + 1, tenderId });
    }
    return chunks;
  }

  private keywords(text: string): string[] {
    return [...new Set(text.split(/[^\p{L}\p{N}]+/u).filter((token) => token.length >= 2))];
  }
}
