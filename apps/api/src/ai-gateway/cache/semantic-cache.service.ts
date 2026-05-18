import { Injectable } from '@nestjs/common';

@Injectable()
export class SemanticCacheService {
  private readonly entries: Array<{ key: string; vector: number[]; value: unknown }> = [];

  lookup<T>(key: string, vector: number[], threshold = 0.95): T | undefined {
    return this.entries.find((entry) => entry.key === key && cosine(entry.vector, vector) >= threshold)?.value as T | undefined;
  }

  set(key: string, vector: number[], value: unknown): void {
    this.entries.push({ key, vector, value });
  }
}

function cosine(a: number[], b: number[]): number {
  const dot = a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
  const aNorm = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const bNorm = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  return aNorm === 0 || bNorm === 0 ? 0 : dot / (aNorm * bNorm);
}
