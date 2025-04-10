import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Body,
  Put,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { WallService } from './service/wall.service';
import { CreateWallDto } from './dtos/create-wall.dto';
import { UpdateWallDto } from './dtos/update-wall.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { User } from 'src/common/decorator/user.decorater';
import { CommonApiDecorators } from 'src/common/decorator/common-api.decorator';

@ApiTags('Walls')
@Controller('api/walls')
export class WallController {
  constructor(private readonly wallService: WallService) {}

  @Post()
  @CommonApiDecorators({
    summary: 'Create a new Wall',
    successStatus: 201,
    successDescription: 'Wall created successfully',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  async createWall(
    @Body() createWallDto: CreateWallDto,
    @User() user,

    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return await this.wallService.createWall(createWallDto, user, logo);
  }

  @Get()
  @CommonApiDecorators({
    summary: 'Get all Walls for the logged-in user',
    successDescription: 'List of walls retrieved',
  })
  async getAllWalls(@User() user) {
    return await this.wallService.getAllWalls(user);
  }

  @Get(':id')
  @CommonApiDecorators({
    summary: 'Get a specific Wall by ID',
    successDescription: 'Wall details retrieved',
    errorStatus: 404,
    errorDescription: 'Wall not found',
  })
  @ApiParam({ name: 'id', description: 'ID of the Wall', type: Number })
  async getWallById(@Param('id') id: number, @User() user) {
    return await this.wallService.getWallById(id, user);
  }

  @Post(':wallId/generate-link')
  @CommonApiDecorators({
    summary: 'Generate a shareable link for a Wall',
    successDescription: 'Shareable link generated',
    errorStatus: 404,
    errorDescription: 'Wall not found',
  })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  async generateLink(@Param('wallId') wallId: number, @User() user) {
    return await this.wallService.generateLinks(wallId, user);
  }

  @Get(':wallId/link/:uuid')
  @CommonApiDecorators({
    summary: 'Get a Wall by shareable link',
    successDescription: 'Wall details retrieved',
    errorStatus: 404,
    errorDescription: 'Wall not found',
  })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  @ApiParam({
    name: 'uuid',
    description: 'Unique identifier for the shareable link',
    type: String,
  })
  async getWallBySharableLink(@Param('wallId') wallId: number) {
    return await this.wallService.getWallBySharableLink(wallId);
  }

  @Delete(':id')
  @CommonApiDecorators({
    summary: 'Delete a Wall by ID',
    successDescription: 'Wall deleted successfully',
    errorStatus: 404,
    errorDescription: 'Wall not found',
  })
  @ApiParam({ name: 'id', description: 'ID of the Wall', type: Number })
  async deleteWall(@Param('id') id: number, @User() user) {
    return await this.wallService.deleteWall(id, user);
  }

  @Put(':id')
  @CommonApiDecorators({
    summary: 'Update a Wall by ID',
    successDescription: 'Wall updated successfully',
    errorStatus: 404,
    errorDescription: 'Wall not found',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID of the Wall', type: Number })
  @ApiBody({ type: UpdateWallDto })
  @UseInterceptors(FileInterceptor('logo'))
  async updateWall(
    @Param('id') id: number,
    @Body() updateWallDto: UpdateWallDto,
    @User() user,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return await this.wallService.updateWall(id, updateWallDto, user, logo);
  }

  @Post('total-data')
  @CommonApiDecorators({
    summary: 'Get total data of walls',
    successDescription: 'Total data retrieved successfully',
    errorStatus: 401,
    errorDescription: 'Unauthorized',
  })
  async getTotaData(@User() user) {
    return await this.wallService.getTotalData(user);
  }

  @Post('/search')
  @ApiQuery({
    name: 'search',
    description: 'Keyword to search in wall title or description',
    required: true,
    type: String,
  })
  async searchWalls(@Query('q') keyword: string, @User() user) {
    return await this.wallService.searchWalls(keyword, user);
  }
}
