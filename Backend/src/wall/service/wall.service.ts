import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { WallRepository } from '../repository/wall.repository';
import { CreateWallDto } from '../dtos/create-wall.dto';
import { Wall } from '../entity/wall.entity';
import { UpdateWallDto } from '../dtos/update-wall.dto';
import { REQUEST_USER_KEY } from '../../common/constants/auth.constant';
import { UserRepository } from '../../user/repositories/user.repository';
import { UploadService } from '../../common/services/upload.service';
import { SocialLink } from '../entity/social-links.entity';
import { SocialPlatform } from '../enum/social-platform.enum';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WallVisibility } from '../enum/wall-visibility.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WallService {
  constructor(
    private readonly wallRepository: WallRepository,
    private readonly userRepository: UserRepository,
    private readonly uploadService: UploadService,

    @InjectRepository(SocialLink)
    private readonly socialLinkRepository: Repository<SocialLink>,
  ) {}

  // Generate links
  public async generateLinks(wallId: number, req: Request) {
    try {
      const user = req[REQUEST_USER_KEY];

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

      const uniqueId = uuidv4();
      const baseUrl = 'http://localhost:5173';
      const shareable_link = `${baseUrl}/walls/${wallId}/link/${uniqueId}`;
      const embed_link = `<iframe src="${baseUrl}/walls/${wallId}/link/${uniqueId}" width="600" height="400"></iframe>`;

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
    req: Request,
    wallLogo?: Express.Multer.File,
  ) {
    try {
      const user = req[REQUEST_USER_KEY];
      const { title, logo, description, visibility } = createWallDto;

      let logoUrl: string | null = logo || null;

      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      if (wallLogo) {
        logoUrl = await this.uploadService.logo(wallLogo);
      }

      const wall = this.wallRepository.create({
        title,
        logo: logoUrl,
        description,
        visibility,
        user: existingUser,
      });

      const savedWall = await this.wallRepository.save(wall);

      if (createWallDto.social_links && createWallDto.social_links.length > 0) {
        const socialLinksEntities = createWallDto.social_links.map((link) =>
          this.socialLinkRepository.create({
            platform: link.platform as SocialPlatform,
            url: link.url,
            wall: savedWall,
          }),
        );
        await this.socialLinkRepository.save(socialLinksEntities);
        savedWall.social_links = socialLinksEntities;
      }

      return savedWall;
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create wall');
    }
  }

  async getAllWalls(req: Request): Promise<Wall[]> {
    try {
      const user = req[REQUEST_USER_KEY];

      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }

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
  async getWallById(id: number, req: Request): Promise<Wall> {
    try {
      const user = req[REQUEST_USER_KEY];

      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }

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

  // Get wall by sharable Link
  async getWallBySharableLink(wallId: number): Promise<Wall> {
    try {
      const wall = await this.wallRepository.findOne({
        where: { id: wallId },
        relations: ['tweets'],
      });

      if (!wall) {
        throw new NotFoundException('Wall not found');
      }

      // Check if wall is private
      if (wall.visibility === WallVisibility.PRIVATE) {
        throw new UnauthorizedException(
          'This Wall is private and cannot be accessed via sharable link',
        );
      }

      return wall;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to fetch wall by sharable link',
      );
    }
  }

  async deleteWall(id: number, req: Request) {
    try {
      const user = req[REQUEST_USER_KEY];

      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }

      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) {
        throw new NotFoundException("User doesn't exist");
      }

      const wall = await this.wallRepository.getById(id);

      if (!wall || wall.user.id !== existingUser.id) {
        throw new NotFoundException('Wall not found or access denied');
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
    req: Request,
    logo?: Express.Multer.File,
  ): Promise<Wall> {
    try {
      const user = req[REQUEST_USER_KEY];

      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }

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

      // 🔹 Handle Logo Update
      let logoUrl: string | null = wall.logo;

      if (logo) {
        // Delete old logo if exists
        if (wall.logo) {
          const fileName = wall.logo.split('/').pop();
          if (fileName) {
            await this.uploadService.deleteLogo(fileName);
          }
        }

        // Upload new logo
        logoUrl = await this.uploadService.logo(logo);
      }

      // Update wall properties
      wall.title = updateWallDto.title ?? wall.title;
      wall.description = updateWallDto.description ?? wall.description;
      wall.visibility = updateWallDto.visibility ?? wall.visibility;
      wall.logo = logoUrl;

      // 🔹 Handle Social Links (Update, Add, Delete)
      if (updateWallDto.social_links) {
        const updatedLinks = updateWallDto.social_links.map(
          (linkDto) => linkDto.platform,
        );

        // **DELETE** removed social links
        wall.social_links = await this.socialLinkRepository.find({
          where: { wall: { id: wall.id } },
        });
        for (const existingLink of wall.social_links) {
          if (!updatedLinks.includes(existingLink.platform)) {
            await this.socialLinkRepository.delete({ id: existingLink.id });
          }
        }

        // **UPDATE or ADD** new social links
        for (const linkDto of updateWallDto.social_links) {
          const existingLink = wall.social_links.find(
            (link) => link.platform === linkDto.platform,
          );

          if (existingLink) {
            existingLink.url = linkDto.url;
            await this.socialLinkRepository.save(existingLink);
          } else {
            const newSocialLink = this.socialLinkRepository.create({
              platform: linkDto.platform,
              url: linkDto.url,
              wall,
            });
            await this.socialLinkRepository.save(newSocialLink);
            wall.social_links.push(newSocialLink);
          }
        }
      }

      return await this.wallRepository.save(wall);
    } catch (error) {
      console.error('Error updating wall:', error.message); // Debugging log
      throw new BadRequestException(error.message || 'Failed to update wall');
    }
  }

  // Delete a social link by id
  async deleteSocialLink(
    id: number,
    req: Request,
  ): Promise<{ message: string }> {
    try {
      const user = req[REQUEST_USER_KEY];

      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }

      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) {
        throw new NotFoundException("User doesn't exist");
      }

      const socialLink = await this.socialLinkRepository.findOne({
        where: { id },
        relations: ['wall'],
      });

      if (!socialLink) {
        throw new NotFoundException('Social link not found');
      }

      if (socialLink.wall.user.id !== existingUser.id) {
        throw new UnauthorizedException(
          'You do not have permission to delete this social link',
        );
      }

      await this.socialLinkRepository.delete(id);
      return { message: 'Social link deleted successfully' };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to delete social link',
      );
    }
  }

  async getTotalData(req: Request) {
    const user = req[REQUEST_USER_KEY];

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const existingUser = await this.userRepository.getByEmail(user.email);

    if (!existingUser) {
      throw new NotFoundException("User doesn't exist");
    }

    const result = await this.wallRepository.getTotalData(existingUser.id);

    return result;
  }
}
