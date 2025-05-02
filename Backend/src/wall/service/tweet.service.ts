import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TweetRepository } from '../repository/tweet.repository';
import { WallRepository } from '../repository/wall.repository';
import { TwitterService } from './twitter.service';
import { Tweets } from '../entity/tweets.entity';
import { UserRepository } from '../../user/repositories/user.repository';
import { Cron } from '@nestjs/schedule';
import { XUserHandleService } from './x-user-handle.service';

@Injectable()
export class TweetService {
  constructor(
    private readonly tweetRepository: TweetRepository,
    private readonly wallRepository: WallRepository,
    private readonly twitterService: TwitterService,
    private readonly userRepository: UserRepository,
    private readonly xUserHandleService: XUserHandleService,
  ) {}

  async addTweetToWall(tweetUrl: string, wallId: number, user) {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) throw new BadRequestException("User doesn't exist");

      const wall = await this.wallRepository.getWallByIdAndUser(
        wallId,
        existingUser.id,
      );
      if (!wall) throw new NotFoundException('Wall not found or access denied');

      const tweetData = await this.twitterService.fetchTweetDetails(tweetUrl);
      if (!tweetData)
        throw new BadRequestException('Invalid tweet URL or tweet not found');

      const tweet = this.tweetRepository.create({ ...tweetData, wall });
      return await this.tweetRepository.save(tweet);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error; // Rethrow known exceptions
      }
      throw new InternalServerErrorException('Failed to add tweet to wall');
    }
  }

  async addTweetToWallByXHandle(
    xHandle: string,
    wallId: number,
    user,
  ): Promise<any> {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) throw new BadRequestException("User doesn't exist");

      const wall = await this.wallRepository.getWallByIdAndUser(
        wallId,
        existingUser.id,
      );
      if (!wall) throw new NotFoundException('Wall not found or access denied');

      const tweetsData =
        await this.xUserHandleService.fetchTweetsDetailsByXHandle(xHandle);
      if (!tweetsData || tweetsData.length === 0)
        throw new BadRequestException('Failed to fetch tweet data');

      const createdTweets = [];
      const skippedTweets = [];

      for (const tweetData of tweetsData) {
        try {
          const tweetUrl = tweetData.tweet_url;
          const existingTweet = await this.tweetRepository.findOne({
            where: { tweet_url: tweetUrl, wall: { id: wall.id } },
          });

          if (existingTweet) {
            skippedTweets.push(tweetUrl);
            continue;
          }

          const tweet = this.tweetRepository.create({ ...tweetData, wall });
          const savedTweet = await this.tweetRepository.save(tweet);
          createdTweets.push(savedTweet);
        } catch (err) {
          console.error(`Error saving individual tweet: ${err.message}`);
          // Continue with other tweets even if one fails
          skippedTweets.push(tweetData.tweet_url);
        }
      }

      return {
        tweets: createdTweets,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error; // Rethrow known exceptions
      }
      throw new InternalServerErrorException('Failed to add tweet to wall');
    }
  }

  async getAllTweetsByWall(
    wallId: number,
    user,
    page: number = 1,
    limit: number = 9,
  ): Promise<{
    tweets: Tweets[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) throw new BadRequestException("User doesn't exist");

      const wall = await this.wallRepository.getWallByIdAndUser(
        wallId,
        existingUser.id,
      );
      if (!wall) throw new NotFoundException('Wall not found or access denied');

      // Calculate the offset (skip) for pagination
      const skip = (page - 1) * limit;

      // Fetch tweets with pagination
      const [tweets, total] =
        await this.tweetRepository.getTweetsByWallWithPagination(
          wallId,
          skip,
          limit,
        );

      // Calculate total pages
      const totalPages = Math.ceil(total / limit);

      return {
        tweets,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch tweets');
    }
  }

  async deleteTweetByWall(tweetId: number, wallId: number, user) {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) throw new BadRequestException("User doesn't exist");

      const tweet = await this.tweetRepository.getTweetByIdAndWall(
        tweetId,
        wallId,
      );
      if (!tweet) throw new NotFoundException('Tweet not found');

      await this.tweetRepository.remove(tweet);
      return { message: 'Tweet deleted successfully' };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete tweet');
    }
  }

  async reorderTweets(wallId: number, user, orderedTweetIds: number[]) {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) throw new BadRequestException("User doesn't exist");

      const wall = await this.wallRepository.getWallByIdAndUser(
        wallId,
        existingUser.id,
      );
      if (!wall) throw new NotFoundException('Wall not found or access denied');

      // Fetch all tweets for the wall
      const allTweets = await this.tweetRepository.find({
        where: { wall: { id: wallId } },
        select: ['id'],
      });
      const allTweetIds = allTweets.map((tweet) => tweet.id);

      // Validate orderedTweetIds
      const invalidTweetIds = orderedTweetIds.filter(
        (id) => !allTweetIds.includes(id),
      );
      if (invalidTweetIds.length > 0) {
        console.warn(
          `Invalid tweet IDs for wall ${wallId}: ${invalidTweetIds.join(', ')}`,
        );
      }

      // If no valid tweet IDs remain, throw an error
      if (orderedTweetIds.length === 0) {
        throw new BadRequestException(
          'No valid tweet IDs provided for reordering',
        );
      }

      // Update order_index for valid tweet IDs
      const updatePromises = orderedTweetIds
        .filter((id) => allTweetIds.includes(id))
        .map((tweetId, index) => {
          return this.tweetRepository.update(tweetId, { order_index: index });
        });

      await Promise.all(updatePromises);

      return {
        message: 'Tweets reordered successfully',
        reorderedTweetIds: orderedTweetIds,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to reorder tweets');
    }
  }

  @Cron('0 0 * * *')
  async updateTweetStatsDaily() {
    try {
      const tweets = await this.tweetRepository.find();
      if (!tweets.length) return;

      for (const tweet of tweets) {
        const updatedTweetData = await this.twitterService.fetchTweetDetails(
          tweet.tweet_url,
        );

        await this.tweetRepository.update(tweet.id, {
          likes: updatedTweetData.likeCount,
          comments: updatedTweetData.commentCount,
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Tweet update job failed',
      );
    }
  }
  async searchTweets(wallId: number, keyword: string, user): Promise<Tweets[]> {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) {
        throw new BadRequestException("User doesn't exist");
      }

      // Validate the wall exists for the given user
      const wall = await this.wallRepository.getWallByIdAndUser(
        wallId,
        existingUser.id,
      );
      if (!wall) {
        throw new NotFoundException('Wall not found or access denied');
      }

      // Validate the search keyword
      if (!keyword || keyword.trim().length === 0) {
        throw new BadRequestException('Search keyword is required');
      }

      // Search tweets by keyword for this wall
      return await this.tweetRepository.searchTweetsByKeyword(wallId, keyword);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to search tweets');
    }
  }

  async filterTweetsByDate(
    wallId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<Tweets[]> {
    try {
      const start = startDate ? new Date(startDate) : new Date();
      let end = new Date();
      if (endDate) {
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }

      return await this.tweetRepository.filterTweetsByDateRange(
        wallId,
        start,
        end,
      );
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException('Failed to filter tweets by date');
    }
  }
}
