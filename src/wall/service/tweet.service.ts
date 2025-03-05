import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { TweetRepository } from '../repository/tweet.repository';
import { WallRepository } from '../repository/wall.repository';
import { TwitterService } from './twitter.service';
import { Tweets } from '../entity/tweets.entity';
import { REQUEST_USER_KEY } from 'src/user/constants/auth.constant';
import { UserRepository } from 'src/user/repositories/user.repository';

@Injectable()
export class TweetService {
  constructor(
    private readonly tweetRepository: TweetRepository,
    private readonly wallRepository: WallRepository,
    private readonly twitterService: TwitterService,
    private readonly userRepository: UserRepository,
  ) {}

  async addTweetToWall(tweetUrl: string, wallId: number, req: Request) {
    const user = req[REQUEST_USER_KEY];
    if (!user) throw new UnauthorizedException('User not authenticated');

    const existingUser = await this.userRepository.getByEmail(user.email);

    const wall = await this.wallRepository.getWallByIdAndUser(
      wallId,
      existingUser.id,
    );

    if (!wall) throw new NotFoundException('Wall not found or access denied');

    const tweetData = await this.twitterService.fetchTweetDetails(tweetUrl);

    const tweet = this.tweetRepository.create({
      ...tweetData,
      wall,
    });

    await this.tweetRepository.save(tweet);
    return { message: 'Tweet added successfully' };
  }

  async getAllTweetsByWall(wallId: number, req: Request): Promise<Tweets[]> {
    const user = req[REQUEST_USER_KEY];

    const existingUser = await this.userRepository.getByEmail(user.email);

    const wall = await this.wallRepository.getWallByIdAndUser(
      wallId,
      existingUser.id,
    );

    if (!wall) throw new NotFoundException('Wall not found or access denied');

    return await this.tweetRepository.getTweetsByWall(wallId);
  }

  async getTweetByWall(tweetId: number, wallId: number, req: Request) {
    const user = req[REQUEST_USER_KEY];

    const existingUser = await this.userRepository.getByEmail(user.email);

    const wall = await this.wallRepository.getWallByIdAndUser(
      wallId,
      existingUser.id,
    );

    if (!wall) throw new NotFoundException('Wall not found or access denied');

    const tweet = await this.tweetRepository.getTweetByIdAndWall(
      tweetId,
      wallId,
    );

    if (!tweet) throw new NotFoundException('Tweet not found');

    return tweet;
  }

  async deleteTweetByWall(tweetId: number, wallId: number, req: Request) {
    const user = req[REQUEST_USER_KEY];
    const existingUser = await this.userRepository.getByEmail(user.email);

    const wall = await this.wallRepository.getWallByIdAndUser(
      wallId,
      existingUser.id,
    );

    if (!wall) throw new NotFoundException('Wall not found or access denied');

    const tweet = await this.tweetRepository.getTweetByIdAndWall(
      tweetId,
      wallId,
    );

    if (!tweet) throw new NotFoundException('Tweet not found');

    await this.tweetRepository.remove(tweet);
    return { message: 'Tweet deleted successfully' };
  }

  async reorderTweets(
    wallId: number,
    req: Request,
    orderedTweetIds?: number[],
    randomize?: boolean,
  ) {
    const user = req[REQUEST_USER_KEY];
    const existingUser = await this.userRepository.getByEmail(user.email);

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
        (a, b) => orderedTweetIds.indexOf(a.id) - orderedTweetIds.indexOf(b.id),
      );
    } else {
      throw new BadRequestException(
        'Either provide an ordered list or set randomize to true.',
      );
    }

    for (let i = 0; i < tweets.length; i++) {
      await this.tweetRepository.update(tweets[i].id, { orderIndex: i });
    }

    return { message: 'Tweet order updated successfully' };
  }
}
