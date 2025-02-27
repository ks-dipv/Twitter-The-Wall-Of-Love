import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { TweetService } from './service/tweet.service';

@Controller('api/tweets')
export class TweetController {
    constructor(private readonly tweetService: TweetService) {}

    @Post('add/:wallId')
    async addTweet(@Param('wallId') wallId: number, @Body('tweetUrl') tweetUrl: string) {
        return await this.tweetService.addTweetToWall(tweetUrl, wallId);
    }

    @Get('wall/:wallId')
    async getTweets(@Param('wallId') wallId: number) {
        return await this.tweetService.getTweetsByWall(wallId);
    }
}
