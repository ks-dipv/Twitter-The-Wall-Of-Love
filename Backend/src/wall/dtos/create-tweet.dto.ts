import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTweetDto {
  @ApiProperty({
    description: 'The URL of the tweet',
    example: 'https://twitter.com/username/status/1234567890123456789',
  })
  @IsString()
  @Matches(/^https?:\/\/(twitter\.com)\/([A-Za-z0-9_]+)\/status\/([0-9]+)$/, {
    message: 'Invalid Twitter URL format',
  })
  tweetUrl: string;


  @IsString()
  hashtag: string;

  @ApiProperty({
    description: 'The URL of the user',
    example: 'https://twitter.com/username/narendramodi',
  })
  @IsString()
  xHandle: string;

}
