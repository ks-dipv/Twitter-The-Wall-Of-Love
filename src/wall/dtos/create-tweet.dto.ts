import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTweetDto {

  @ApiProperty({
    description: 'The URL of the tweet',
    example: 'https://twitter.com/username/status/1234567890123456789',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^https?:\/\/(twitter\.com)\/([A-Za-z0-9_]+)\/status\/([0-9]+)$/, {
    message: 'Invalid Twitter URL format',
  })
  tweetUrl: string;
}
