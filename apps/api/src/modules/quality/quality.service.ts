import { Injectable } from '@nestjs/common';

type RectificationStatus = 'closed' | 'open' | 'rectifying' | 'rejected' | 'verifying';

interface Checkpoint {
  id: string;
  location: string;
  photoUrls: string[];
  projectId: string;
  result: string;
  standardRef: string;
  tenantId: string;
}

interface Rectification {
  checkpointId: string;
  description: string;
  id: string;
  projectId: string;
  status: RectificationStatus;
  tenantId: string;
}

interface HazardClosure {
  evidenceUrls: string[];
  orderId: string;
  tenantId: string;
  verifyResult: 'closed' | 'rejected';
}

const checkpoints = new Map<string, Checkpoint>();
const orders = new Map<string, Rectification>();
const closures: HazardClosure[] = [];

@Injectable()
export class QualityService {
  recordCheck(input: Omit<Checkpoint, 'id'>): Checkpoint {
    const row = { ...input, id: crypto.randomUUID() };
    checkpoints.set(row.id, row);
    return row;
  }

  createRectification(input: { checkpointId: string; description: string; projectId: string; tenantId: string }): Rectification {
    const row: Rectification = { ...input, id: crypto.randomUUID(), status: 'open' };
    orders.set(row.id, row);
    return row;
  }

  submitVerify(orderId: string, evidenceUrls: string[]): Rectification {
    const order = this.ensureOrder(orderId);
    order.status = 'verifying';
    closures.push({ evidenceUrls, orderId, tenantId: order.tenantId, verifyResult: 'closed' });
    return order;
  }

  closeOrReject(orderId: string, result: 'closed' | 'rejected', note?: string): { closure: HazardClosure & { note?: string }; order: Rectification } {
    const order = this.ensureOrder(orderId);
    order.status = result;
    const closure = { evidenceUrls: [], note, orderId, tenantId: order.tenantId, verifyResult: result };
    closures.push(closure);
    return { closure, order };
  }

  startRectifying(orderId: string): Rectification {
    const order = this.ensureOrder(orderId);
    order.status = 'rectifying';
    return order;
  }

  private ensureOrder(orderId: string): Rectification {
    const order = orders.get(orderId);
    if (!order) throw new Error('RECTIFICATION_NOT_FOUND');
    return order;
  }
}
