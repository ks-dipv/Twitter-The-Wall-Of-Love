import { IsString, IsNotEmpty } from 'class-validator';

export class SocialLinkDto {
  @IsString()
  @IsNotEmpty()
  platform: string; // Example: Twitter, LinkedIn, Instagram

  @IsString()
  @IsNotEmpty()
  url: string;
}
