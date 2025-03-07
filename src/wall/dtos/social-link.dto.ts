import { IsString, IsNotEmpty, IsInt, IsEnum, IsOptional } from 'class-validator';
import { SocialPlatform } from '../enum/social-platform.enum';
import { ApiProperty } from '@nestjs/swagger';

export class SocialLinkDto {

  @ApiProperty({
    description: 'The social media platform',
    example: SocialPlatform.TWITTER,
    enum: SocialPlatform,
  })
  @IsEnum(SocialPlatform)
  @IsString()
  @IsNotEmpty()
  platform?: SocialPlatform; // Example: Twitter, LinkedIn, Instagram

  @ApiProperty({
    description: 'The URL of the social media profile',
    example: 'https://twitter.com/username',
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}
