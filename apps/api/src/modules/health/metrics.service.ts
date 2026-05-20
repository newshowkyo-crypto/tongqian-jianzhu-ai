import { Injectable } from '@nestjs/common';

interface CounterState {
  help: string;
  labels: Record<string, string>;
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
}

@Injectable()
export class MetricsService {
  private readonly bootTime = Date.now();
  private readonly counters = new Map<string, CounterState>();
  private readonly histograms = new Map<string, number[]>();

  constructor() {
    this.gauge('tongqian_api_build_info', 1, { version: process.env.APP_VERSION ?? 'm3.9-local' }, 'API build metadata.');
    this.gauge('tongqian_ai_provider_active', 1, { provider: 'deepseek' }, 'Active AI provider routing flag.');
    this.gauge('tongqian_mock_provider_enabled', 1, { provider: 'oss-wechat-pay-alipay-sms-email' }, 'P1 mock provider readiness.');
  }

  increment(name: string, labels: Record<string, string> = {}, help = `${name} total counter.`): void {
    const key = this.key(name, labels);
    const current = this.counters.get(key) ?? { help, labels, name, type: 'counter' as const, value: 0 };
    current.value += 1;
    this.counters.set(key, current);
  }

  gauge(name: string, value: number, labels: Record<string, string> = {}, help = `${name} gauge.`): void {
    this.counters.set(this.key(name, labels), { help, labels, name, type: 'gauge', value });
  }

  observe(name: string, value: number, labels: Record<string, string> = {}, help = `${name} histogram.`): void {
    const key = this.key(name, labels);
    const values = this.histograms.get(key) ?? [];
    values.push(value);
    this.histograms.set(key, values);
    this.counters.set(key, { help, labels, name, type: 'histogram', value: values.length });
  }

  snapshot(): Record<string, unknown> {
    return {
      counters: [...this.counters.values()].length,
      histogramSeries: this.histograms.size,
      memory: process.memoryUsage(),
      uptimeSeconds: Math.round((Date.now() - this.bootTime) / 1000),
    };
  }

  renderPrometheus(): string {
    this.gauge('tongqian_api_uptime_seconds', Math.round((Date.now() - this.bootTime) / 1000), {}, 'API process uptime in seconds.');
    this.gauge('tongqian_process_heap_used_bytes', process.memoryUsage().heapUsed, {}, 'Node.js heap used bytes.');
    const lines: string[] = [];
    const seenHelp = new Set<string>();
    for (const metric of this.counters.values()) {
      const helpKey = `${metric.name}:${metric.type}`;
      if (!seenHelp.has(helpKey)) {
        lines.push(`# HELP ${metric.name} ${metric.help}`);
        lines.push(`# TYPE ${metric.name} ${metric.type === 'histogram' ? 'summary' : metric.type}`);
        seenHelp.add(helpKey);
      }
      lines.push(`${metric.name}${this.renderLabels(metric.labels)} ${metric.value}`);
    }
    for (const [key, values] of this.histograms.entries()) {
      const metric = this.counters.get(key);
      if (!metric || values.length === 0) continue;
      const sorted = [...values].sort((left, right) => left - right);
      lines.push(`${metric.name}_p50${this.renderLabels(metric.labels)} ${this.quantile(sorted, 0.5)}`);
      lines.push(`${metric.name}_p95${this.renderLabels(metric.labels)} ${this.quantile(sorted, 0.95)}`);
    }
    return `${lines.join('\n')}\n`;
  }

  private key(name: string, labels: Record<string, string>): string {
    return `${name}:${Object.entries(labels)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([label, value]) => `${label}=${value}`)
      .join(',')}`;
  }

  private quantile(sorted: number[], q: number): number {
    return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] ?? 0;
  }

  private renderLabels(labels: Record<string, string>): string {
    const entries = Object.entries(labels);
    if (entries.length === 0) return '';
    return `{${entries.map(([key, value]) => `${key}="${value.replaceAll('"', '\\"')}"`).join(',')}}`;
  }
}
