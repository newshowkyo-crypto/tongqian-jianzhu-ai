import { Injectable } from '@nestjs/common';

@Injectable()
export class CrossProjectAlertsService {
  list(): Array<{ action: string; level: 'red' | 'yellow'; metric: string; project: string; reason: string }> {
    return [
      { action: '锁定回款责任人并发催收提醒', level: 'red', metric: '逾期 92 天', project: '东湖高新区道路改造', reason: '应收款超过合同账期' },
      { action: '安排证书续期并同步投标台账', level: 'yellow', metric: '27 天到期', project: '黄陂学校维修改造', reason: '安全员证书临近到期' },
      { action: '复核图纸变更后再提交报价', level: 'yellow', metric: '3 处变更', project: '临空厂房二期', reason: '图纸版本差异影响工程量' },
    ];
  }
}
