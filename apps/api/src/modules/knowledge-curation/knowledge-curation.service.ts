import { Injectable } from '@nestjs/common';

type KnowledgeCategory = 'case' | 'policy' | 'regulation' | 'rfp' | 'standard' | 'template';

interface KnowledgeDocument {
  category: KnowledgeCategory;
  chunks: Array<{ id: string; text: string; vectorStatus: 'mock-indexed' }>;
  deletedAt?: string;
  fileName: string;
  id: string;
  parsedAt?: string;
  tags: string[];
  title: string;
  uploadedAt: string;
}

@Injectable()
export class KnowledgeCurationService {
  private readonly docs = new Map<string, KnowledgeDocument>();

  constructor() {
    this.upload({ category: 'standard', fileName: 'GF-2017.docx', tags: ['合同', '范本'], text: '建设工程施工合同示范文本付款、验收、索赔条款。', title: 'GF-2017 建设工程施工合同' });
    this.upload({ category: 'regulation', fileName: 'bidding-law.txt', tags: ['招投标'], text: '招标投标活动应遵循公开、公平、公正和诚实信用原则。', title: '招标投标法核心条款' });
  }

  upload(input: { category: KnowledgeCategory; fileName: string; tags?: string[]; text?: string; title: string }): KnowledgeDocument {
    const doc: KnowledgeDocument = {
      category: input.category,
      chunks: [],
      fileName: input.fileName,
      id: `kd-${crypto.randomUUID()}`,
      tags: input.tags ?? [],
      title: input.title,
      uploadedAt: new Date().toISOString(),
    };
    this.docs.set(doc.id, doc);
    if (input.text) this.parse(doc.id, input.text);
    return doc;
  }

  parse(id: string, text = ''): KnowledgeDocument {
    const doc = this.mustDoc(id);
    const source = text || `${doc.title} ${doc.category} 知识文档已解析`;
    doc.chunks = source.match(/.{1,60}/gu)?.map((chunk, index) => ({ id: `${doc.id}-chunk-${index + 1}`, text: chunk, vectorStatus: 'mock-indexed' })) ?? [];
    doc.parsedAt = new Date().toISOString();
    return doc;
  }

  list(category?: KnowledgeCategory): KnowledgeDocument[] {
    return [...this.docs.values()].filter((doc) => !doc.deletedAt && (!category || doc.category === category));
  }

  update(id: string, patch: Partial<Pick<KnowledgeDocument, 'category' | 'tags' | 'title'>>): KnowledgeDocument {
    const doc = this.mustDoc(id);
    Object.assign(doc, patch);
    return doc;
  }

  softDelete(id: string): KnowledgeDocument {
    const doc = this.mustDoc(id);
    doc.deletedAt = new Date().toISOString();
    return doc;
  }

  stats(): Record<string, number> {
    const active = this.list();
    return active.reduce<Record<string, number>>((acc, doc) => {
      acc[doc.category] = (acc[doc.category] ?? 0) + 1;
      acc.totalDocs = (acc.totalDocs ?? 0) + 1;
      acc.totalChunks = (acc.totalChunks ?? 0) + doc.chunks.length;
      return acc;
    }, {});
  }

  search(taskType: string, keyword: string): Array<{ docId: string; ref: string; text: string }> {
    const allow = taskType.includes('tender') ? ['rfp', 'standard'] : ['regulation', 'standard', 'case', 'policy', 'template'];
    return this.list()
      .filter((doc) => allow.includes(doc.category))
      .flatMap((doc) => doc.chunks.map((chunk) => ({ docId: doc.id, ref: `${doc.title}#${chunk.id}`, text: chunk.text })))
      .filter((chunk) => chunk.text.includes(keyword) || keyword.length < 2)
      .slice(0, 6);
  }

  private mustDoc(id: string): KnowledgeDocument {
    const doc = this.docs.get(id);
    if (!doc) throw new Error('KNOWLEDGE.DOCUMENT.NOT_FOUND');
    return doc;
  }
}
