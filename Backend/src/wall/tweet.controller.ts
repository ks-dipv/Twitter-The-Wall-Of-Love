import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { TweetService } from './service/tweet.service';
import { ApiTags, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { User } from '../common/decorator/user.decorater';
import { CommonApiDecorators } from 'src/common/decorator/common-api.decorator';
import { Auth } from 'src/common/decorator/auth.decorator';
import { AuthType } from 'src/common/enum/auth-type.enum';

@ApiTags('Tweets')
@Controller('api/walls')
export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  @Post(':wallId/tweets')
  @CommonApiDecorators({
    summary: 'Add a tweet to a wall',
    successStatus: 201,
    successDescription: 'Tweet added successfully',
  })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tweetUrl: {
          type: 'string',
          example: 'https://twitter.com/username/status/1234567890123456789',
        },
      },
    },
  })
  async addTweet(
    @Param('wallId') wallId: number,
    @Body('tweetUrl') tweetUrl: string,
    @User() user,
  ) {
    return await this.tweetService.addTweetToWall(tweetUrl, wallId, user);
  }

  @Get(':wallId/tweets')
  @CommonApiDecorators({
    summary: 'Get all tweets for a specific wall',
    successDescription: 'List of tweets retrieved',
    errorStatus: 404,
    errorDescription: 'Wall not found',
  })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  async getAllTweetsByWall(@Param('wallId') wallId: number, @User() user) {
    return await this.tweetService.getAllTweetsByWall(wallId, user);
  }

  @Delete(':wallId/tweets/:tweetId')
  @CommonApiDecorators({
    summary: 'Delete a tweet from a wall',
    successDescription: 'Tweet deleted successfully',
    errorStatus: 404,
    errorDescription: 'Tweet or Wall not found',
  })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  @ApiParam({ name: 'tweetId', description: 'ID of the Tweet', type: Number })
  async deleteTweetByWall(
    @Param('tweetId') tweetId: number,
    @Param('wallId') wallId: number,
    @Request() req: Request,
  ) {
    return await this.tweetService.deleteTweetByWall(tweetId, wallId, req);
  }

  @Put(':wallId/tweets/reorder')
  @CommonApiDecorators({
    summary: 'Reorder tweets for a wall',
    successDescription: 'Tweets reordered successfully',
  })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderedTweetIds: {
          type: 'array',
          items: { type: 'number' },
          example: [3, 1, 2],
        },
        randomize: { type: 'boolean', example: true },
      },
    },
  })
  async reorderTweets(
    @Param('wallId') wallId: number,
    @User() user,
    @Body('orderedTweetIds') orderedTweetIds?: number[],
    @Body('randomize') randomize?: boolean,
  ) {
    return this.tweetService.reorderTweets(
      wallId,
      user,
      orderedTweetIds,
      randomize,
    );
  }

  @Get(':wallId/tweet')
  @CommonApiDecorators({
    summary: 'Get all tweets for a specific wall or search tweets by keyword',
    successDescription: 'List of tweets retrieved',
  })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  async getAllTweets(
    @Param('wallId') wallId: number,
    @Query('search') keyword: string,
    @User() user,
  ) {
    return await this.tweetService.searchTweets(wallId, keyword, user);
  }

  @Get(':wallId/filter')
  @CommonApiDecorators({
    summary: 'Get all tweets for a wall with optional date filtering',
    successDescription: 'List of tweets retrieved',
  })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering tweets',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering tweets',
  })
  @Auth(AuthType.None)
  async getTweetsByDate(
    @Param('wallId') wallId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.tweetService.filterTweetsByDate(
      wallId,
      startDate,
      endDate,
    );
  }
}
