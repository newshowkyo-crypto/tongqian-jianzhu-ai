import { Module } from '@nestjs/common';

import { AuthAccountRepository } from './auth-account.repository.js';
import { AuthController } from './auth.controller.js';
import { OverseaModelConsentService } from './consent/oversea-model-consent.service.js';
import { JwtTokenService } from './login/jwt.service.js';
import { LockoutService } from './login/lockout.service.js';
import { LoginService } from './login/login.service.js';
import { TwoFactorService } from './login/two-factor.service.js';
import { AgentRegistrationService } from './registration/agent-registration.service.js';
import { AttributionService } from './registration/attribution.service.js';
import { BuildingCompanyRegistrationService } from './registration/building-company-registration.service.js';
import { ConflictDetectorService } from './registration/conflict-detector.service.js';
import { DomainRouterService } from './registration/domain-router.service.js';
import { GovRegistrationService } from './registration/gov-registration.service.js';
import { PlatformUserService } from './registration/platform-user.service.js';
import { UnifiedRegistrationService } from './registration/unified-registration.service.js';

@Module({
  controllers: [AuthController],
  exports: [AuthAccountRepository, OverseaModelConsentService, PlatformUserService, TwoFactorService],
  providers: [
    AgentRegistrationService,
    AuthAccountRepository,
    AttributionService,
    BuildingCompanyRegistrationService,
    ConflictDetectorService,
    DomainRouterService,
    GovRegistrationService,
    JwtTokenService,
    LockoutService,
    LoginService,
    OverseaModelConsentService,
    PlatformUserService,
    TwoFactorService,
    UnifiedRegistrationService,
  ],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthModule {}
