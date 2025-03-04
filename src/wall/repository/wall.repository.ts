import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Wall } from '../entity/wall.entity';

@Injectable()
export class WallRepository extends Repository<Wall> {
  constructor(private dataSource: DataSource) {
    super(Wall, dataSource.createEntityManager());
  }

  // Get wall by ID
  async getById(id: number): Promise<Wall> {
    return await this.findOne({
      where: { id },
    });
  }
}
