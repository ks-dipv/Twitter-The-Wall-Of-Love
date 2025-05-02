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
  Req,
} from '@nestjs/common';
import { TweetService } from './service/tweet.service';
import { ApiTags, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { User } from '../common/decorator/user.decorater';
import { CommonApiDecorators } from 'src/common/decorator/common-api.decorator';
import { Auth } from 'src/common/decorator/auth.decorator';
import { AuthType } from 'src/common/enum/auth-type.enum';
import { DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
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
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of tweets per page (default: 9)',
  })
  async getAllTweetsByWall(
    @Param('wallId') wallId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(9), ParseIntPipe) limit: number = 9,
    @User() user,
  ) {
    return await this.tweetService.getAllTweetsByWall(
      wallId,
      user,
      page,
      limit,
    );
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
    @User() user,
  ) {
    return await this.tweetService.deleteTweetByWall(tweetId, wallId, user);
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
      },
    },
  })
  async reorderTweets(
    @Param('wallId', ParseIntPipe) wallId: number,
    @Body() body: { orderedTweetIds: number[] },
    @User() user,
  ) {
    return this.tweetService.reorderTweets(wallId, user, body.orderedTweetIds);
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

  @Post(':wallId/tweets/hashtag')
  @CommonApiDecorators({
    summary: 'Add tweets based on hashtag to a wall',
    successStatus: 201,
    successDescription: 'Tweets added successfully',
  })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        hashtag: {
          type: 'string',
          example: 'News',
        },
      },
    },
  })
  async addTweetsByHashtag(
    @Param('wallId') wallId: number,
    @Body('hashtag') hashtag: string,
    @User() user,
  ) {
    return await this.tweetService.addTweetsByHashtagToWall(hashtag, wallId, user);
  }
}
