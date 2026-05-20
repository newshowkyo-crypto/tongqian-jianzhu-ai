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
        aliyunDashscope: 'DISABLED_UNTIL_API_KEY_PROVIDED',
        deepseek: process.env.DEEPSEEK_API_KEY ? 'ready' : 'mock-ready',
        openrouter: 'DISABLED_UNTIL_API_KEY_PROVIDED',
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
      status: 'ready',
      summary: 'Core API is ready; missing P1 providers run in mock mode by policy.',
    };
  }

  private envReady(key: string): boolean {
    const value = process.env[key];
    return Boolean(value && !value.includes('PLACEHOLDER') && !value.includes('REPLACE'));
  }
}
