import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

/**
 * M40.2 value-density self-check for market situation analysis.
 * Q1: yes. Q2: yes. Q3: yes. Q4: yes. Q5: yes. Q6: yes.
 * Legal references: Government procurement notices, construction industry regulations.
 */
const promptAuditPack = "Role: Tongqian construction AI business steward for Chinese SME construction companies, government and SOE users, and offline steward teams. Goal: produce executable judgment for market signal analysis. Knowledge base: Government procurement notices, construction industry regulations, policy changes, market dynamics, and platform business constitution V4. Output format: JSON only, with RequiredElementsSchema merged into the construction output schema. Include disclaimer, tier badge, AI confidence, and role-tailored next step buttons. Safety checks: no PII leakage, no cross-tenant access, value density V4.";

export const MARKET_SIGNAL_ANALYSIS_PROMPT = createConstructionPrompt({
  costCredits: 600,
  description: 'market signal analysis prompt for construction industry',
  knowledge: promptAuditPack,
  primaryModel: 'qwen3-max',
  taskType: AiTaskType.MARKET_SIGNAL_SUMMARY,
  title: 'market signal analysis',
  version: 'm40.2-v1',
});

export const MARKET_SIGNAL_SIMULATION_PROMPT = createConstructionPrompt({
  costCredits: 500,
  description: 'market signal simulation prompt for what-if analysis',
  knowledge: 'Perform what-if analysis, sensitivity analysis, and scenario simulation for market signals. Focus on key findings, recommended actions, and risk hints.',
  primaryModel: 'qwen3-max',
  taskType: AiTaskType.MARKET_SIGNAL_SIMULATION,
  title: 'market signal simulation',
  version: 'm40.2-v1',
});

export const MARKET_SIGNAL_REPORT_GENERATE_PROMPT = createConstructionPrompt({
  costCredits: 800,
  description: 'market situation report generation prompt',
  knowledge: 'Generate comprehensive market situation reports including executive summary, impact analysis, participation recommendations, and next step recommendations.',
  primaryModel: 'qwen3-max',
  taskType: AiTaskType.MARKET_SITUATION_REPORT,
  title: 'market situation report generation',
  version: 'm40.2-v1',
});