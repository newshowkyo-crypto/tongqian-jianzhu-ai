import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { IcpService } from './icp.service.js';

@Controller('api/v1/admin/icp')
export class IcpController {
  constructor(private readonly icp: IcpService) {}

  @Get()
  get() {
    return this.icp.get();
  }

  @Post()
  upsert(@Body() body: Parameters<IcpService['upsert']>[0]) {
    return this.icp.upsert(body);
  }

  @Get('checklist')
  checklist() {
    return this.icp.checklist();
  }

  @Post('materials/:name')
  upload(@Param('name') name: string) {
    return this.icp.uploadMaterial(name);
  }
}
