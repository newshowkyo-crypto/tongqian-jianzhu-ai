import { Injectable } from '@nestjs/common';

@Injectable()
export class QualityCheckService {
  check(report: Record<string, unknown>): { passed: boolean; qualityIssues: string[] } {
    const raw = JSON.stringify(report);
    const checks = [
      { key: 'disclaimer', ok: raw.includes('disclaimer') || raw.includes('免责声明') },
      { key: 'tier', ok: raw.includes('tier') || raw.includes('Tier') },
      { key: 'confidence', ok: raw.includes('confidence') || raw.includes('信心度') },
      { key: 'guidanceButtons', ok: raw.includes('guidanceButtons') || raw.includes('引导按钮') },
      { key: 'numberUnit', ok: /\d{1,3}(,\d{3})*(元|万|%|天|m2|m3|㎡|m³)/u.test(raw) },
    ];
    const qualityIssues = checks.filter((item) => !item.ok).map((item) => item.key);
    return { passed: qualityIssues.length === 0, qualityIssues };
  }
}
