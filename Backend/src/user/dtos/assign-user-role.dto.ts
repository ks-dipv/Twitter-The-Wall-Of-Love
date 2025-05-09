import { IsNumber, IsString } from 'class-validator';

export class AssignUserRoleDto {
  @IsString()
  email: string;

  @IsNumber()
  roleId: number;
}
