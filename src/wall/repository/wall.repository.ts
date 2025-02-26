import { Repository, DataSource } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Wall } from '../entity/wall.entity';
import { CreateWallDto } from '../dtos/create-wall.dto';
import { User } from 'src/user/entity/user.entity';
import { UpdateWallDto } from '../dtos/update-wall.dto';
@Injectable()
export class WallRepository extends Repository<Wall> {
    constructor(private dataSource: DataSource) {
        super(Wall, dataSource.createEntityManager());
    }

    // Create a wall
    async createWall(createWallDto: CreateWallDto, user: User): Promise<Wall> {
        const { title, logo, description, visibility } = createWallDto;
        const wall = this.create({ title, logo, description, visibility, user });

        // Generate links before saving
        wall.generateLinks();
        return await this.save(wall);
    }

    // Get all walls
    async getAllWalls(): Promise<Wall[]> {
        return await this.find();
    }

    // Get wall by ID
    async getWallById(id: number): Promise<Wall> {
        const wall = await this.findOne({ where: { id } });
        if (!wall) throw new NotFoundException('Wall not found');
        return wall;
    }

    // Delete wall
    async deleteWall(id: number): Promise<void> {
        const result = await this.delete(id);
        if (result.affected === 0) throw new NotFoundException('Wall not found');
    }

    // Update wall
    async updateWall(id: number, updateWallDto: UpdateWallDto): Promise<Wall> {
        const wall = await this.getWallById(id);
        Object.assign(wall, updateWallDto);
        return await this.save(wall);
    }

    //  Get Wall By Shareable Link
    async getWallByShareableLink(link: string): Promise<Wall> {
        console.log("Searching for shareable link:", link);

        const wall = await this.findOne({ where: { shareable_link: link } });

        if (!wall) {
            console.log("No wall found with this link");
            throw new NotFoundException(`Wall with shareable link not found`);
        }

        return wall;
    }


}
