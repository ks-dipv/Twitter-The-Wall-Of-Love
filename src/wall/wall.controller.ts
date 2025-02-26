import { Controller, Post, Get, Param, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { WallService } from './service/wall.service';
import { CreateWallDto } from './dtos/create-wall.dto';
import { Patch } from '@nestjs/common';
import { UpdateWallDto } from './dtos/update-wall.dto';
@Controller('api/walls')
// @UseGuards(AuthGuard('jwt'))
export class WallController {
    constructor(private readonly wallService: WallService) { }

    // Create a new Wall
    @Post('entry')
    async createWall(@Body() createWallDto: CreateWallDto, @Request() req) {
        return await this.wallService.createWall(createWallDto, req.user);
    }

    // Get all Walls for the logged-in user
    @Get('list')
    async getAllWalls(@Request() req) {
        return await this.wallService.getAllWalls();
    }

    // Get a specific Wall by ID
    @Get(':id')
    async getWallById(@Param('id') id: number, @Request() req) {
        return await this.wallService.getWallById(id);
    }

    // Delete a Wall by ID
    @Delete(':id')
    async deleteWall(@Param('id') id: number, @Request() req) {
        await this.wallService.deleteWall(id);
        return { message: 'Wall deleted successfully' };
    }

    //Update a wall by ID 
    @Patch(':id')
    async updateWall(@Param('id') id: number, @Body() updateWallDto: UpdateWallDto, @Request() req) {
        return await this.wallService.updateWall(id, updateWallDto);
    }

    @Get('share/:link')
    async getWallByShareableLink(@Param('link') link: string) {
        return await this.wallService.getWallByShareableLink(link);
    }

}
