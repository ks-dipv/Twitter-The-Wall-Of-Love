import { SetMetadata } from '@nestjs/common';
import { AUTH_TYPE_KEY } from '../../common/constants/auth.constant';
import { AuthType } from 'src/user/enum/auth-type.enum';

export const Auth = (...authTypes: AuthType[]) =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);
