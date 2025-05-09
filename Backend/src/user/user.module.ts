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
import { Permission } from './entity/permission.entity';
import { Roles } from './entity/roles.entity';
import { Rolespermission } from './entity/roles_permission.entity';
import { MailService } from 'src/auth/services/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Permission, Roles, Rolespermission]),
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
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
