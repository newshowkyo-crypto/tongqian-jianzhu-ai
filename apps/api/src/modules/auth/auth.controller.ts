import { Body, Controller, Headers, Inject, Post } from '@nestjs/common';

import { OverseaModelConsentService } from './consent/oversea-model-consent.service.js';
import { JwtTokenService } from './login/jwt.service.js';
import { LoginService } from './login/login.service.js';
import type { LoginInput } from './login/login.service.js';
import type { RegistrationInput } from './registration/registration-types.js';
import { UnifiedRegistrationService } from './registration/unified-registration.service.js';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    @Inject(OverseaModelConsentService)
    private readonly consent: OverseaModelConsentService,
    @Inject(JwtTokenService)
    private readonly jwt: JwtTokenService,
    @Inject(LoginService)
    private readonly loginService: LoginService,
    @Inject(UnifiedRegistrationService)
    private readonly registration: UnifiedRegistrationService,
  ) {}

  @Post('register')
  async register(@Body() body: RegistrationInput): Promise<unknown> {
    return { code: 0, data: await this.registration.register(body), message: 'Registered', traceId: crypto.randomUUID() };
  }

  @Post('login')
  async login(@Body() body: LoginInput): Promise<unknown> {
    return { code: 0, data: await this.loginService.login(body), message: 'Logged in', traceId: crypto.randomUUID() };
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }): unknown {
    return { code: 0, data: this.jwt.refresh(body.refreshToken), message: 'Refreshed', traceId: crypto.randomUUID() };
  }

  @Post('logout')
  logout(@Body() body: { refreshToken: string }): unknown {
    this.jwt.revoke(body.refreshToken);
    return { code: 0, data: { revoked: true }, message: 'Logged out', traceId: crypto.randomUUID() };
  }

  @Post('consents/oversea-model')
  grantOverseaModelConsent(@Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 0, data: this.consent.grant(userId), message: 'Consent granted', traceId: crypto.randomUUID() };
  }
}
