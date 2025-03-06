import { IsString, IsNotEmpty, IsInt, IsEnum, IsOptional } from 'class-validator';
import { SocialPlatform } from '../enum/social-platform.enum';
export class SocialLinkDto {


  @IsEnum(SocialPlatform)
  @IsString()
  @IsNotEmpty()
  platform?:SocialPlatform; // Example: Twitter, LinkedIn, Instagram

  @IsString()
  @IsNotEmpty()
  url: string;
}
