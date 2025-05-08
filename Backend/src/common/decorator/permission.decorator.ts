import { SetMetadata } from '@nestjs/common';
import { PERMISSION_KEY } from '../constants/permission.constant';
import { PermissionType } from '../enum/permission-type.enum';
export const Permission = (...permissions: PermissionType[]) =>
  SetMetadata(PERMISSION_KEY, permissions);
