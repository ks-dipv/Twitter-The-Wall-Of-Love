import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Body,
  Request,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { WallService } from './service/wall.service';
import { CreateWallDto } from './dtos/create-wall.dto';
import { UpdateWallDto } from './dtos/update-wall.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/walls')
export class WallController {
  constructor(private readonly wallService: WallService) {}

  // Create a new Wall
  @Post('entry')
  @UseInterceptors(FileInterceptor('logo'))
  async createWall(
    @Body() createWallDto: CreateWallDto,
    @Request() req,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return await this.wallService.createWall(createWallDto, req, logo);
  }

  // Get all Walls for the logged-in user
  @Get('list')
  async getAllWalls(@Request() req) {
    return await this.wallService.getAllWalls(req);
  }

  // Get a specific Wall by ID
  @Get('fetch/:id')
  async getWallById(@Param('id') id: number, @Request() req) {
    return await this.wallService.getWallById(id, req);
  }

  // Delete a Wall by ID
  @Delete('remove/:id')
  async deleteWall(@Param('id') id: number, @Request() req) {
    return await this.wallService.deleteWall(id, req);
  }

  //Update a wall by ID
  @Put('update/:id')
  @UseInterceptors(FileInterceptor('logo'))
  async updateWall(
    @Param('id') id: number,
    @Body() updateWallDto: UpdateWallDto,
    @Request() req,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return await this.wallService.updateWall(id, updateWallDto, req, logo);
  }
}
