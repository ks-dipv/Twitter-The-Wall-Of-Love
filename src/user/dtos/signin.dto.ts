import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'User Email address',
    example: 'user@gmail.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword@123',
  })
  @IsString()
  password: string;
}
