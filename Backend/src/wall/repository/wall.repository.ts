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

  async getTotalData() {
    // Total walls count
    const totalWalls = await this.count({});

    // Private walls count
    const privateWalls = await this.count({
      where: { visibility: WallVisibility.PRIVATE },
    });

    // Public walls count
    const publicWalls = totalWalls - privateWalls;

    return {
      totalWalls,
      publicWalls,
      privateWalls,
    };
  }
}
