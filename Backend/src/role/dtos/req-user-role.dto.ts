import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccessType } from '../enum/access-type.enum';

export class AssignUserRoleDto {
  @ApiPropertyOptional({
    description: 'Assigned user Email address',
    example: 'user@example.com',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'WallId that assign to user ',
    example: 76,
  })
  @IsNumber()
  @IsNotEmpty()
  wallId: number;

  @IsEnum(AccessType)
  @IsNotEmpty()
  accessType: AccessType;
}
