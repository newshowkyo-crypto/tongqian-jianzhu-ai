export enum AiOutputTier {
  TIER_1 = 1,
  TIER_2 = 2,
  TIER_3 = 3,
  TIER_4 = 4,
}

export enum AiOutputTierAction {
  GIVE_EXECUTABLE_PLAN = 'give_executable_plan',
  SUGGEST_HUMAN_REVIEW = 'suggest_human_review',
  GUIDE_TO_CONSULTING = 'guide_to_consulting',
  FORCE_HUMAN_HANDOFF = 'force_human_handoff',
}

export interface AiTierDescriptor {
  tier: AiOutputTier;
  action: AiOutputTierAction;
  shouldCallModel: boolean;
  requiresHumanEntry: boolean;
  requiresSelfExecutionFirst: boolean;
}

export const AI_TIER_DESCRIPTORS: readonly AiTierDescriptor[] = [
  {
    tier: AiOutputTier.TIER_1,
    action: AiOutputTierAction.GIVE_EXECUTABLE_PLAN,
    shouldCallModel: true,
    requiresHumanEntry: false,
    requiresSelfExecutionFirst: false,
  },
  {
    tier: AiOutputTier.TIER_2,
    action: AiOutputTierAction.SUGGEST_HUMAN_REVIEW,
    shouldCallModel: true,
    requiresHumanEntry: false,
    requiresSelfExecutionFirst: true,
  },
  {
    tier: AiOutputTier.TIER_3,
    action: AiOutputTierAction.GUIDE_TO_CONSULTING,
    shouldCallModel: true,
    requiresHumanEntry: true,
    requiresSelfExecutionFirst: true,
  },
  {
    tier: AiOutputTier.TIER_4,
    action: AiOutputTierAction.FORCE_HUMAN_HANDOFF,
    shouldCallModel: false,
    requiresHumanEntry: true,
    requiresSelfExecutionFirst: false,
  },
];

export const AI_OUTPUT_TIER_VALUES = Object.values(AiOutputTier);
export const AI_OUTPUT_TIER_ACTION_VALUES = Object.values(AiOutputTierAction);
