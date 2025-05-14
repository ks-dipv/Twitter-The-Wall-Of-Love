import { IsEnum, IsNumber, IsString } from 'class-validator';
import { AccessType } from '../enum/accesstype.enum';

export class AssignUserRoleDto {
  @IsString()
  email: string;

  @IsNumber()
  wallId: number;

  @IsEnum(AccessType)
  accessType: AccessType;
}
