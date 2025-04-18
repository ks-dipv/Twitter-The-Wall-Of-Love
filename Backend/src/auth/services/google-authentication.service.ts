import {
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import jwtConfig from '../../auth/config/jwt.config';
import { GoogleTokenDto } from '../dtos/google-token.dto';
import { GenerateTokenProvider } from '../../common/services/generate-token.provider';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    /**
     * inject jwtConfiguration
     */
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    /**
     * inject usersService
     */
    private readonly usersService: UserService,

    /**
     * inject generateTokenProvider
     */
    private readonly generateTokenProvider: GenerateTokenProvider,
  ) {}

  onModuleInit() {
    const clientId = this.jwtConfiguration.googleClientId;
    const clientSecret = this.jwtConfiguration.googleClientSecret;
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  public async authentication(googleTokenDto: GoogleTokenDto, res) {
    try {
      //verify the google token sent by user
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: googleTokenDto.token,
      });

      // extract the payload from google jwt
      const {
        email,
        sub: googleId,
        name: name,
        picture: picture,
        email_verified,
      } = loginTicket.getPayload();

      if (!email_verified) {
        throw new UnauthorizedException('Email not verified by Google');
      }

      // find the user in the database using the GoogleId
      const user = await this.usersService.findOneByGoogleId(googleId);

      // if googleid exists generate token
      if (user) {
        const token = await this.generateTokenProvider.generateTokens(user);

        res.cookie('access_token', token, { httpOnly: true });

        return token;
      }

      // if not create a new user and then generate tokens
      const newUser = await this.usersService.createGoogleUser({
        email: email,
        name: name,
        googleId: googleId,
        profile_pic: picture,
        is_email_verified: true,
      });

      const token = await this.generateTokenProvider.generateTokens(newUser);

      res.cookie('access_token', token, { httpOnly: true });

      return token;
    } catch (error) {
      // throw Unauthorised exception
      throw new UnauthorizedException(error);
    }
  }
}
