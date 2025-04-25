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
  
  async getTweetsByWallWithPagination(
    wallId: number,
    skip: number,
    limit: number,
  ): Promise<[Tweets[], number]> {
    return await this.findAndCount({
      where: { wall: { id: wallId } },
      order: { order_index: 'ASC' },
      skip: skip,
      take: limit,
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

  async filterTweetsByDateRange(
    wallId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Tweets[]> {
    const query = this.createQueryBuilder('tweets')
      .leftJoin('tweets.wall', 'wall')
      .where('wall.id = :wallId', { wallId });

    if (startDate) {
      query.andWhere('tweets.created_at >= :startDate', {
        startDate: startDate,
      });
    }

    if (endDate) {
      query.andWhere('tweets.created_at <= :endDate', {
        endDate: endDate,
      });
    }

    return await query.orderBy('tweets.created_at', 'DESC').getMany();
  }
}
