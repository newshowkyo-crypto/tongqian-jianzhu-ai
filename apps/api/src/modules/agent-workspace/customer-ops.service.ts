import { Injectable } from '@nestjs/common';

export type CustomerOpsType = 'followUp' | 'holiday' | 'moments' | 'renewal';

@Injectable()
export class CustomerOpsService {
  generate(customerId: string, type: CustomerOpsType): { customerId: string; text: string; type: CustomerOpsType } {
    return {
      customerId,
      text: `Customer ops ${type} copy: one useful insight, one next action, and no pressure.`,
      type,
    };
  }
}
