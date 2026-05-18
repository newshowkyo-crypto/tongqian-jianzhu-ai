export interface AiTaskJobPayload {
  taskId: string;
  traceId: string;
}

export async function processAiTaskJob(payload: AiTaskJobPayload): Promise<{ progress: number; taskId: string }> {
  return { progress: 100, taskId: payload.taskId };
}
