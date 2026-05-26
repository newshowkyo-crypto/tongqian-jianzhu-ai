import { Injectable } from '@nestjs/common';

@Injectable()
export class ProjectSpaceService {
  inviteToSpace(projectId: string, phone: string): { channel: 'ALIYUN_SMS'; projectId: string; roleOptions: string[]; sent: boolean } {
    return {
      channel: 'ALIYUN_SMS',
      projectId,
      roleOptions: ['project_owner', 'finance', 'technical', 'subcontractor', 'supervisor'],
      sent: /^\d{6,}$/.test(phone),
    };
  }
}
