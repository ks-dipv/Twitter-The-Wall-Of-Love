import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './services/role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation } from './entity/invitation.entity';
import { WallAccess } from './entity/wall-access.entity';
import { UserRepository } from 'src/user/repositories/user.repository';
import { MailService } from 'src/auth/services/mail.service';
import { WallRepository } from 'src/wall/repository/wall.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Invitation, WallAccess])],
  controllers: [RoleController],
  providers: [RoleService, UserRepository, MailService, WallRepository],
})
export class RoleModule {}
