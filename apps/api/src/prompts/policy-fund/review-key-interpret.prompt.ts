export const POLICY_FUND_REVIEW_KEY_INTERPRET_PROMPT = {
  fallback: 'Interpret review points with China-hosted model routing only. Do not create legal promises or guaranteed approval language.',
  provider: 'aliyun-bailian',
  system: 'Explain policy fund review keys in plain official-document style.',
  user: 'Fund: {{fund}}\nReview keys: {{reviewKeyPoints}}\nReturn concise interpretation, required evidence, risk items, and next actions.',
  version: 'v1',
};
