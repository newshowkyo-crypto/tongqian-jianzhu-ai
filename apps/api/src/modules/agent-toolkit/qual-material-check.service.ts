export class QualMaterialCheckService {
  check(targetQual: string, uploadedFiles: string[]): Record<string, unknown> {
    return { completePct: 82, creditsCost: 200, missingItems: ['personnel certificate', 'performance proof'], notMeetItems: [], targetQual, uploadedFiles };
  }
}
