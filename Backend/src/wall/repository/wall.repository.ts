import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Wall } from '../entity/wall.entity';
import { WallVisibility } from '../enum/wall-visibility.enum';

@Injectable()
export class WallRepository extends Repository<Wall> {
  constructor(private dataSource: DataSource) {
    super(Wall, dataSource.createEntityManager());
  }

  async getById(id: number): Promise<Wall> {
    return await this.findOne({
      where: { id },
    });
  }

  async getWallByIdAndUser(wallId: number, userId: number): Promise<Wall> {
    return await this.findOne({
      where: { id: wallId, user: { id: userId } },
    });
  }

  async getTotalData(userId: number) {
    // Total walls count
    const totalWalls = await this.count({
      where: { user: { id: userId } },
    });

    // Private walls count
    const privateWalls = await this.count({
      where: {
        user: { id: userId },
        visibility: WallVisibility.PRIVATE,
      },
    });

    // Public walls count
    const publicWalls = totalWalls - privateWalls;

    return {
      totalWalls,
      publicWalls,
      privateWalls,
    };
  }
 
  async searchWallsByKeyword(keyword: string): Promise<Wall[]> {
    return await this.createQueryBuilder('wall')
      .where('wall.title LIKE :keyword', { keyword: `%${keyword}%` }) // Match title first
      .orWhere('wall.description LIKE :keyword', { keyword: `%${keyword}%` }) // Then match description
      .orderBy('CASE WHEN wall.title LIKE :keyword THEN 1 ELSE 2 END', 'ASC') // Prioritize title matches
      .getMany();
  }
  
}
