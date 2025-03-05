import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Delete,
  Request,
} from '@nestjs/common';
import { TweetService } from './service/tweet.service';

@Controller('api/walls')
export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  @Post(':wallId/tweets')
  async addTweet(
    @Param('wallId') wallId: number,
    @Body('tweetUrl') tweetUrl: string,
    @Request() req: Request,
  ) {
    return await this.tweetService.addTweetToWall(tweetUrl, wallId, req);
  }

  @Get(':wallId/tweets/list')
  async getAllTweetsByWall(
    @Param('wallId') wallId: number,
    @Request() req: Request,
  ) {
    return await this.tweetService.getAllTweetsByWall(wallId, req);
  }

  @Get(':wallId/tweets/:tweetId')
  async getTweetByWall(
    @Param('tweetId') tweetId: number,
    @Param('wallId') wallId: number,
    @Request() req: Request,
  ) {
    return await this.tweetService.getTweetByWall(tweetId, wallId, req);
  }

  @Delete(':wallId/tweets/:tweetId')
  async deleteTweetByWall(
    @Param('tweetId') tweetId: number,
    @Param('wallId') wallId: number,
    @Request() req: Request,
  ) {
    return await this.tweetService.deleteTweetByWall(tweetId, wallId, req);
  }

  @Put(':wallId/tweets/reorder')
  async reorderTweets(
    @Param('wallId') wallId: number,
    @Request() req: Request,
    @Body('orderedTweetIds') orderedTweetIds?: number[],
    @Body('randomize') randomize?: boolean,
  ) {
    return this.tweetService.reorderTweets(
      wallId,
      req,
      orderedTweetIds,
      randomize,
    );
  }
}
