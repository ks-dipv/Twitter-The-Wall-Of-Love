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
import { InjectRepository } from '@nestjs/typeorm';
import { TweetHandleQueue } from '../entity/tweet-handle-queue.entity';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from 'src/pagination/dtos/pagination-query.dto';
import { PaginationService } from 'src/pagination/services/pagination.service';
import { Paginated } from 'src/pagination/interfaces/paginated.interface';

@Injectable()
export class TweetService {
  constructor(
    private readonly tweetRepository: TweetRepository,
    private readonly wallRepository: WallRepository,
    private readonly twitterService: TwitterService,
    private readonly userRepository: UserRepository,
    private readonly xUserHandleService: XUserHandleService,
    private readonly paginationService: PaginationService,

    @InjectRepository(TweetHandleQueue)
    private readonly tweetHandleQueueRepository: Repository<TweetHandleQueue>,
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

      const tweetUrls = await this.tweetHandleQueueRepository.findOne({
        where: { url: xHandle },
      });

      if (!tweetUrls) {
        const tweetHandleQueue = this.tweetHandleQueueRepository.create({
          url: xHandle,
          wall: wall,
          processed: false,
        });
        await this.tweetHandleQueueRepository.save(tweetHandleQueue);
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
        throw error;
      }
      throw new InternalServerErrorException('Failed to add tweet to wall');
    }
  }

  @Cron('*/15 * * * *')
  async processNextHandleUrl() {
    const nextHandle = await this.tweetHandleQueueRepository.findOne({
      where: { processed: false },
      relations: ['wall'],
      order: { id: 'ASC' },
    });

    if (!nextHandle) {
      await this.tweetHandleQueueRepository.update({}, { processed: false });
      console.log('All handles processed. Resetting for a new round.');
      return;
    }

    try {
      console.log(`Processing handle: ${nextHandle.url}`);

      await this.addTweetToWallByXHandle(
        nextHandle.url,
        nextHandle.wall.id,
        nextHandle.wall.user,
      );

      nextHandle.processed = true;
      await this.tweetHandleQueueRepository.save(nextHandle);

      console.log(`Handle processed successfully: ${nextHandle.url}`);
    } catch (error) {
      console.error(`Error processing handle: ${nextHandle.url}`, error);
    }
  }

  async getAllTweetsByWall(
    wallId: number,
    paginationQueryDto: PaginationQueryDto,
    user,
  ): Promise<Paginated<Tweets>> {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) throw new BadRequestException("User doesn't exist");

      const wall = await this.wallRepository.getWallByIdAndUser(
        wallId,
        existingUser.id,
      );
      if (!wall) throw new NotFoundException('Wall not found or access denied');

      return await this.paginationService.paginateQuery(
        {
          limit: paginationQueryDto.limit,
          page: paginationQueryDto.page,
        },
        this.tweetRepository,
        { wall: { id: wallId } },
        { order_index: 'ASC' },
      );
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

  async reorderTweets(
    wallId: number,
    user,
    orderedTweetIds?: number[],
    randomize?: boolean,
  ) {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) throw new BadRequestException("User doesn't exist");

      const wall = await this.wallRepository.getWallByIdAndUser(
        wallId,
        existingUser.id,
      );
      if (!wall) throw new NotFoundException('Wall not found or access denied');

      const tweets = await this.tweetRepository.getTweetsByWall(wallId);
      if (!tweets.length)
        throw new BadRequestException('No tweets found for this wall');

      if (randomize) {
        tweets.sort(() => Math.random() - 0.5);
      } else if (orderedTweetIds) {
        if (tweets.length !== orderedTweetIds.length) {
          throw new BadRequestException('Invalid tweet order data.');
        }

        const tweetMap = new Map(tweets.map((tweet) => [tweet.id, tweet]));

        for (const tweetId of orderedTweetIds) {
          if (!tweetMap.has(tweetId)) {
            throw new BadRequestException('Invalid tweet ID in reorder list.');
          }
        }

        tweets.sort(
          (a, b) =>
            orderedTweetIds.indexOf(a.id) - orderedTweetIds.indexOf(b.id),
        );
      } else {
        throw new BadRequestException(
          'Either provide an ordered list or set randomize to true.',
        );
      }

      for (let i = 0; i < tweets.length; i++) {
        await this.tweetRepository.update(tweets[i].id, { order_index: i });
      }

      return await this.tweetRepository.getTweetsByWall(wallId);
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

  async addTweetsByHashtagToWall(
    hashtag: string,
    wallId: number,
    user,
  ): Promise<Tweets[]> {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) throw new BadRequestException("User doesn't exist");

      const wall = await this.wallRepository.getWallByIdAndUser(
        wallId,
        existingUser.id,
      );
      if (!wall) throw new NotFoundException('Wall not found or access denied');

      // Fetch tweets by hashtag
      const tweetsData =
        await this.twitterService.fetchTweetsByHashtag(hashtag);

      if (tweetsData.length === 0) {
        throw new BadRequestException('No tweets found for the given hashtag');
      }

      // Add tweets to the wall
      const createdTweets = await Promise.all(
        tweetsData.map(async (tweetData) => {
          // Check if tweet already exists in the wall
          const existingTweet = await this.tweetRepository.findOne({
            where: {
              tweet_url: tweetData.tweet_url,
              wall, // Make sure the tweet belongs to the specific wall
            },
          });

          if (existingTweet) {
            // If the tweet already exists, skip adding it
            console.log(`Tweet already exists: ${tweetData.tweet_url}`);
            return null; // Return null to avoid adding this tweet
          }

          // If the tweet does not exist, create and save it
          const tweet = this.tweetRepository.create({
            ...tweetData,
            wall,
          });
          return await this.tweetRepository.save(tweet);
        }),
      );

      // Filter out any null values from already existing tweets
      return createdTweets.flat().filter((tweet) => tweet !== null);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to add tweets by hashtag to wall',
      );
    }
  }
}
