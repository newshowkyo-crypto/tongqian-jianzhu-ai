/* eslint-disable import/order */
import { chatGeneralPrompt } from './chat/general.js';
import { chatKpiQueryPrompt } from './chat/kpi-query.js';
import { chatIntentClassifierPrompt } from './chat/intent-classifier.js';
import { morningBriefingPrompt } from './chat/morning-briefing.js';
import { stewardAssistantPrompt } from './chat/steward-assistant.js';
import { govAssistantPrompt } from './chat/gov-assistant.js';
import { opportunityRadarSummaryPrompt } from './opportunity/radar-summary.js';
import { opportunityInvestabilityPrompt } from './opportunity/investability.js';
import { opportunityOwnerVerifyPrompt } from './opportunity/owner-verify.js';
import { contractReviewBasicPrompt } from './contract/review-basic.js';
import { contractReviewProPrompt } from './contract/review-pro.js';
import { contractModificationLetterPrompt } from './contract/modification-letter.js';
import { contractClaimStrategyPrompt } from './contract/claim-strategy.js';
import { tenderSummaryPrompt } from './tender/summary.js';
import { tenderEligibilityPrompt } from './tender/eligibility.js';
import { tenderFrameworkPrompt } from './tender/framework.js';
import { tenderScorePredictionPrompt } from './tender/score-prediction.js';
import { tenderRiskPrompt } from './tender/risk.js';
import { tenderSectionTechnicalPrompt } from './tender/section-technical.js';
import { tenderSectionCommercialPrompt } from './tender/section-commercial.js';
import { tenderSectionQualificationPrompt } from './tender/section-qualification.js';
import { qualificationCheckupPrompt } from './qualification/checkup.js';
import { qualificationUpgradePathPrompt } from './qualification/upgrade-path.js';
import { qualificationPersonnelCompliancePrompt } from './qualification/personnel-compliance.js';
import { costEstimatePrompt } from './cost/estimate.js';
import { drawingUnderstandPrompt } from './drawing/understand.js';
import { docReminderLetterPrompt } from './doc/reminder-letter.js';
import { docMeetingMinutesPrompt } from './doc/meeting-minutes.js';
import { docWorkReportPrompt } from './doc/work-report.js';
import { govDocFiveTypesPrompt } from './doc/gov-doc-5-types.js';
import { policyMatchPrompt } from './policy/match.js';
import { policyImpactAnalysisPrompt } from './policy/impact-analysis.js';
import { safetyInspectionRecordPrompt } from './safety/inspection-record.js';
import { cashAgingAnalysisPrompt } from './cash/aging-analysis.js';
import { cashflowForecastPrompt } from './cash/cashflow-forecast.js';
import { siteArchiveChecklistPrompt } from './site/archive-checklist.js';
import { OWNER_RISK_ANALYSIS_PROMPT, OWNER_RISK_CARD_GENERATE_PROMPT, OWNER_RISK_REPORT_GENERATE_PROMPT } from './owner-risk/risk-analysis.js';
import { MARKET_SIGNAL_ANALYSIS_PROMPT, MARKET_SIGNAL_SIMULATION_PROMPT, MARKET_SIGNAL_REPORT_GENERATE_PROMPT } from './market-situation/signal-analysis.js';

export const allPromptTemplates = [
  chatGeneralPrompt,
  chatKpiQueryPrompt,
  chatIntentClassifierPrompt,
  morningBriefingPrompt,
  stewardAssistantPrompt,
  opportunityRadarSummaryPrompt,
  opportunityInvestabilityPrompt,
  opportunityOwnerVerifyPrompt,
  contractReviewBasicPrompt,
  contractReviewProPrompt,
  contractModificationLetterPrompt,
  contractClaimStrategyPrompt,
  tenderSummaryPrompt,
  tenderEligibilityPrompt,
  tenderFrameworkPrompt,
  tenderScorePredictionPrompt,
  tenderRiskPrompt,
  tenderSectionTechnicalPrompt,
  tenderSectionCommercialPrompt,
  tenderSectionQualificationPrompt,
  qualificationCheckupPrompt,
  qualificationUpgradePathPrompt,
  qualificationPersonnelCompliancePrompt,
  costEstimatePrompt,
  drawingUnderstandPrompt,
  docReminderLetterPrompt,
  docMeetingMinutesPrompt,
  docWorkReportPrompt,
  govDocFiveTypesPrompt,
  policyMatchPrompt,
  policyImpactAnalysisPrompt,
  govAssistantPrompt,
  safetyInspectionRecordPrompt,
  cashAgingAnalysisPrompt,
  cashflowForecastPrompt,
  siteArchiveChecklistPrompt,
  OWNER_RISK_ANALYSIS_PROMPT,
  OWNER_RISK_CARD_GENERATE_PROMPT,
  OWNER_RISK_REPORT_GENERATE_PROMPT,
  MARKET_SIGNAL_ANALYSIS_PROMPT,
  MARKET_SIGNAL_SIMULATION_PROMPT,
  MARKET_SIGNAL_REPORT_GENERATE_PROMPT,
];

export const promptTemplateByTaskType = new Map(allPromptTemplates.map((template) => [template.taskType, template]));

