import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionType } from 'src/common/enum/permission-type.enum';
import { PERMISSION_KEY } from 'src/common/constants/permission.constant';
import { Rolespermission } from 'src/user/entity/roles_permission.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Rolespermission)
    private rolesPermissionRepository: Repository<Rolespermission>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionType[]
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      console.log('user not found');
      return false;
    }

    if (!user || !user.role) {
      console.log('User role not found');
      return false;
    }

    try {
      const rolePermissions = await this.rolesPermissionRepository.find({
        where: { role: { id: user.role } },
        relations: ['permission'],
      });

      const userPermissions = rolePermissions.map(
        (rolePermission) => rolePermission.permission.code,
      );

      const hasPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasPermission) {
        console.log('User does not have the required permissions');
        return false;
      }

      return hasPermission;
    } catch (error) {
      console.log('Error fetching permissions:', error);
      return false;
    }
  }
}
