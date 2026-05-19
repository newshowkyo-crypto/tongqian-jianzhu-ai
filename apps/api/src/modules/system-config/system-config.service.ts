import { Injectable } from '@nestjs/common';
import { seedSystemConfigs } from '@tongqian/constants';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

export interface SystemConfigRecord<TValue = unknown> {
  key: string;
  value: TValue;
  description?: string;
  isOverridable: boolean;
}

export interface SystemConfigReader {
  findByKey<TValue = unknown>(key: string): Promise<SystemConfigRecord<TValue> | null>;
}

@Injectable()
export class SystemConfigService {
  private readonly defaultConfigs: Map<string, { value: unknown }> = new Map(
    seedSystemConfigs().map((config) => [config.key, config] as const),
  );

  private readonly cache = new Map<string, unknown>();
  private readonly overrides = new Map<string, SystemConfigRecord>();
  private readonly versions = new Map<string, Array<{ at: string; value: unknown; version: number }>>();

  constructor(private readonly reader?: SystemConfigReader) {}

  async get<TValue = unknown>(key: string): Promise<TValue | null> {
    if (this.cache.has(key)) {
      return this.cache.get(key) as TValue;
    }

    const persisted = (this.overrides.get(key) as SystemConfigRecord<TValue> | undefined) ?? (await this.reader?.findByKey<TValue>(key));
    const value = persisted?.value ?? (this.defaultConfigs.get(key)?.value as TValue | undefined);

    if (value === undefined) {
      return null;
    }

    this.cache.set(key, value);
    return value;
  }

  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      return;
    }

    this.cache.clear();
  }

  /**
   * Upserts an overridable config value and hot-refreshes the read cache.
   *
   * @param input Config input.
   * @returns Stored config.
   */
  set<TValue = unknown>(input: { description?: string; isOverridable?: boolean; key: string; value: TValue }): SystemConfigRecord<TValue> {
    const seeded = this.defaultConfigs.get(input.key);
    if (seeded && input.isOverridable === false) {
      throw new BusinessError({ code: ErrorCodes.ADMIN_CONFIG_LOCKED.code, details: { key: input.key }, message: 'System config is locked.' });
    }
    const record: SystemConfigRecord<TValue> = {
      description: input.description,
      isOverridable: input.isOverridable ?? true,
      key: input.key,
      value: input.value,
    };
    this.overrides.set(input.key, record);
    this.cache.set(input.key, input.value);
    this.recordVersion(input.key, input.value);
    return record;
  }

  /**
   * Deletes an override and falls back to seeded defaults.
   *
   * @param key Config key.
   */
  remove(key: string): void {
    this.overrides.delete(key);
    this.clearCache(key);
    this.recordVersion(key, this.defaultConfigs.get(key)?.value ?? null);
  }

  /**
   * Lists seeded and overridden configs for admin console.
   *
   * @returns Config records.
   */
  list(): SystemConfigRecord[] {
    const seeded = [...this.defaultConfigs.entries()].map(([key, config]) => ({ isOverridable: true, key, value: config.value }));
    const merged = new Map<string, SystemConfigRecord>(seeded.map((record) => [record.key, record]));
    for (const record of this.overrides.values()) merged.set(record.key, record);
    return [...merged.values()].sort((a, b) => a.key.localeCompare(b.key));
  }

  /**
   * Reads config history for rollback and audit.
   *
   * @param key Config key.
   * @returns Version history.
   */
  history(key: string): Array<{ at: string; value: unknown; version: number }> {
    return this.versions.get(key) ?? [];
  }

  private recordVersion(key: string, value: unknown): void {
    const rows = this.versions.get(key) ?? [];
    rows.push({ at: new Date().toISOString(), value, version: rows.length + 1 });
    this.versions.set(key, rows);
  }
}
