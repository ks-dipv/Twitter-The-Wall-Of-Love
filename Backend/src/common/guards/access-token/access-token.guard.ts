import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from '../../../user/config/jwt.config';
import { REQUEST_USER_KEY } from '../../../common/constants/auth.constant';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { token, source } = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const secret =
        source === 'cookie'
          ? this.jwtConfiguration.secret
          : this.jwtConfiguration.apiSecret;

      const payload = await this.jwtService.verifyAsync(token, { secret });
      request[REQUEST_USER_KEY] = payload; // Store user payload in request
      return true;
    } catch (error) {
      throw new UnauthorizedException(error || 'Invalid or expired token');
    }
  }

  private extractToken(request: Request): {
    token?: string;
    source: 'cookie' | 'header' | 'none';
  } {
    // Check token in cookies
    if (request.cookies?.access_token) {
      const token = request.cookies.access_token;
      return { token, source: 'cookie' };
    }

    // Check token in Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      return { token, source: 'header' };
    }

    return { source: 'none' };
  }
}
