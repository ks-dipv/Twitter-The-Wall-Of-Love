import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HashingProvider } from './services/hashing.provider';
import { GenerateTokenProvider } from '../common/services/generate-token.provider';
import { UploadService } from '../common/services/upload.service';
import { MailService } from './services/mail.service';
import { UserRepository } from '../user/repositories/user.repository';
import { GoogleAuthenticationService } from './services/google-authentication.service';
import { UserService } from '../user/services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('appConfig.mailHost'),
          secure: false,
          port: 2525,
          auth: {
            user: config.get('appConfig.smtpUsername'),
            pass: config.get('appConfig.smtpPassword'),
          },
        },
        default: {
          from: `twitter <no-reply@twitter.com>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new EjsAdapter({
            inlineCssEnabled: true,
          }),
          options: {
            strict: false,
          },
        },
      }),
    }),
  ],

  controllers: [AuthController],
  providers: [
    UserService,
    UserRepository,
    AuthService,
    HashingProvider,
    GenerateTokenProvider,
    UploadService,
    MailService,
    GoogleAuthenticationService,
  ],
})
export class AuthModule {}
