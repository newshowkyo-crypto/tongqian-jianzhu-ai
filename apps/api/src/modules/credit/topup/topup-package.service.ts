import { Injectable } from '@nestjs/common';
import { DEFAULT_CREDIT_PACKAGES } from '@tongqian/constants';

@Injectable()
export class TopupPackageService {
  list(): Array<{ code: string; credits: number; priceCny: number }> {
    return [...DEFAULT_CREDIT_PACKAGES];
  }

  get(code: string): { code: string; credits: number; priceCny: number } {
    const pkg = this.list().find((item) => item.code === code);
    if (!pkg) throw new Error('CREDIT.TOPUP.PACKAGE_INVALID');
    return pkg;
  }
}
