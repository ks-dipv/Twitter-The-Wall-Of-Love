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
import { REQUEST_USER_KEY } from 'src/user/constants/auth.constant';
import { UserRepository } from 'src/user/repositories/user.repository';
import { UploadService } from 'src/user/services/upload.service';
import { SocialLink } from '../entity/social-links.entity';
import { SocialPlatform } from '../enum/social-platform.enum';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WallService {
  constructor(
    private readonly wallRepository: WallRepository,
    private readonly userRepository: UserRepository,
    private readonly uploadService: UploadService,

    @InjectRepository(SocialLink)
    private readonly socialLinkRepository: Repository<SocialLink>,
  ) {}

  async createWall(
    createWallDto: CreateWallDto,
    req: Request,
    wallLogo?: Express.Multer.File,
  ) {
    const user = req[REQUEST_USER_KEY];
    const { title, logo, description, visibility } = createWallDto;

    let logoUrl: string | null = logo || null;

    const existingUser = await this.userRepository.getByEmail(user.email);
    if (!existingUser) {
      throw new Error('User not found');
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
  }

  async getAllWalls(req: Request): Promise<Wall[]> {
    const user = req[REQUEST_USER_KEY];

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const existingUser = await this.userRepository.getByEmail(user.email);
    if (!existingUser) {
      throw new BadRequestException("User doesn't exist");
    }

    return await this.wallRepository.find({
      where: { user: { id: existingUser.id } },
    });
  }

  async getWallById(id: number, req: Request): Promise<Wall> {
    const user = req[REQUEST_USER_KEY];

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const existingUser = await this.userRepository.getByEmail(user.email);
    if (!existingUser) {
      throw new BadRequestException("User doesn't exist");
    }

    const wall = await this.wallRepository.getById(id);

    if (!wall || wall.user.id !== existingUser.id) {
      throw new NotFoundException('Wall not found or access denied');
    }

    return wall;
  }

  async deleteWall(id: number, req: Request) {
    const user = req[REQUEST_USER_KEY];

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const existingUser = await this.userRepository.getByEmail(user.email);
    if (!existingUser) {
      throw new BadRequestException("User doesn't exist");
    }

    const wall = await this.wallRepository.getById(id);

    if (!wall || wall.user.id !== existingUser.id) {
      throw new NotFoundException('Wall not found or access denied');
    }

    await this.wallRepository.delete(id);
    return { message: 'Wall deleted successfully' };
  }

  async updateWall(
    id: number,
    updateWallDto: UpdateWallDto,
    req: Request,
    logo?: Express.Multer.File,
  ): Promise<Wall> {
    const user = req[REQUEST_USER_KEY];

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const existingUser = await this.userRepository.getByEmail(user.email);

    if (!existingUser) {
      throw new BadRequestException("User doesn't exist");
    }

    // Find the existing wall
    const wall = await this.wallRepository.getById(id);

    if (!wall) {
      throw new NotFoundException(`Wall with ID ${id} not found`);
    }

    // Ensure the user owns the wall
    if (wall.user.id !== existingUser.id) {
      throw new NotFoundException(
        'You do not have permission to update this wall',
      );
    }

    let logoUrl: string | null = wall.logo;

    if (logo) {
      if (wall.logo) {
        const fileName = wall.logo.split('/').pop();
        if (fileName) {
          await this.uploadService.deleteLogo(fileName);
        }
      }

      logoUrl = await this.uploadService.logo(logo);
    }

    // Update wall properties
    wall.title = updateWallDto.title ?? wall.title;
    wall.description = updateWallDto.description ?? wall.description;
    wall.visibility = updateWallDto.visibility ?? wall.visibility;
    wall.logo = logoUrl;

    // Update Social Links (Replace old ones)
    if (updateWallDto.social_links && updateWallDto.social_links.length > 0) {
      await this.socialLinkRepository.delete({ wall: { id } });

      const newSocialLinks = updateWallDto.social_links.map((link) =>
        this.socialLinkRepository.create({
          platform: link.platform as SocialPlatform,
          url: link.url,
          wall,
        }),
      );
      await this.socialLinkRepository.save(newSocialLinks);
      wall.social_links = newSocialLinks;
    }

    return await this.wallRepository.save(wall);
  }
}
