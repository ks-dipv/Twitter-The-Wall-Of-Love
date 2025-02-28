import { Controller, Post, Get, Param, Body, Delete } from '@nestjs/common';
import { TweetService } from './service/tweet.service';

@Controller('api/walls')
export class TweetController {
    constructor(private readonly tweetService: TweetService) { }

    @Post(':wallId/tweets')
    async addTweet(@Param('wallId') wallId: number, @Body('tweetUrl') tweetUrl: string) {
        return await this.tweetService.addTweetToWall(tweetUrl, wallId);
    }

    // Get all tweets by wall id 
    @Get(':wallId/tweets/list')
    async getAllTweetsByWall(@Param('wallId') wallId: number) {
        return await this.tweetService.getAllTweetsByWall(wallId);
    }


    // Get particular tweet by wall id 
    @Get(':wallId/tweets/:tweetId')
    async getTweetByWall(@Param('tweetId') tweetId: number, @Param('wallId') wallId: number) {
        return await this.tweetService.getTweetByWall(tweetId, wallId);
    }

    //Delete particular tweet by wall id 
    @Delete(':wallId/tweets/:tweetId')
    async deleteTweetByWall(@Param('tweetId') tweetId: number, @Param('wallId') wallId: number) {
        return await this.tweetService.deleteTweetByWall(tweetId, wallId);
    }


}
