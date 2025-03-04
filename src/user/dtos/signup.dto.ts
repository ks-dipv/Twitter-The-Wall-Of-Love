import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'Minimum 8 character, at least one letter, one number and one special character',
  })
  password: string;

  @IsString()
  @IsOptional()
  profile_pic?: string;

  @IsString()
  @IsOptional()
  twitter_id?: string;
}
