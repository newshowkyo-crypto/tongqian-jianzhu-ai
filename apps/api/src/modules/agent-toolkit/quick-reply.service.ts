const tones = ['professional', 'friendly', 'urgent'] as const;

export class QuickReplyService {
  reply(customerQuestion: string, replyTone: (typeof tones)[number] = 'professional'): Record<string, unknown> {
    return { aiReply: `[${replyTone}] ${customerQuestion} - answer with evidence, boundary, and next step.`, creditsCost: 50, customerQuestion, replyTone };
  }

  tones(): string[] {
    return [...tones];
  }
}
