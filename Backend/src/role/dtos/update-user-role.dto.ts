import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AccessType } from '../enum/access-type.enum';

export class UpdateUserAccessDto {
  @ApiProperty({
    description: 'New access type for the user',
    example: AccessType.EDITOR,
    enum: AccessType,
  })
  @IsEnum(AccessType)
  @IsOptional()
  access_type?: AccessType;
}
