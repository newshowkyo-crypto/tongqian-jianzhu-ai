import type { CanActivate, ExecutionContext} from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
    const authorization = request.headers.authorization;
    if (!authorization && !request.headers['x-user-id']) {
      throw new UnauthorizedException({ code: 'AUTH.TOKEN.MISSING', message: 'Missing token' });
    }
    return true;
  }
}
