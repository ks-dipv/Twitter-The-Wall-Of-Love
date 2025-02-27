import { Repository, DataSource } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Tweet } from '../entity/tweets.entity';
import { Wall } from '../entity/wall.entity';

@Injectable()
export class TweetRepository extends Repository<Tweet> {
    constructor(private dataSource: DataSource) {
        super(Tweet, dataSource.createEntityManager());
    }

    async addTweet(tweetData: Partial<Tweet>, wall: Wall): Promise<Tweet> {
        const tweet = this.create({ ...tweetData, wall });
        return await this.save(tweet);
    }

    async getTweetsByWall(wallId: number): Promise<Tweet[]> {
        return await this.find({ where: { wall: { id: wallId } } });
    }
}
