import { Injectable } from '@nestjs/common';
import { WallRepository } from '../repository/wall.repository';
import { CreateWallDto } from '../dtos/create-wall.dto';
import { User } from 'src/user/entity/user.entity';
import { Wall } from '../entity/wall.entity';
import { UpdateWallDto } from '../dtos/update-wall.dto';

@Injectable()
export class WallService {

    constructor(private readonly wallRepository: WallRepository) { }

    async createWall(createWallDto: CreateWallDto, user: User): Promise<Wall> {
        return await this.wallRepository.createWall(createWallDto, user);
    }

    async getAllWalls(): Promise<Wall[]> {
        return await this.wallRepository.getAllWalls();
    }

    async getWallById(id: number): Promise<Wall> {
        return await this.wallRepository.getWallById(id);
    }

    async deleteWall(id: number): Promise<void> {
        await this.wallRepository.deleteWall(id);
    }

    async updateWall(id: number, updateWallDto: UpdateWallDto): Promise<Wall> {
        return await this.wallRepository.updateWall(id, updateWallDto);
    }

    async getWallByShareableLink(link: string): Promise<Wall> {
        return await this.wallRepository.getWallByShareableLink(link);
    }


}