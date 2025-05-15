import { IsEnum, IsNumber, IsString } from 'class-validator';
import { AccessType } from '../enum/accesstype.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AssignUserRoleDto {
  @ApiPropertyOptional({
    description: 'Assigned user Email address',
    example: 'user@example.com',
  })
  @IsString()
  email: string;

  @ApiPropertyOptional({
    description: 'WallId that assign to user ',
    example: 76,
  })
  @IsNumber()
  wallId: number;

  @IsEnum(AccessType)
  accessType: AccessType;
}
