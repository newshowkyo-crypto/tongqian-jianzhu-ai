import { Injectable } from '@nestjs/common';

type SuperInputItem = { content: string; type: 'document' | 'image' | 'text' | 'url' | 'voice' };

@Injectable()
export class SuperInputService {
  route(items: SuperInputItem[]): { route: 'chat' | 'workflow'; summary: string; types: string[] } {
    const types = [...new Set(items.map((item) => item.type))];
    const route = types.includes('document') || types.includes('url') ? 'workflow' : 'chat';
    return { route, summary: `Combined ${types.join(', ')} input for AI orchestration.`, types };
  }
}
