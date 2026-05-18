import { Injectable } from '@nestjs/common';
import type { AiOutputTier, PromptTemplate, TierContext } from '@tongqian/types';

@Injectable()
export class TierResolverService {
  resolve(template: PromptTemplate, context: TierContext): AiOutputTier {
    return template.tier(context);
  }
}
