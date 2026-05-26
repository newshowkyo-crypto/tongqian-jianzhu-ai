import { Injectable } from '@nestjs/common';

@Injectable()
export class PeerIntelService {
  weekly(week: string): Record<string, unknown> {
    return {
      actions: ['Watch local policy window', 'Compare peer wins', 'Prepare financing story'],
      disclaimer: 'AI weekly intel needs source review before external use.',
      peers: ['same-province winner A', 'same-province bidder B'],
      viewpoint: 'Prefer projects with payment visibility and policy support.',
      week,
    };
  }
}
