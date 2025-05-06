import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { WallRepository } from '../repository/wall.repository';
import { CreateWallDto } from '../dtos/create-wall.dto';
import { Wall } from '../entity/wall.entity';
import { UpdateWallDto } from '../dtos/update-wall.dto';
import { UserRepository } from '../../user/repositories/user.repository';
import { UploadService } from '../../common/services/upload.service';
import { SocialLink } from '../entity/social-links.entity';
import { SocialPlatform } from '../enum/social-platform.enum';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WallVisibility } from '../enum/wall-visibility.enum';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/common/decorator/user.decorater';

import { ConfigService } from '@nestjs/config';
@Injectable()
export class WallService {
  constructor(
    private readonly wallRepository: WallRepository,
    private readonly userRepository: UserRepository,
    private readonly uploadService: UploadService,

    @InjectRepository(SocialLink)
    private readonly socialLinkRepository: Repository<SocialLink>,

    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  // Generate links
  public async generateLinks(wallId: number, user) {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      const wall = await this.wallRepository.getWallByIdAndUser(
        wallId,
        existingUser.id,
      );
      if (!wall || wall.user.id !== existingUser.id) {
        throw new NotFoundException('Wall not found or access denied');
      }

      // Generate UUIDs if they don't exist
      if (!wall.public_uuid) {
        wall.public_uuid = uuidv4();
      }

      if (!wall.private_uuid) {
        wall.private_uuid = uuidv4();
      }

      // Save the wall with updated UUIDs
      await this.wallRepository.save(wall);

      const baseUrl = this.configService.get('appConfig.baseUrl');

      // Generate shareable link based on visibility
      const uuid =
        wall.visibility === WallVisibility.PRIVATE
          ? wall.private_uuid
          : wall.public_uuid;
      const shareable_link = `${baseUrl}/walls/${wallId}/link/${uuid}`;
      const e_link = `${baseUrl}/walls/${wallId}/link/${uuid}?embed=true`;
      const embed_link = `<iframe src="${e_link}" width="600" height="400"></iframe>`;

      return {
        shareable_link,
        embed_link,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to generate links',
      );
    }
  }

  // ReGenerate links
  public async reGenerateLinks(wallId: number, user) {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      const wall = await this.wallRepository.getWallByIdAndUser(
        wallId,
        existingUser.id,
      );
      if (!wall || wall.user.id !== existingUser.id) {
        throw new NotFoundException('Wall not found or access denied');
      }

      wall.public_uuid = uuidv4();

      wall.private_uuid = uuidv4();

      // Save the wall with updated UUIDs
      await this.wallRepository.save(wall);

      const baseUrl = this.configService.get('appConfig.baseUrl');

      // Generate shareable link based on visibility
      const uuid =
        wall.visibility === WallVisibility.PRIVATE
          ? wall.private_uuid
          : wall.public_uuid;
      const shareable_link = `${baseUrl}/walls/${wallId}/link/${uuid}`;
      const e_link = `${baseUrl}/walls/${wallId}/link/${uuid}?embed=true`;
      const embed_link = `<iframe src="${e_link}" width="600" height="400"></iframe>`;

      return {
        shareable_link,
        embed_link,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to generate links',
      );
    }
  }

  // Create wall
  async createWall(
    createWallDto: CreateWallDto,
    @User() user, // Using the custom decorator to get user
    wallLogo?: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      const { title, logo, description, visibility } = createWallDto;
      let { social_links } = createWallDto;

      if (description && description.length > 250) {
        throw new BadRequestException(
          'Description cannot exceed 250 characters',
        );
      }

      let logoUrl: string | null = logo || null;

      // Handle file upload if provided
      if (wallLogo) {
        if (!wallLogo.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
          throw new BadRequestException(
            'Invalid file format. Allowed: JPG, JPEG, PNG',
          );
        }
        try {
          logoUrl = await this.uploadService.logo(wallLogo);
        } catch (error) {
          throw new InternalServerErrorException(
            (error as Error).message ||
              'Failed to upload logo. Please try again.',
          );
        }
      }

      // Parse social_links if it's a string (for handling form-data)
      if (typeof social_links === 'string') {
        try {
          social_links = JSON.parse(social_links);
        } catch (error) {
          console.error('Error parsing social_links:', error);
          throw new BadRequestException('Invalid format for social_links');
        }
      }

      const wall = queryRunner.manager.create(Wall, {
        title,
        logo: logoUrl,
        description,
        visibility,
        user: existingUser,
      });

      const savedWall = await queryRunner.manager.save(wall);

      // Handle social links if provided
      if (social_links && social_links.length > 0) {
        const socialLinksEntities = social_links.map((link) =>
          queryRunner.manager.create(SocialLink, {
            platform: link.platform as SocialPlatform,
            url: link.url,
            wall: savedWall,
          }),
        );
        await queryRunner.manager.save(socialLinksEntities);
        savedWall.social_links = socialLinksEntities;
      }

      await queryRunner.commitTransaction();
      return savedWall;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new BadRequestException(
        (error as Error).message || 'Failed to create wall',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getAllWalls(user): Promise<Wall[]> {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) {
        throw new NotFoundException("User doesn't exist");
      }

      return await this.wallRepository.find({
        where: { user: { id: existingUser.id } },
      });
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to fetch walls');
    }
  }

  // Get wall by ID
  async getWallById(id: number, user): Promise<Wall> {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) {
        throw new NotFoundException("User doesn't exist");
      }

      const wall = await this.wallRepository.getById(id);

      if (!wall || wall.user.id !== existingUser.id) {
        throw new NotFoundException('Wall not found or access denied');
      }

      return wall;
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to fetch wall');
    }
  }

  async getPublicWallById(id: number): Promise<Wall> {
    try {
      const wall = await this.wallRepository.findOne({
        where: { id },
        relations: ['tweets', 'social_links'],
      });

      if (!wall) {
        throw new NotFoundException('Wall not found');
      }

      // Only count views for public walls
      if (wall.visibility === WallVisibility.PUBLIC) {
        wall.views = (wall.views || 0) + 1;
        await this.wallRepository.save(wall);
      }

      return wall;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to fetch wall');
    }
  }

  // Get wall by sharable Link
  async getWallBySharableLink(wallId: number, uuid: string): Promise<Wall> {
    try {
      // Find the wall by ID
      const wall = await this.wallRepository.findOne({
        where: { id: wallId },
        relations: ['tweets', 'social_links'],
      });

      if (!wall) {
        throw new NotFoundException('Wall not found');
      }

      // Check if the provided UUID matches based on visibility
      const validUuid =
        wall.visibility === WallVisibility.PRIVATE
          ? wall.private_uuid === uuid
          : wall.public_uuid === uuid;

      if (!validUuid) {
        throw new UnauthorizedException(
          'Invalid link or insufficient permissions',
        );
      }

      // Count views for both public and private walls accessed by valid link
      wall.views = (wall.views || 0) + 1;
      await this.wallRepository.save(wall);

      return wall;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to fetch wall by sharable link',
      );
    }
  }

  async deleteWall(id: number, user) {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) {
        throw new NotFoundException("User doesn't exist");
      }

      const wall = await this.wallRepository.getById(id);

      if (!wall || wall.user.id !== existingUser.id) {
        throw new NotFoundException('Wall not found or access denied');
      }

      if (wall.logo) {
        const fileName = wall.logo.split('/').pop();
        if (fileName) await this.uploadService.deleteLogo(fileName);
      }

      await this.wallRepository.delete(id);
      return { message: 'Wall deleted successfully' };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to delete wall');
    }
  }

  async updateWall(
    id: number,
    updateWallDto: UpdateWallDto,
    user,
    logo?: Express.Multer.File,
  ): Promise<Wall> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await this.userRepository.getByEmail(user.email);

      if (!existingUser) {
        throw new NotFoundException("User doesn't exist");
      }

      // Find the existing wall
      const wall = await this.wallRepository.getById(id);

      if (!wall) {
        throw new NotFoundException(`Wall with ID ${id} not found`);
      }

      // Ensure the user owns the wall
      if (wall.user.id !== existingUser.id) {
        throw new UnauthorizedException(
          'You do not have permission to update this wall',
        );
      }

      let logoUrl: string | null = wall.logo;

      // Handle Logo Update with Format Validation
      if (logo) {
        if (!logo.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
          throw new BadRequestException(
            'Invalid file format. Allowed: JPG, JPEG, PNG',
          );
        }

        // Delete old logo if exists
        if (wall.logo) {
          const fileName = wall.logo.split('/').pop();
          if (fileName) {
            await this.uploadService.deleteLogo(fileName);
          }
        }

        // Upload new logo
        try {
          logoUrl = await this.uploadService.logo(logo);
        } catch (error) {
          throw new InternalServerErrorException(
            error.message || 'Failed to upload logo. Please try again.',
          );
        }
      }

      // Validate description length
      if (updateWallDto.description && updateWallDto.description.length > 250) {
        throw new BadRequestException(
          'Description cannot exceed 250 characters',
        );
      }
      if (typeof updateWallDto.social_links === 'string') {
        try {
          updateWallDto.social_links = JSON.parse(updateWallDto.social_links);
        } catch (error) {
          console.error('Error parsing social_links:', error);
          throw new BadRequestException('Invalid format for social_links');
        }
      }
      // Update wall properties
      wall.title = updateWallDto.title ?? wall.title;
      wall.description = updateWallDto.description ?? wall.description;
      wall.visibility = updateWallDto.visibility ?? wall.visibility;
      wall.logo = logoUrl;

      // Save updated wall
      const updatedWall = await queryRunner.manager.save(wall);

      // Handle Social Links (Update, Add, Delete)
      if (updateWallDto.social_links && updateWallDto.social_links.length > 0) {
        const updatedLinks = updateWallDto.social_links.map(
          (linkDto) => linkDto.platform,
        );

        // **DELETE** removed social links
        const existingLinks = await this.socialLinkRepository.find({
          where: { wall: { id: wall.id } },
        });
        for (const existingLink of existingLinks) {
          if (!updatedLinks.includes(existingLink.platform)) {
            await queryRunner.manager.delete(SocialLink, {
              id: existingLink.id,
            });
          }
        }

        // **UPDATE or ADD** new social links
        for (const linkDto of updateWallDto.social_links) {
          const existingLink = existingLinks.find(
            (link) => link.platform === linkDto.platform,
          );

          if (existingLink) {
            existingLink.url = linkDto.url;
            await queryRunner.manager.save(existingLink);
          } else {
            const newSocialLink = queryRunner.manager.create(SocialLink, {
              platform: linkDto.platform,
              url: linkDto.url,
              wall: updatedWall,
            });
            await queryRunner.manager.save(newSocialLink);
          }
        }
      }

      await queryRunner.commitTransaction();
      return updatedWall;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Failed to update wall');
    } finally {
      await queryRunner.release();
    }
  }

  async getTotalData(user) {
    const existingUser = await this.userRepository.getByEmail(user.email);

    if (!existingUser) {
      throw new NotFoundException("User doesn't exist");
    }

    const result = await this.wallRepository.getTotalData(existingUser.id);

    return result;
  }

  // Search for walls based on the provided keyword
  async searchWalls(keyword: string, user): Promise<Wall[]> {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);

      if (!existingUser) {
        throw new NotFoundException("User doesn't exist");
      }
      if (!keyword) {
        throw new BadRequestException('Search keyword is required');
      }

      const walls = await this.wallRepository.searchWallsByKeyword(keyword);
      return walls;
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to search walls');
    }
  }

  async getPublicWall(): Promise<Wall[]> {
    return await this.wallRepository.find({
      where: {
        visibility: WallVisibility.PUBLIC,
      },
    });
  }
}
