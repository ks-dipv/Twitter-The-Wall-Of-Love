import { Injectable, NotFoundException } from '@nestjs/common';
import { TweetRepository } from '../repository/tweet.repository';
import { TwitterService } from './twitter.service';
import { WallRepository } from '../repository/wall.repository';
import { Tweet } from '../entity/tweets.entity';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
@Injectable()
export class TweetService {
    constructor(
        private readonly tweetRepository: TweetRepository,
        private readonly wallRepository: WallRepository,
        private readonly twitterService: TwitterService,
        private readonly dataSource: DataSource
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
    async getAllTweetsByWall(wallId: number, randomize: boolean = false): Promise<Tweet[]> {
        let tweets = await this.tweetRepository.find({ where: { wall: { id: wallId } }, order: { orderIndex: 'ASC' } });
        if (randomize) {
            tweets = tweets.sort(() => Math.random() - 0.5); // Shuffle order

        }
        return tweets;
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

    // Reorder of tweets 
    async reorderTweets(wallId: number, orderedTweetIds: number[]): Promise<{ message: string }> {
        const tweets = await this.tweetRepository.find({
            where: { wall: { id: wallId } },
            order: { orderIndex: 'ASC' }
        });

        if (tweets.length !== orderedTweetIds.length) {
            throw new BadRequestException('Invalid tweet order data: Some tweets may be missing.');
        }

        // Validate all tweet IDs exist in the current wall
        const tweetMap = new Map(tweets.map(tweet => [tweet.id, tweet]));
        for (const tweetId of orderedTweetIds) {
            if (!tweetMap.has(tweetId)) {
                throw new BadRequestException(`Tweet ID ${tweetId} is not associated with Wall ID ${wallId}`);
            }
        }

        // Use transaction to update order indexes in bulk
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for (let i = 0; i < orderedTweetIds.length; i++) {
                await queryRunner.manager.update(Tweet, orderedTweetIds[i], { orderIndex: i });
            }
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException('Failed to reorder tweets. Please try again.');
        } finally {
            await queryRunner.release();
        }

        return { message: 'Tweet order updated successfully' };
    }


}
