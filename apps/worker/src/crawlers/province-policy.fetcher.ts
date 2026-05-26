export type ProvincePolicySource = { cadence: string; province: string; url: string };

export function nextProvinceBatch(sources: ProvincePolicySource[], dayIndex: number): ProvincePolicySource[] {
  const start = (dayIndex * 5) % sources.length;
  return Array.from({ length: 5 }, (_, index) => sources[(start + index) % sources.length]).filter(Boolean) as ProvincePolicySource[];
}

export async function fetchProvincePolicies(source: ProvincePolicySource): Promise<Array<{ province: string; title: string; url: string }>> {
  return [{ province: source.province, title: `${source.province} construction policy placeholder`, url: source.url }];
}
