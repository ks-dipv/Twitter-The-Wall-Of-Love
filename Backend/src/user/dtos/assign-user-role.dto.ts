import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class AssignUserRoleDto {
  @ApiPropertyOptional({
    description: 'Assigned user Email address',
    example : 'user@example.com'
  })
  @IsString()
  email: string;

  @ApiPropertyOptional({
    description: 'WallId that assign to user ',
    example : 76
  })
  @IsNumber()
  wallId: number;
}
