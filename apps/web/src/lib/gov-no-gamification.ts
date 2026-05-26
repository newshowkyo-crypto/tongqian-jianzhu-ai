export function govGamificationDisabled(input: { tenantType?: string }): boolean {
  return input.tenantType === 'gov' || input.tenantType === 'soe';
}

export function filterGovGameMechanics<T extends { kind?: string }>(tenantType: string, items: T[]): T[] {
  if (!govGamificationDisabled({ tenantType })) return items;
  return items.filter((item) => !['badge', 'lottery', 'pk', 'rank', 'streak'].includes(item.kind ?? ''));
}
