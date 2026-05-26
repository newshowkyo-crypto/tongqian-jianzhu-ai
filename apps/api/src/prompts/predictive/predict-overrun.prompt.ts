export const predictOverrunPrompt = {
  fallback: 'If schedule evidence is missing, mark low confidence and recommend PM review.',
  redLines: ['No absolute wording', 'No certain failure claim'],
  taskType: 'PREDICT_PROJECT_OVERRUN',
  user: 'Predict project overrun, qualification expiry, agent score drop, and customer churn risk across four time windows.',
  version: 'v1',
};
