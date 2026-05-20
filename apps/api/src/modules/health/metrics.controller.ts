import { Controller, Get, Header, Inject } from '@nestjs/common';

import { MetricsService } from './metrics.service.js';

@Controller('api')
export class MetricsController {
  constructor(@Inject(MetricsService) private readonly metrics: MetricsService) {}

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  metricsText(): string {
    this.metrics.increment('tongqian_metrics_requests_total', { endpoint: '/api/metrics' });
    this.metrics.gauge('tongqian_admin_pages_ready', 33, { milestone: 'm3.9' }, 'Admin pages with client wrappers.');
    this.metrics.gauge('tongqian_admin_rest_controllers_ready', 32, { milestone: 'm3.9' }, 'Admin REST controller count.');
    this.metrics.gauge('tongqian_storage_mock_ready', 1, { provider: 'mock-storage' }, 'Mock storage provider readiness.');
    this.metrics.observe('tongqian_metrics_render_ms', 1, { endpoint: '/api/metrics' }, 'Metrics render latency.');
    return this.metrics.renderPrometheus();
  }

  @Get('metrics/json')
  metricsJson(): Record<string, unknown> {
    this.metrics.increment('tongqian_metrics_requests_total', { endpoint: '/api/metrics/json' });
    return {
      endpoints: ['/api/health', '/api/health/live', '/api/health/ready', '/api/metrics'],
      scrape: {
        intervalSeconds: 15,
        labels: { app: 'tongqian-api', env: process.env.NODE_ENV ?? 'development' },
        note: 'Prometheus text is exposed without auth so load balancers and Docker health checks can read it.',
      },
      status: 'ok',
      ...this.metrics.snapshot(),
    };
  }
}
