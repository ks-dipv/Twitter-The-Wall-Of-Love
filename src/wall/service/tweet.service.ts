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
    ) { }

    async addTweetToWall(tweetUrl: string, wallId: number): Promise<Tweet> {
        const wall = await this.wallRepository.findOne({ where: { id: wallId } });
        if (!wall) {
            throw new NotFoundException('Wall not found');
        }
        const tweetData = await this.twitterService.fetchTweetDetails(tweetUrl);
        return await this.tweetRepository.addTweet(tweetData, wall);
    }

    // Get All tweets in by WAll Id
    async getAllTweetsByWall(wallId: number): Promise<Tweet[]> {
        return await this.tweetRepository.find({ where: { wall: { id: wallId } } });
    }

    // Get particular tweet by wall id 
    async getTweetByWall(tweetId: number, wallId: number): Promise<Tweet> {
        return await this.tweetRepository.findOne({ where: { id: tweetId, wall: { id: wallId } } });

    }

    // Delete a particular tweet by wall id 
    async deleteTweetByWall(tweetId: number, wallId: number): Promise<{ message: string }> {
        const tweet = await this.tweetRepository.findOne({ where: { id: tweetId, wall: { id: wallId } } });

        if (!tweet) {
            throw new NotFoundException(`Tweet with ID ${tweetId} not found for Wall ID ${wallId}`);
        }

        await this.tweetRepository.remove(tweet);

        return { message: `Tweet with ID ${tweetId} deleted successfully from Wall ID ${wallId}` };
    }



}
