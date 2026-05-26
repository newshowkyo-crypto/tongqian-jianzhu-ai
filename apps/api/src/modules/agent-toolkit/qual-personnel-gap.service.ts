export class QualPersonnelGapService {
  calculate(targetQual: string, currentPersonnel: unknown[]): Record<string, unknown> {
    return { currentPersonnel, gapList: [{ missingCount: 2, role: 'registered constructor', suggestions: ['hire', 'promote', 'transfer'] }], requiredPersonnel: [], targetQual };
  }
}
