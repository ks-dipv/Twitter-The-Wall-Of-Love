import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from '../../enum/auth-type.enum';
import { AUTH_TYPE_KEY } from '../../../common/constants/auth.constant';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthType.Bearer];

    for (const authType of authTypes) {
      if (authType === AuthType.None) return true;
      if (authType === AuthType.Bearer) {
        const isAllowed = await this.accessTokenGuard.canActivate(context);
        if (isAllowed) return true;
      }
    }

    throw new UnauthorizedException('Unauthorized request');
  }
}
