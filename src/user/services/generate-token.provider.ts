import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { User } from '../entity/user.entity';
import { ActiveUserData } from '../interface/active-user.interface';

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

  public async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  public async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      // generate the access token
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          email: user.email,
        },
      ),

      //generate refresh token
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  public async generateResetPasswordToken(user: User) {
    const resetPasswordToken = await this.signToken<Partial<ActiveUserData>>(
      user.id,
      this.jwtConfiguration.resetPasswordTokenTtl,
      {
        email: user.email,
      },
    );

    return resetPasswordToken;
  }
}
