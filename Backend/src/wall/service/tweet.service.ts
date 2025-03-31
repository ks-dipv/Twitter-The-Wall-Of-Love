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
import { REQUEST_USER_KEY } from '../../common/constants/auth.constant';
import { UserRepository } from '../../user/repositories/user.repository';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TweetService {
  constructor(
    private readonly tweetRepository: TweetRepository,
    private readonly wallRepository: WallRepository,
    private readonly twitterService: TwitterService,
    private readonly userRepository: UserRepository,
  ) {}

  async addTweetToWall(tweetUrl: string, wallId: number, user) {
    try {
      if (!user) throw new UnauthorizedException('User not authenticated');

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

  async getAllTweetsByWall(wallId: number, user): Promise<Tweets[]> {
    try {
      if (!user) throw new UnauthorizedException('User not authenticated');

      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) throw new BadRequestException("User doesn't exist");

      const wall = await this.wallRepository.getWallByIdAndUser(
        wallId,
        existingUser.id,
      );
      if (!wall) throw new NotFoundException('Wall not found or access denied');

      return await this.tweetRepository.getTweetsByWall(wallId);
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
      if (!user) throw new UnauthorizedException('User not authenticated');

      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) throw new BadRequestException("User doesn't exist");

      const wall = await this.wallRepository.getWallByIdAndUser(
        wallId,
        existingUser.id,
      );

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
      if (!user) throw new UnauthorizedException('User not authenticated');

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
      // Validate the request user

      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }
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
}