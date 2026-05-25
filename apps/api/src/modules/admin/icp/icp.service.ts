import { Injectable } from '@nestjs/common';

import type { SystemConfigService } from '../../system-config/system-config.service.js';

type IcpStatus = 'approved' | 'materials_uploaded' | 'not_started' | 'rejected' | 'reviewing' | 'submitted';

interface IcpState {
  aliyunAccountId?: string;
  approvedAt?: string;
  companyName?: string;
  contactPhone?: string;
  legalRepIdLast4?: string;
  legalRepName?: string;
  recordNo?: string;
  rejectReason?: string;
  status: IcpStatus;
  submittedAt?: string;
  websiteDomains: string[];
}

const checklist = [
  '营业执照',
  '法人身份证正面',
  '法人身份证反面',
  '负责人身份证正面',
  '负责人身份证反面',
  '域名证书',
  '网站建设方案书',
  '安全责任书',
  '域名实名认证截图',
  '阿里云授权码',
].map((name) => ({ name, ossUrl: undefined as string | undefined, required: true, uploaded: false }));

@Injectable()
export class IcpService {
  private state: IcpState = { status: 'not_started', websiteDomains: [] };

  constructor(private readonly configs: SystemConfigService) {}

  get() {
    return { ...this.state, materialsChecklist: checklist };
  }

  checklist() {
    return checklist;
  }

  upsert(input: Partial<IcpState>) {
    this.state = { ...this.state, ...input, websiteDomains: input.websiteDomains ?? this.state.websiteDomains };
    if (this.state.recordNo && this.state.status === 'approved') {
      this.configs.set({ description: 'ICP record number for public footer', key: 'system_configs.icp_record', value: this.state.recordNo });
      this.state.approvedAt ??= new Date().toISOString();
    }
    return this.get();
  }

  uploadMaterial(name: string) {
    const item = checklist.find((row) => row.name === name);
    if (!item) return { ok: false, reason: 'material_not_found' };
    item.uploaded = true;
    item.ossUrl = `oss://pending-credential/${encodeURIComponent(name)}`;
    this.state.status = 'materials_uploaded';
    return { ok: true, material: item };
  }
}
