import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import { TweetService } from './service/tweet.service';
import {
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SuccessDto } from 'src/common/dtos/success.dto';

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
  ) {
    return await this.tweetService.addTweetToWall(tweetUrl, wallId);
  }

  @Get(':wallId/tweets')
  @ApiOperation({ summary: 'Get all tweets for a specific wall' })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  @ApiResponse({ status: 200, description: 'List of tweets retrieved' })
  @ApiResponse({ status: 404, description: 'Wall not found' })
  async getAllTweetsByWall(@Param('wallId') wallId: number) {
    return await this.tweetService.getAllTweetsByWall(wallId);
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
  ) {
    await this.tweetService.deleteTweetByWall(tweetId, wallId);

    return new SuccessDto('Tweet Delete Successfuly');
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
    @Body('orderedTweetIds') orderedTweetIds?: number[],
    @Body('randomize') randomize?: boolean,
  ) {
    return this.tweetService.reorderTweets(wallId, orderedTweetIds, randomize);
  }

  @Get(':wallId/tweet')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({
    summary: 'Get all tweets for a specific wall or search tweets by keyword',
  })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  @ApiResponse({ status: 200, description: 'List of tweets retrieved' })
  async getAllTweets(
    @Param('wallId') wallId: number,
    @Query('search') keyword: string,
  ) {
    return await this.tweetService.searchTweets(wallId, keyword);
  }
}
