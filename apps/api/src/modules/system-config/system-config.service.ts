import { Injectable } from '@nestjs/common';
import { seedSystemConfigs } from '@tongqian/constants';

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

  constructor(private readonly reader?: SystemConfigReader) {}

  async get<TValue = unknown>(key: string): Promise<TValue | null> {
    if (this.cache.has(key)) {
      return this.cache.get(key) as TValue;
    }

    const persisted = await this.reader?.findByKey<TValue>(key);
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
}
