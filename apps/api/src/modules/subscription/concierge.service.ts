import { Injectable } from '@nestjs/common';

interface ConsultantLoad {
  industry?: string;
  region?: string;
  userId: string;
  workload: number;
}

@Injectable()
export class ConciergeService {
  private readonly consultants: ConsultantLoad[] = [
    { industry: 'construction', region: 'east', userId: 'consult-east-1', workload: 0 },
    { industry: 'construction', region: 'south', userId: 'consult-south-1', workload: 0 },
  ];

  assign(input: { industry?: string; planCode: string; region?: string }): string | undefined {
    if (input.planCode !== 'flag') return undefined;
    const consultant = this.consultants
      .filter((item) => item.workload < 30)
      .sort((a, b) => Number(b.region === input.region) - Number(a.region === input.region) || a.workload - b.workload)[0];
    if (!consultant) throw new Error('SUB.CONCIERGE.OVERLOAD');
    consultant.workload += 1;
    return consultant.userId;
  }
}
