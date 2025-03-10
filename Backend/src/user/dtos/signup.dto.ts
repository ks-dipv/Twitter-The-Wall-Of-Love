import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description:
      'Password must be at least 8 characters long, include at least one letter, one number, and one special character',
    example: 'Secure@123',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'Minimum 8 character, at least one letter, one number and one special character',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://example.com/profile-pic.jpg',
  })
  @IsString()
  @IsOptional()
  profile_pic?: string;
}
