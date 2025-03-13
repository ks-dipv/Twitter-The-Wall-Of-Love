import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Delete,
  Request,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { TweetService } from './service/tweet.service';
import {
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Tweets')
@Controller('api/walls')
export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  @Post(':wallId/tweets')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Add a tweet to a wall' })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tweetUrl: {
          type: 'string',
          example: 'https://twitter.com/username/status/1234567890123456789',
          description: 'URL of the tweet to be added',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Tweet added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid tweet URL' })
  async addTweet(
    @Param('wallId') wallId: number,
    @Body('tweetUrl') tweetUrl: string,
    @Request() req: Request,
  ) {
    return await this.tweetService.addTweetToWall(tweetUrl, wallId, req);
  }

  @Get(':wallId/tweets')
  @ApiOperation({ summary: 'Get all tweets for a specific wall' })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  @ApiResponse({ status: 200, description: 'List of tweets retrieved' })
  @ApiResponse({ status: 404, description: 'Wall not found' })
  async getAllTweetsByWall(
    @Param('wallId') wallId: number,
    @Request() req: Request,
  ) {
    return await this.tweetService.getAllTweetsByWall(wallId, req);
  }

  @Delete(':wallId/tweets/:tweetId')
  @ApiOperation({ summary: 'Delete a tweet from a wall' })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  @ApiParam({ name: 'tweetId', description: 'ID of the Tweet', type: Number })
  @ApiResponse({ status: 200, description: 'Tweet deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tweet or Wall not found' })
  async deleteTweetByWall(
    @Param('tweetId') tweetId: number,
    @Param('wallId') wallId: number,
    @Request() req: Request,
  ) {
    return await this.tweetService.deleteTweetByWall(tweetId, wallId, req);
  }

  @Put(':wallId/tweets/reorder')
  @ApiOperation({ summary: 'Reorder tweets for a wall' })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderedTweetIds: {
          type: 'array',
          items: { type: 'number' },
          example: [3, 1, 2],
          description: 'Array of tweet IDs in the new order',
        },
        randomize: {
          type: 'boolean',
          example: true,
          description: 'Set to true to randomize the tweet order',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Tweets reordered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid tweet order request' })
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
