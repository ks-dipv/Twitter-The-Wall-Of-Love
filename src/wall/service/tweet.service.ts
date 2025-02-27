import { Injectable, NotFoundException } from '@nestjs/common';
import { TweetRepository } from '../repository/tweet.repository';
import { TwitterService } from './twitter.service';
import { WallRepository } from '../repository/wall.repository';
import { Tweet } from '../entity/tweets.entity';

@Injectable()
export class TweetService {
    constructor(
        private readonly tweetRepository: TweetRepository,
        private readonly wallRepository: WallRepository,
        private readonly twitterService: TwitterService
    ) {}

    async addTweetToWall(tweetUrl: string, wallId: number): Promise<Tweet> {
        const wall = await this.wallRepository.findOne({ where: { id: wallId } });
        if (!wall) throw new NotFoundException('Wall not found');

        const tweetData = await this.twitterService.fetchTweetDetails(tweetUrl);
        return await this.tweetRepository.addTweet(tweetData, wall);
    }

    async getTweetsByWall(wallId: number): Promise<Tweet[]> {
        return await this.tweetRepository.getTweetsByWall(wallId);
    }
}
