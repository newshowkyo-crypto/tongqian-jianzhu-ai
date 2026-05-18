import { Injectable } from '@nestjs/common';
import type { AiPromptMessage, PromptTemplate } from '@tongqian/types';

import { injectTierPrompt } from './routing/tier-prompt-injector.js';

@Injectable()
export class PromptBuilderService {
  build(template: PromptTemplate, input: unknown): AiPromptMessage[] {
    const tier = template.tier({});
    const user = template.userTemplate.replace('{{input}}', JSON.stringify(input));
    return [
      { content: injectTierPrompt(template.systemPrompt, tier), role: 'system' },
      ...template.fewShotExamples.flatMap<AiPromptMessage>((example) => [
        { content: JSON.stringify(example.input), role: 'user' },
        { content: JSON.stringify(example.output), role: 'assistant' },
      ]),
      { content: user, role: 'user' },
    ];
  }
}
