export class QualPerformanceArchiveService {
  classify(rawFileCount: number): Record<string, unknown> {
    return { classifiedItems: [{ file_url: 'mock://file', type: 'contract', year: 2026 }], packageZipUrl: 'mock://housing-format.zip', rawFileCount };
  }
}
