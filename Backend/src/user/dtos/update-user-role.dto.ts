import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { AccessType } from '../enum/accesstype.enum';

export class UpdateUserAccessDto {
  @ApiProperty({
    description: 'New access type for the user',
    example: AccessType.ADMIN,
    enum: AccessType,
  })
  @IsEnum(AccessType)
  @IsOptional()
  access_type?: AccessType;
}
