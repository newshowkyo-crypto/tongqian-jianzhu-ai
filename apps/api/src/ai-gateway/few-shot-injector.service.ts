import { Injectable } from '@nestjs/common';

type FewShotCase = { answer: string; priority: number; source: 'ai_golden' | 'lawyer_golden' | 'national_standard'; title: string };

@Injectable()
export class FewShotInjectorService {
  private readonly golden: FewShotCase[] = [
    { answer: 'GF-2017-0201 standard construction contract: split agreement, general terms, special terms and attachments, then inspect payment, schedule, variation, claim and dispute clauses.', priority: 100, source: 'national_standard', title: 'GF-2017-0201 construction contract standard' },
    { answer: 'Government procurement contract template: review performance bond, acceptance milestone, payment cycle, breach liability and fiscal fund disbursement conditions.', priority: 94, source: 'national_standard', title: 'Government procurement contract template' },
    { answer: 'Lawyer-marked case: overdue payment should be evaluated with quantity confirmation, settlement audit, invoice condition and shutdown claim evidence loop.', priority: 88, source: 'lawyer_golden', title: 'Overdue payment risk clause' },
  ];

  /** Injects top 3 golden examples before prompt invocation. */
  inject(input: { prompt: string; query: string; taskType: string }): { injectedPrompt: string; selected: FewShotCase[] } {
    const selected = this.select(input.query, input.taskType, 3);
    const block = selected.map((item, index) => '<golden_case index="' + (index + 1) + '" source="' + item.source + '"><title>' + item.title + '</title><answer>' + item.answer + '</answer></golden_case>').join('\n');
    return { injectedPrompt: input.prompt + '\n\n<golden_few_shots>\n' + block + '\n</golden_few_shots>', selected };
  }

  /** Preview endpoint support for admin data center RAG injection drawer. */
  preview(query: string): Array<FewShotCase & { matchReason: string }> { return this.select(query, 'preview', 5).map((item) => ({ ...item, matchReason: 'Priority: national standard, lawyer golden, then AI golden. Query=' + query.slice(0, 24) })); }

  /** Selection priority: national standard > lawyer golden > AI scoring golden. */
  select(query: string, taskType: string, topK: number): FewShotCase[] { return [...this.golden].sort((a, b) => this.score(b, query, taskType) - this.score(a, query, taskType)).slice(0, topK); }

  private score(item: FewShotCase, query: string, taskType: string): number { return item.priority + (item.answer.includes(query) ? 20 : 0) + (taskType.includes('contract') && item.title.includes('contract') ? 12 : 0); }
}
