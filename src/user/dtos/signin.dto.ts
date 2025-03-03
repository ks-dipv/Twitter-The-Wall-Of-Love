import { IsOptional, IsString } from 'class-validator';

export class SignInDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  twitter_id?: string;
}
