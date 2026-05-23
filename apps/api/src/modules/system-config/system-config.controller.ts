import { Controller, Get, Inject } from '@nestjs/common';

import { SystemConfigService } from './system-config.service.js';

@Controller('api/v1/public')
export class SystemConfigController {
  constructor(@Inject(SystemConfigService) private readonly configs: SystemConfigService) {}

  @Get('icp-record')
  async icpRecord(): Promise<{ code: string; data: { icpRecordNo: string }; message: string; traceId: string }> {
    const icpRecordNo = (await this.configs.get<string>('system_configs.icp_record')) ?? '鄂 ICP 备案中';
    return { code: 'OK', data: { icpRecordNo }, message: 'ICP record', traceId: crypto.randomUUID() };
  }
}
