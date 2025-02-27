import { IsNotEmpty, IsString, IsNumber, IsUrl, Matches } from 'class-validator';

export class CreateTweetDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^https?:\/\/(twitter\.com)\/([A-Za-z0-9_]+)\/status\/([0-9]+)$/, {
        message: 'Invalid Twitter URL format',
    })
    tweetUrl: string;
}
