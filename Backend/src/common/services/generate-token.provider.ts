import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../../common/interface/active-user.interface';
import jwtConfig from 'src/auth/config/jwt.config';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class GenerateTokenProvider {
  constructor(
    /**
     * inject jwtService
     */
    private readonly jwtService: JwtService,

    /**
     * inject jwtConfiguration
     */
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async signToken<T>(
    userId: number,
    expiresIn: number,
    secretKey: string,
    payload?: T,
  ) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        secret: secretKey,
        expiresIn,
      },
    );
  }

  public async generateTokens(user: User) {
    const accessToken = await this.signToken<Partial<ActiveUserData>>(
      user.id,
      this.jwtConfiguration.accessTokenTtl,
      this.jwtConfiguration.secret,
      {
        email: user.email,
      },
    );

    return accessToken;
  }

  public async generateResetPasswordToken(user: User) {
    const resetPasswordToken = await this.signToken<Partial<ActiveUserData>>(
      user.id,
      this.jwtConfiguration.resetPasswordTokenTtl,
      this.jwtConfiguration.secret,
      {
        email: user.email,
      },
    );

    return resetPasswordToken;
  }

  public async generateApiToken(user: User) {
    const apiToken = await this.signToken<Partial<ActiveUserData>>(
      user.id,
      this.jwtConfiguration.apiTokenTtl,
      this.jwtConfiguration.apiSecret,
      {
        email: user.email,
      },
    );

    return apiToken;
  }

  public async generateVarificationToken(user: User) {
    const varificationToken = await this.signToken<Partial<ActiveUserData>>(
      user.id,
      this.jwtConfiguration.resetPasswordTokenTtl,
      this.jwtConfiguration.secret,
      {
        email: user.email,
      },
    );

    return varificationToken;
  }
}
