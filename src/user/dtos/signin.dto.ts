import { ApiProperty , ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SignInDto {

  @ApiProperty({
    description: 'User Email address',
    example: 'user@gmail.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123',
  })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: 'Twitter ID for authentication via Twitter',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  twitter_id?: string;
}
