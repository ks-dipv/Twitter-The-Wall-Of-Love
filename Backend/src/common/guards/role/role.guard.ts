import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WallAccess } from 'src/role/entity/wall-access.entity';
import { RoleType } from 'src/common/enum/role.enum';
import { ROLE_KEY } from 'src/common/constants/role.constant';
import { WallRepository } from 'src/wall/repository/wall.repository';
import { UserRepository } from 'src/user/repositories/user.repository';
import { In } from 'typeorm';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(WallAccess)
    private wallAccessRepository: Repository<WallAccess>,

    private readonly wallRepository: WallRepository,

    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<RoleType[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    const existingUser = await this.userRepository.getByEmail(user.email);

    const wallId = parseInt(request.params.id);

    const wall = await this.wallRepository.getById(wallId);

    const owner = wall.user.id === existingUser.id;

    if (!owner) {
      const wallAccess = await this.wallAccessRepository.findOne({
        where: {
          wall: { id: wallId },
          user: { id: existingUser.id },
          access_type: In(roles),
        },
      });

      if (!wallAccess || wallAccess == null) {
        throw new ForbiddenException('You do not have access to this wall.');
      }
    }

    return true;
  }
}
