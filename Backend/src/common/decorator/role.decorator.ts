import { ROLE_KEY } from '../constants/role.constant';
import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../enum/role.enum';

export const Roles = (...roles: RoleType[]) => SetMetadata(ROLE_KEY, roles);
