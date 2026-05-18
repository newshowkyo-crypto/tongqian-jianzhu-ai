import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve('apps/api/src/ai-gateway/prompts');

const prompts = [
  ['chat/general.ts', 'chatGeneralPrompt', 'CHAT_LONG', 'AI 老板助理通用', 120, '围绕老板日常经营问答、待办拆解、风险提示、跨模块导航和下一步动作给出简洁建议。'],
  ['chat/kpi-query.ts', 'chatKpiQueryPrompt', 'CHAT_KPI_QUERY', '内部数据问答', 180, '结合平台 KPI、回款、项目、点数、机会、风险红灯和订阅数据回答经营问题。'],
  ['chat/intent-classifier.ts', 'chatIntentClassifierPrompt', 'CHAT_INTENT', '意图识别', 80, '识别用户意图、角色、紧急程度、需要调用的模块和是否需要人工复核。'],
  ['chat/morning-briefing.ts', 'morningBriefingPrompt', 'CHAT_SHORT', '早安 AI 简报', 260, '生成老板早安简报，覆盖今日机会、风险红灯、审批、现金流、点数和建议动作。'],
  ['opportunity/radar-summary.ts', 'opportunityRadarSummaryPrompt', 'OPP_PEER_RADAR', '机会推送速读', 180, '压缩机会雷达结果，指出匹配原因、竞争强度、行动窗口和证据缺口。'],
  ['opportunity/investability.ts', 'opportunityInvestabilityPrompt', 'OPP_INVESTABILITY', '可投性分析', 300, '评估项目可投性、资金压力、业主信用、毛利空间和退出风险。'],
  ['opportunity/owner-verify.ts', 'opportunityOwnerVerifyPrompt', 'OPP_AUTHENTICITY', '业主核验', 220, '核验业主真实性、付款能力、项目来源、授权链路和商务接触边界。'],
  ['contract/review-basic.ts', 'contractReviewBasicPrompt', 'CONTRACT_REVIEW_BASIC', '合同基础审查', 300, '识别施工合同付款、验收、违约、质保、担保和争议解决中的基础风险。'],
  ['contract/review-pro.ts', 'contractReviewProPrompt', 'CONTRACT_REVIEW_PRO', '合同深度审查', 1500, '对复杂建筑合同做深度风险审查，覆盖无限担保、付款拖延、索赔障碍和证据链。'],
  ['contract/modification-letter.ts', 'contractModificationLetterPrompt', 'CONTRACT_MODIFICATION_LETTER', '修改建议函', 500, '把合同风险转化为可发给对方的克制修改建议函和替代表述。'],
  ['contract/claim-strategy.ts', 'contractClaimStrategyPrompt', 'CONTRACT_CLAIM_STRATEGY', '索赔策略', 800, '围绕工期、变更、停窝工、材料涨价和付款延迟形成索赔证据与谈判策略。'],
  ['tender/summary.ts', 'tenderSummaryPrompt', 'TENDER_SUMMARY', '招标速读', 240, '快速提炼招标公告、资格条件、评分办法、风险条款和投标时间表。'],
  ['tender/eligibility.ts', 'tenderEligibilityPrompt', 'TENDER_ELIGIBILITY', '资格自查', 260, '按企业资质、业绩、人员、信用和保证金要求判断投标资格缺口。'],
  ['tender/framework.ts', 'tenderFrameworkPrompt', 'TENDER_FRAMEWORK', '标书框架商务技术', 1200, '生成商务标和技术标框架，突出评分项、类似业绩、施工组织和风险响应。'],
  ['tender/score-prediction.ts', 'tenderScorePredictionPrompt', 'TENDER_SCORE_PREDICT', '评标预测', 500, '根据评分办法和企业画像预测得分区间、短板和补强动作。'],
  ['tender/risk.ts', 'tenderRiskPrompt', 'TENDER_RISK', '投标风险审查', 360, '识别招标文件中的废标、围标嫌疑、异常资质、付款和履约风险。'],
  ['tender/section-technical.ts', 'tenderSectionTechnicalPrompt', 'TENDER_SECTION_TECHNICAL', '技术标章节生成', 700, '生成施工部署、进度、质量、安全、环保和重难点响应章节框架。'],
  ['tender/section-commercial.ts', 'tenderSectionCommercialPrompt', 'TENDER_SECTION_COMMERCIAL', '商务标章节生成', 650, '生成报价说明、偏差表、合同响应、企业实力和商务承诺章节框架。'],
  ['tender/section-qualification.ts', 'tenderSectionQualificationPrompt', 'TENDER_SECTION_QUALIFICATION', '资格标章节生成', 520, '整理资质、业绩、人员、信用、财务和证明材料清单。'],
  ['qualification/checkup.ts', 'qualificationCheckupPrompt', 'QUAL_CHECKUP', '资质体检', 300, '检查企业资质、人员证书、业绩、社保、设备和信用动态风险。'],
  ['qualification/upgrade-path.ts', 'qualificationUpgradePathPrompt', 'QUAL_UPGRADE_PATH', '资质升级路径', 900, '规划资质升级路径、人员补齐、业绩准备、材料窗口和时间成本。'],
  ['qualification/personnel-compliance.ts', 'qualificationPersonnelCompliancePrompt', 'QUAL_DYNAMIC_REVIEW', '人员合规', 360, '核验建造师、职称、技工、三类人员和社保一致性风险。'],
  ['cost/estimate.ts', 'costEstimatePrompt', 'COST_ROUGH_ESTIMATE', '造价粗估', 350, '基于项目类型、面积、地区和主要工程量给出造价粗估和敏感项。'],
  ['drawing/understand.ts', 'drawingUnderstandPrompt', 'DRAWING_UNDERSTAND', '图纸理解', 420, '解释图纸关键构件、工程范围、疑问点、碰撞风险和算量提示。'],
  ['doc/reminder-letter.ts', 'docReminderLetterPrompt', 'OPS_REMINDER_LETTER', '催款函', 220, '生成克制、有证据、有台阶的工程款催收函和沟通要点。'],
  ['doc/meeting-minutes.ts', 'docMeetingMinutesPrompt', 'OPS_MEETING_MINUTES', '会议纪要', 180, '把会议录音或记录整理成责任清晰、时间明确、可追踪的纪要。'],
  ['doc/work-report.ts', 'docWorkReportPrompt', 'OPS_WORK_REPORT', '工作汇报', 180, '生成项目、经营、回款、投标和政企服务场景的工作汇报。'],
  ['doc/gov-doc-5-types.ts', 'govDocFiveTypesPrompt', 'GOV_DOC_REPORT', '政府公文 5 类', 500, '生成通知、请示、报告、纪要、函五类政企公文草稿，保留审批口径。', true],
  ['policy/match.ts', 'policyMatchPrompt', 'GOV_POLICY_IMPACT', '政策资金匹配', 1000, '匹配政策资金窗口、申报条件、材料缺口、时间节点和落地路径。', true],
  ['policy/impact-analysis.ts', 'policyImpactAnalysisPrompt', 'OPS_POLICY_IMPACT', '政策影响分析', 420, '分析政策对建筑企业经营、资质、现金流、招投标和项目机会的影响。'],
  ['safety/inspection-record.ts', 'safetyInspectionRecordPrompt', 'SITE_MAJOR_HAZARD', '安全检查记录', 260, '生成现场安全检查记录、隐患分级、整改责任和复查闭环。'],
  ['cash/aging-analysis.ts', 'cashAgingAnalysisPrompt', 'CASH_AGING_ANALYSIS', '应收账龄分析', 280, '分析工程款账龄、回款优先级、催收证据和现金流风险。'],
  ['cash/cashflow-forecast.ts', 'cashflowForecastPrompt', 'CASH_CASHFLOW_FORECAST', '现金流预测', 360, '预测未来 30/60/90 天现金流缺口、付款压力和缓释动作。'],
  ['site/archive-checklist.ts', 'siteArchiveChecklistPrompt', 'SITE_ARCHIVE_CHECKLIST', '竣工资料归档清单', 240, '生成竣工资料、签证、变更、验收和结算证据归档清单。'],
];

for (const [file, exportName, taskType, title, costCredits, knowledge, governmentOnly = false] of prompts) {
  const out = `import { AiTaskType } from '@tongqian/types';\n\nimport { createConstructionPrompt } from '../shared/system-base.js';\n\nexport const ${exportName} = createConstructionPrompt({\n  costCredits: ${costCredits},\n  description: '${title} prompt template for construction business workflows.',\n  governmentOnly: ${governmentOnly},\n  knowledge: '${knowledge}',\n  taskType: AiTaskType.${taskType},\n  title: '${title}',\n});\n`;
  const path = resolve(root, file);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, out);
}

const index = `${prompts.map(([file, exportName]) => `import { ${exportName} } from './${file.replace(/\\.ts$/, '.js')}';`).join('\n')}\n\nexport const allPromptTemplates = [\n${prompts.map(([, exportName]) => `  ${exportName},`).join('\n')}\n];\n\nexport const promptTemplateByTaskType = new Map(allPromptTemplates.map((template) => [template.taskType, template]));\n`;
await writeFile(resolve(root, 'index.ts'), index);
