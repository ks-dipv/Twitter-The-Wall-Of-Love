import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Tweets } from '../entity/tweets.entity';

@Injectable()
export class TweetRepository extends Repository<Tweets> {
  constructor(private dataSource: DataSource) {
    super(Tweets, dataSource.createEntityManager());
  }

  async getTweetsByWall(wallId: number): Promise<Tweets[]> {
    return await this.find({
      where: { wall: { id: wallId } },
      order: { order_index: 'ASC' },
    });
  }

  async getTweetByIdAndWall(tweetId: number, wallId: number): Promise<Tweets> {
    return await this.findOne({
      where: { id: tweetId, wall: { id: wallId } },
    });
  }
   async searchTweetsByKeyword(
    wallId: number,
    keyword: string,
  ): Promise<Tweets[]> {
    return this.createQueryBuilder('tweets')
      .leftJoin('tweets.wall', 'wall')
      .where('wall.id = :wallId', { wallId })
      .andWhere('LOWER(tweets.content) LIKE LOWER(:keyword)', {
        keyword: `%${keyword}%`,
      })
      .getMany();
  }
}