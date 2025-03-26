import { PartialType } from '@nestjs/mapped-types';
import { SignUpDto } from './signup.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDto extends PartialType(SignUpDto) {
  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'User Email address',
    example: 'user@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description:
      'Password must be at least 8 characters long, include at least one letter, one number, and one special character',
    example: 'Secure@123',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Profile picture file',
    type: 'file',
    format: 'binary',
  })
  profile_pic?: any;
}
