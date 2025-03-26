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
  ClassSerializerInterceptor,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WallService } from './service/wall.service';
import { CreateWallDto } from './dtos/create-wall.dto';
import { UpdateWallDto } from './dtos/update-wall.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('Walls')
@Controller('api/walls')
export class WallController {
  constructor(private readonly wallService: WallService) {}

  // Create a new Wall
  @Post()
  @ApiOperation({ summary: 'Create a new Wall' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Wall created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @UseInterceptors(FileInterceptor('logo'), ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createWall(
    @Body() createWallDto: CreateWallDto,
    @Request() req,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return await this.wallService.createWall(createWallDto, req, logo);
  }

  // Get all Walls for the logged-in user
  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get all Walls for the logged-in user' })
  @ApiResponse({ status: 200, description: 'List of walls retrieved' })
  async getAllWalls(@Request() req) {
    return await this.wallService.getAllWalls(req);
  }

  // Get a specific Wall by ID
  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get a specific Wall by ID' })
  @ApiParam({ name: 'id', description: 'ID of the Wall', type: Number })
  @ApiResponse({ status: 200, description: 'Wall details retrieved' })
  @ApiResponse({ status: 404, description: 'Wall not found' })
  async getWallById(@Param('id') id: number, @Request() req) {
    return await this.wallService.getWallById(id, req);
  }

  @Post(':wallId/generate-link')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Generate a shareable link for a Wall' })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  @ApiResponse({ status: 200, description: 'Shareable link generated' })
  @ApiResponse({ status: 404, description: 'Wall not found' })
  async generateLink(@Param('wallId') wallId: number, @Request() req) {
    return await this.wallService.generateLinks(wallId, req);
  }

  // Get Wall by sharable link
  @Get(':wallId/link/:uuid')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get a Wall by shareable link' })
  @ApiParam({ name: 'wallId', description: 'ID of the Wall', type: Number })
  @ApiParam({
    name: 'uuid',
    description: 'Unique identifier for the shareable link',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Wall details retrieved' })
  @ApiResponse({ status: 404, description: 'Wall not found' })
  async getWallBySharableLink(@Param('wallId') wallId: number) {
    return await this.wallService.getWallBySharableLink(wallId);
  }

  // Delete a Wall by ID
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Wall by ID' })
  @ApiParam({ name: 'id', description: 'ID of the Wall', type: Number })
  @ApiResponse({ status: 200, description: 'Wall deleted successfully' })
  @ApiResponse({ status: 404, description: 'Wall not found' })
  async deleteWall(@Param('id') id: number, @Request() req) {
    return await this.wallService.deleteWall(id, req);
  }

  //Update a wall by ID
  @Put(':id')
  @ApiOperation({ summary: 'Update a Wall by ID' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID of the Wall', type: Number })
  @ApiBody({ type: UpdateWallDto })
  @ApiResponse({ status: 200, description: 'Wall updated successfully' })
  @ApiResponse({ status: 404, description: 'Wall not found' })
  @UseInterceptors(FileInterceptor('logo'), ClassSerializerInterceptor)
  async updateWall(
    @Param('id') id: number,
    @Body() updateWallDto: UpdateWallDto,
    @Request() req,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return await this.wallService.updateWall(id, updateWallDto, req, logo);
  }

  @Post('total-data')
  @ApiOperation({ summary: 'Get total data of walls' })
  @ApiResponse({
    status: 200,
    description: 'Total data retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTotaData(@Request() req) {
    return await this.wallService.getTotalData(req);
  }
}
