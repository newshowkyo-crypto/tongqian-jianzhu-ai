import { Inject, Injectable } from '@nestjs/common';

import { CredentialsService } from '../credentials/credentials.service.js';
import { FuelProgressService } from '../fuel-progress/fuel-progress.service.js';
import { IcpService } from '../icp/icp.service.js';

@Injectable()
export class OnboardingService {
  constructor(
    @Inject(CredentialsService) private readonly credentials: CredentialsService,
    @Inject(FuelProgressService) private readonly fuel: FuelProgressService,
    @Inject(IcpService) private readonly icp: IcpService,
  ) {}

  async summary() {
    const credentials = await this.credentials.list();
    const p0Total = credentials.filter((item) => ['ai', 'notification', 'payment'].includes(item.group)).length;
    const p0Real = credentials.filter((item) => item.mode === 'real' && ['ai', 'notification', 'payment'].includes(item.group)).length;
    const icp = this.icp.get();
    const fuel = this.fuel.get();
    const steps = [
      { href: '/admin/credentials', key: 'credentials', ready: p0Real >= Math.min(8, p0Total), value: p0Total ? Math.round((p0Real / p0Total) * 100) : 0 },
      { href: '/admin/onboarding/icp', key: 'icp', ready: icp.status === 'approved', value: icp.status === 'approved' ? 100 : 40 },
      { href: '/admin/onboarding/fuel', key: 'fuel', ready: fuel.overallReadiness >= 100, value: fuel.overallReadiness },
    ];
    const readyCount = steps.filter((step) => step.ready).length;
    return { ready: readyCount === steps.length, readyCount, steps, total: steps.length };
  }
}
