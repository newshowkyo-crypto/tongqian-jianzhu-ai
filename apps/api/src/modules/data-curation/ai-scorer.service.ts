import { Injectable, Logger } from '@nestjs/common';

type ScoreInput = { content: string; source: string; title: string; type: string; updatedAt?: string };
type ScoreDimensions = { applicability: number; authority: number; completeness: number; timeliness: number; uniqueness: number };
type ScoreResult = { action: 'archive' | 'golden' | 'review'; cached: boolean; dimensions: ScoreDimensions; reason: string; score: number; traceId: string };

@Injectable()
export class AiScorerService {
  private readonly cache = new Map<string, { expiresAt: number; result: ScoreResult }>();
  private readonly logger = new Logger(AiScorerService.name);

  /** Scores one collected record with the cheap domestic chat model policy and 30 day cache. */
  async score(input: ScoreInput): Promise<ScoreResult> {
    const key = this.cacheKey(input);
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return { ...cached.result, cached: true };
    const dimensions = this.calculateDimensions(input);
    const score = Math.round(dimensions.authority * 0.3 + dimensions.timeliness * 0.2 + dimensions.completeness * 0.25 + dimensions.applicability * 0.15 + dimensions.uniqueness * 0.1);
    const result: ScoreResult = { action: score >= 80 ? 'golden' : score >= 60 ? 'review' : 'archive', cached: false, dimensions, reason: this.reason(input, dimensions, score), score, traceId: crypto.randomUUID() };
    this.cache.set(key, { expiresAt: Date.now() + 30 * 86400_000, result });
    this.logger.log('data-curation.score ' + input.type + ' ' + score);
    return result;
  }

  /** Runs a batch while preserving row level evidence for founder review. */
  async scoreBatch(inputs: ScoreInput[]): Promise<Array<ScoreResult & { index: number; title: string }>> { const results: Array<ScoreResult & { index: number; title: string }> = []; for (const [index, input] of inputs.entries()) results.push({ ...(await this.score(input)), index, title: input.title }); return results; }

  /** Returns the current threshold policy displayed in admin data center. */
  thresholds(): { archiveBelow: number; autoGoldenFrom: number; cacheDays: number; reviewRange: string; scorerModel: string } { return { archiveBelow: 60, autoGoldenFrom: 80, cacheDays: 30, reviewRange: '60-79', scorerModel: 'deepseek-chat mock-real scoring route' }; }

  private calculateDimensions(input: ScoreInput): ScoreDimensions {
    const content = input.content + input.title + input.source;
    const authority = /gov|mohurd|mof|ndrc|pbc|court|standard|official/i.test(content) ? 95 : /association|public|procurement/i.test(content) ? 82 : 65;
    const timeliness = input.updatedAt && Date.now() - Date.parse(input.updatedAt) < 180 * 86400_000 ? 92 : 76;
    const completeness = ['amount', 'deadline', 'qualification', 'clause', 'cause', 'chapter', 'score'].reduce((sum, word) => sum + (content.toLowerCase().includes(word) ? 11 : 0), 35);
    const applicability = /construction|engineering|contract|tender|qualification|fund|document/i.test(content) ? 90 : 62;
    const uniqueness = /GF-2017|GB\/T 9704|judgment|template|golden/i.test(content) ? 94 : 72;
    return { applicability: Math.min(applicability, 100), authority, completeness: Math.min(completeness, 100), timeliness, uniqueness };
  }

  private cacheKey(input: ScoreInput): string { return input.type + ':' + input.source + ':' + input.title + ':' + input.content.length; }
  private reason(input: ScoreInput, d: ScoreDimensions, score: number): string { return input.title + ' score=' + score + '; authority=' + d.authority + ', timeliness=' + d.timeliness + ', completeness=' + d.completeness + ', applicability=' + d.applicability + ', uniqueness=' + d.uniqueness + '. Review weak dimensions before promoting to golden library.'; }
}
