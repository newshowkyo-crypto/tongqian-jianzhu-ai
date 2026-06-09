import { Controller, Get, Inject } from '@nestjs/common';

import { MetricsService } from './metrics.service.js';

@Controller('api/health')
export class HealthController {
  private readonly startedAt = new Date().toISOString();

  constructor(@Inject(MetricsService) private readonly metrics: MetricsService) {}

  @Get()
  health(): Record<string, unknown> {
    this.metrics.increment('tongqian_health_requests_total', { endpoint: '/api/health' });
    return {
      aiProviders: {
        aliyunDashscope: this.dashscopeReady() ? 'ready:qwen3-max/qwen3-vl-max/text-embedding-v3' : 'awaiting-credentials:qwen3-max/qwen3-vl-max',
        dashvector: this.envReady('DASHVECTOR_API_KEY') ? 'ready' : 'awaiting-credentials:semantic-cache',
        deepseekReasoner: process.env.DEEPSEEK_API_KEY ? 'ready:deepseek-reasoner' : 'disabled:optional-domestic-fallback',
        midlayer: this.midlayerReady() ? 'ready:deprecated-fallback' : 'disabled:deprecated',
      },
      db: this.envReady('DATABASE_URL') ? 'ready' : 'mock-ready',
      redis: this.envReady('REDIS_URL') ? 'ready' : 'mock-ready',
      startedAt: this.startedAt,
      status: 'ok',
      uptime: process.uptime(),
      version: process.env.APP_VERSION ?? 'm3.9-local',
    };
  }

  @Get('live')
  live(): Record<string, unknown> {
    this.metrics.increment('tongqian_health_requests_total', { endpoint: '/api/health/live' });
    return { status: 'live', time: new Date().toISOString(), uptime: process.uptime() };
  }

  @Get('ready')
  ready(): Record<string, unknown> {
    this.metrics.increment('tongqian_health_requests_total', { endpoint: '/api/health/ready' });
    const checks = this.health();
    return {
      checks,
      ready: true,
      status: this.dashscopeReady() ? 'ready' : 'awaiting_ai_credentials',
      summary: this.dashscopeReady()
        ? 'Core API is ready with Aliyun DashScope production AI routing.'
        : 'Core API is ready; production AI calls require ALIYUN_DASHSCOPE_API_KEY.',
    };
  }

  private envReady(key: string): boolean {
    const value = process.env[key];
    return Boolean(value && !value.includes('PLACEHOLDER') && !value.includes('REPLACE'));
  }

  private dashscopeReady(): boolean {
    return this.envReady('ALIYUN_DASHSCOPE_API_KEY') || this.envReady('DASHSCOPE_API_KEY');
  }

  private midlayerReady(): boolean {
    return this.envReady('MIDLAYER_API_KEY') && this.envReady('MIDLAYER_BASE_URL');
  }
}
