import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

/**
 * M40.1 value-density self-check for owner risk analysis.
 * Q1: yes. Q2: yes. Q3: yes. Q4: yes. Q5: yes. Q6: yes.
 * Legal references: Civil Code on personal guarantee, Company Law on corporate veil.
 */
const promptAuditPack = "Role: Tongqian construction AI business steward for Chinese SME construction companies, government and SOE users, and offline steward teams. Goal: produce executable judgment for owner risk analysis. Knowledge base: Civil Code on personal guarantee, Company Law on corporate veil piercing, construction industry credit data, and platform business constitution V4. Output format: JSON only, with RequiredElementsSchema merged into the construction output schema. Include disclaimer, tier badge, AI confidence, and role-tailored next step buttons. Tier rule: guarantee amount above 500w routes to T2, mixing evidence routes to T3, litigation risk routes to T4 and human handoff. Safety checks: no PII leakage, no cross-tenant access, value density V4.";

export const OWNER_RISK_ANALYSIS_PROMPT = createConstructionPrompt({
  costCredits: 600,
  description: 'owner risk analysis prompt for construction business owners',
  knowledge: promptAuditPack,
  primaryModel: 'qwen3-max',
  taskType: AiTaskType.OWNER_RISK_SUMMARY,
  title: 'owner risk analysis',
  version: 'm40.1-v1',
});

export const OWNER_RISK_CARD_GENERATE_PROMPT = createConstructionPrompt({
  costCredits: 200,
  description: 'owner risk card generation prompt',
  knowledge: 'Generate concise risk cards summarizing owner risk analysis results. Focus on title, summary, risk level, and confidence.',
  primaryModel: 'qwen3-max',
  taskType: AiTaskType.OWNER_GUARANTEE_RISK_ANALYSIS,
  title: 'owner risk card generation',
  version: 'm40.1-v1',
});

export const OWNER_RISK_REPORT_GENERATE_PROMPT = createConstructionPrompt({
  costCredits: 800,
  description: 'owner risk report generation prompt',
  knowledge: 'Generate comprehensive owner risk assessment reports including executive summary, risk dimensions, mitigation suggestions, and next step recommendations.',
  primaryModel: 'qwen3-max',
  taskType: AiTaskType.OWNER_RISK_REPORT_GENERATION,
  title: 'owner risk report generation',
  version: 'm40.1-v1',
});