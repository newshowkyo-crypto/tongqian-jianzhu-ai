import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import type { RegistrationRole } from './registration-types.js';

@Injectable()
export class DomainRouterService {
  /**
   * Resolves registration role by request host.
   *
   * @param domain Hostname or full URL.
   * @returns Registration role.
   */
  resolve(domain?: string): RegistrationRole | undefined {
    const host = this.normalize(domain);
    if (host.includes('agents.')) return 'AGENT';
    if (host.includes('gov.')) return 'GOV_USER';
    if (host.includes('admin.')) return 'PLATFORM';
    if (host.includes('tongqian')) return 'BUILDING_COMPANY_USER';
    return undefined;
  }

  /**
   * Resolves role or throws for unsupported public registration domains.
   *
   * @param domain Hostname or full URL.
   * @returns Registration role.
   */
  resolveOrThrow(domain?: string): RegistrationRole {
    const role = this.resolve(domain);
    if (!role) {
      throw new BusinessError({
        code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code,
        details: { domain },
        message: 'Registration domain is not supported.',
      });
    }
    return role;
  }

  /**
   * Gives frontend the default dashboard for a resolved role.
   *
   * @param role Registration role.
   * @returns Dashboard slug.
   */
  defaultDashboard(role: RegistrationRole): 'admin' | 'agent' | 'gov' | 'owner' {
    if (role === 'PLATFORM') return 'admin';
    if (role === 'AGENT') return 'agent';
    if (role === 'GOV_USER') return 'gov';
    return 'owner';
  }

  /**
   * Returns public registration path for role-specific redirects.
   *
   * @param role Registration role.
   * @returns Route path.
   */
  registrationPath(role: RegistrationRole): string {
    if (role === 'PLATFORM') return '/admin/login';
    if (role === 'AGENT') return '/register/agent';
    if (role === 'GOV_USER') return '/register/gov';
    return '/register';
  }

  /**
   * Checks whether the requested role is compatible with the current domain.
   *
   * @param domain Hostname or URL.
   * @param role Requested role.
   * @returns Compatibility result.
   */
  assertDomainRole(domain: string | undefined, role: RegistrationRole): void {
    const resolved = this.resolveOrThrow(domain);
    if (resolved !== role) {
      throw new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, details: { resolved, role }, message: 'Registration role does not match domain.' });
    }
  }

  /**
   * Lists supported role/domain pairs for admin diagnostics.
   *
   * @returns Supported route pairs.
   */
  supportedDomains(): Array<{ host: string; role: RegistrationRole }> {
    return [
      { host: 'www.tongqian.xin', role: 'BUILDING_COMPANY_USER' },
      { host: 'agents.tongqian.xin', role: 'AGENT' },
      { host: 'gov.tongqian.xin', role: 'GOV_USER' },
      { host: 'admin.tongqian.xin', role: 'PLATFORM' },
    ];
  }

  private normalize(domain?: string): string {
    return (domain ?? '').replace(/^https?:\/\//u, '').toLowerCase();
  }
}
