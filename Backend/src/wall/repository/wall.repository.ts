import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Wall } from '../entity/wall.entity';

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
}
