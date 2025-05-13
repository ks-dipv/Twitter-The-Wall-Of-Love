import { Module } from '@nestjs/common';
import { User } from './entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UploadService } from '../common/services/upload.service';
import jwtConfig from '../auth/config/jwt.config';

import { UserRepository } from './repositories/user.repository';
import { GenerateTokenProvider } from 'src/common/services/generate-token.provider';
import { MailService } from 'src/auth/services/mail.service';
import { Invitation } from './entity/invitation.entity';
import { Wall } from 'src/wall/entity/wall.entity';
import { WallAccess } from './entity/wall-access.entity';
import { WallRepository } from 'src/wall/repository/wall.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Invitation, WallAccess]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    GenerateTokenProvider,
    UploadService,
    UserRepository,
    MailService,
    WallRepository
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
