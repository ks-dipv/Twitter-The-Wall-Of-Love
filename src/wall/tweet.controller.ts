import { Controller, Post, Get,Put, Query, Param, Body, Delete } from '@nestjs/common';
import { TweetService } from './service/tweet.service';
import { BadRequestException } from '@nestjs/common';
@Controller('api/walls')
export class TweetController {
    constructor(private readonly tweetService: TweetService) { }

    @Post(':wallId/tweets')
    async addTweet(@Param('wallId') wallId: number, @Body('tweetUrl') tweetUrl: string) {
        return await this.tweetService.addTweetToWall(tweetUrl, wallId);
    }

    // Get all tweets by wall id 
    @Get(':wallId/tweets/list')
    async getAllTweetsByWall(@Param('wallId') wallId: number, @Query('randomize') randomize: string) {
        return await this.tweetService.getAllTweetsByWall(wallId,randomize === 'true');
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

    @Put(':wallId/tweets/reorder')
    async reorderTweets(
        @Param('wallId') wallId: number,
        @Body('orderedTweetIds') orderedTweetIds: number[]
    ) {
        if (!Array.isArray(orderedTweetIds) || orderedTweetIds.length === 0) {
            throw new BadRequestException('Invalid orderedTweetIds array.');
        }
        return await this.tweetService.reorderTweets(wallId, orderedTweetIds);
    }


}
